package worker

import (
	"log"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/common/rabbitmq"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
)

type Worker struct {
	matchRepository repository.MatchRepository
	matchingRMQConn *rabbitmq.RabbitMQConn
	collabRMQConn   *rabbitmq.RabbitMQConn
}

func NewWorker(matchRepository repository.MatchRepository) (*Worker, error) {
	conn, err := rabbitmq.ConnectRabbitMQ("MATCHING_RMQ_URI", "MATCHING_QUEUE")
	if err != nil {
		log.Fatal("Error connecting to rabbit mq")
		return nil, err
	}
	collabMqConn, err := rabbitmq.ConnectRabbitMQ("COLLAB_RMQ_URI", "COLLAB_QUEUE")
	if err != nil {
		log.Fatalf("Failed to connect to rabbitmq: %v", err)
		return nil, err
	}

	return &Worker{
		matchRepository: matchRepository,
		matchingRMQConn: conn,
		collabRMQConn:   collabMqConn,
	}, nil
}

func (w *Worker) Run() {
	// Handle messages asynchronously
	msgs, err := w.matchingRMQConn.Consume()
	if err != nil {
		log.Fatalf("Failed to consume messages: %v", err)
	}
	go func() {
		for msg := range msgs {
			log.Printf("Consumed msg: %s, logging queue status", msg.Body)
			w.matchingRMQConn.LogQueueStatus()
			var matchRequestMessage model.MatchRequestMessage
			err := matchRequestMessage.UnmarshalJSON(msg.Body)
			if err != nil {
				log.Printf("Error unmarshalling message: %v", err)
				continue
			}

			w.HandleMessage(matchRequestMessage)
			log.Printf("Done with processing msg, logging queue status")
			w.matchingRMQConn.LogQueueStatus()
			time.Sleep(time.Second)
			msg.Ack(false)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	select {} // Block forever
}

func (w *Worker) GetMatch(request model.Match) (*model.Match, error) {
	// 1. check requests with same category and complexity
	log.Printf("Looking for match requests with the same category and complexity")
	data, err := w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Category:   request.Category,
		Complexity: request.Complexity,
	})
	if err != nil {
		return nil, err
	}

	if len(data) > 0 {
		log.Printf("Found %d match requests with the same category and complexity, matching with the oldest one.", len(data))
		return &data[0], nil
	}

	// 2. check requests with same complexity
	log.Printf("None with same category and complexity. Looking for match requests with the same complexity.")
	data, err = w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Complexity: request.Complexity,
	})
	if err != nil {
		return nil, err
	}

	if len(data) > 0 {
		log.Printf("Found %d match requests with the same complexity, matching with the oldest one.", len(data))
		return &data[0], nil
	}
	// 3. check requests with same category
	log.Printf("None with same complexity. Looking for match requests with the same category.")
	data, err = w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Category: request.Category,
	})
	if err != nil {
		log.Printf("Found %d match requests with the same category, matching with the oldest one.", len(data))
		return nil, err
	}

	if len(data) > 0 {
		return &data[0], nil
	}

	// 4. If no match return
	return nil, nil
}

func (w *Worker) HandleMessage(req model.MatchRequestMessage) error {
	match, err := w.matchRepository.GetMatch(req.Id)
	if err != nil {
		log.Printf("Error getting match: %v", err)
		return err
	}

	// theres an edge case where the req has already been matched
	// if so we don't want to match again
	if match.HasMatch {
		log.Printf("Has already been matched")
		return nil
	}

	otherMatch, err := w.GetMatch(match)
	if err != nil {
		return err
	}

	if otherMatch == nil {
		log.Printf("No match found")
		return nil
	}

	log.Printf("Found match for Id: %s , matched Id: %s", req.Id, otherMatch.Id)

	var complexity string
	var category string

	if match.Complexity == otherMatch.Complexity {
		complexity = match.Complexity
	} else {
		complexity = ""
		if match.Complexity == "All" && otherMatch.Complexity != "All" {
			complexity = otherMatch.Complexity
		}
		if match.Complexity != "All" && otherMatch.Complexity == "All" {
			complexity = match.Complexity
		}
	}
	if match.Category == otherMatch.Category {
		category = match.Category
	} else {
		category = ""
		if match.Category == "All" && otherMatch.Category != "All" {
			category = otherMatch.Category
		}
		if match.Category != "All" && otherMatch.Category == "All" {
			category = match.Category
		}
	}

	collab_message := model.CollabMessage{
		UserId1:    match.UserId,
		UserId2:    otherMatch.UserId,
		MatchId1:   match.Id.Hex(),
		MatchId2:   otherMatch.Id.Hex(),
		Complexity: complexity,
		Category:   category,
	}
	w.collabRMQConn.Publish(collab_message)
	log.Printf("Publishing to the collab mq - %s", collab_message)

	// Update the 2 user's match status
	w.matchRepository.UpdateMatch(otherMatch.Id, model.UpdateMatchRequest{
		UserId:     otherMatch.UserId,
		Category:   otherMatch.Category,
		Complexity: otherMatch.Complexity,
		HasMatch:   true,
	})

	w.matchRepository.UpdateMatch(match.Id, model.UpdateMatchRequest{
		UserId:     match.UserId,
		Category:   match.Category,
		Complexity: match.Complexity,
		HasMatch:   true,
	})
	return nil
}

func (w *Worker) DeclareQueues() error {
	err := w.matchingRMQConn.DeclareQueue()
	if err != nil {
		return err
	}
	return w.collabRMQConn.DeclareQueue()
}

func (w *Worker) Close() {
	w.matchingRMQConn.Close()
}
