package worker

import (
	"encoding/json"
	"log"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	"github.com/streadway/amqp"
)

type Worker struct {
	matchRepository repository.MatchRepository
	rabbitUrl       string
	queueName       string
	conn            *amqp.Connection
	channel         *amqp.Channel
}

func connectRabbitMQ(url string) (*amqp.Connection, *amqp.Channel, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, nil, err
	}
	return conn, ch, nil
}

func NewWorker(rabbitUrl, queueName string, matchRepository repository.MatchRepository) (*Worker, error) {
	conn, err := amqp.Dial(rabbitUrl)
	if err != nil {
		return nil, err
	}

	channel, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	return &Worker{
		matchRepository: matchRepository,
		rabbitUrl:       rabbitUrl,
		queueName:       queueName,
		conn:            conn,
		channel:         channel,
	}, nil
}

func (w *Worker) DeclareQueue() error {
	_, err := w.channel.QueueDeclare(
		w.queueName, // name
		true,        // durable
		false,       // delete when unused
		false,       // exclusive
		false,       // no-wait
		nil,         // arguments
	)
	return err
}

// ConsumeMessages starts consuming messages from the queue.
func (w *Worker) ConsumeMessages() (<-chan amqp.Delivery, error) {
	return w.channel.Consume(
		w.queueName, // queue
		"",          // consumer tag
		true,        // auto-acknowledge
		false,       // exclusive
		false,       // no-local
		false,       // no-wait
		nil,         // arguments
	)
}

func (w *Worker) Run() {
	msgs, err := w.ConsumeMessages()
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
	}

	// Handle messages asynchronously
	go func() {
		for msg := range msgs {
			var matchRequestMessage model.MatchRequestMessage
			err := json.Unmarshal(msg.Body, &matchRequestMessage)
			if err != nil {
				log.Printf("Error unmarshalling message: %v", err)
				continue
			}

			w.HandleMessage(matchRequestMessage)
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	select {} // Block forever
}

func (w *Worker) GetMatch(request model.Match) (*model.Match, error) {
	// 1. check requests with same category and complexity
	data, err := w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Category:   request.Category,
		Complexity: request.Complexity,
	})
	if err != nil {
		return nil, err
	}

	if len(data) > 0 {
		return &data[0], nil
	}

	// 2. check requests with same complexity
	data, err = w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Complexity: request.Complexity,
	})
	if err != nil {
		return nil, err
	}

	if len(data) > 0 {
		return &data[0], nil
	}
	// 3. check requests with same category
	data, err = w.matchRepository.GetPossibleMatchesForUser(request.UserId, model.GetMatchFilter{
		Category: request.Category,
	})
	if err != nil {
		return nil, err
	}

	if len(data) > 0 {
		return &data[0], nil
	}

	// 4. If no match return
	return nil, nil
}

func (w *Worker) HandleMessage(req model.MatchRequestMessage) error {
	match, err := w.matchRepository.GetMatch(req.Id.String())
	if err != nil {
		log.Printf("Error unmarshalling message: %v", err)
		return err
	}

	otherMatch, err := w.GetMatch(match)
	if err != nil {
		return err
	}

	if otherMatch == nil {
		return nil
	}

	// TODO: Create collaboration service message

	// Update the 2 user's match status
	w.matchRepository.UpdateMatch(otherMatch.Id.String(), model.UpdateMatchRequest{
		UserId:     match.UserId,
		Category:   match.Category,
		Complexity: match.Complexity,
		HasMatch:   true,
	})

	w.matchRepository.UpdateMatch(match.Id.String(), model.UpdateMatchRequest{
		UserId:     match.UserId,
		Category:   match.Category,
		Complexity: match.Complexity,
		HasMatch:   true,
	})

	return nil
}

func (w *Worker) Close() {
	w.channel.Close()
	w.conn.Close()
}
