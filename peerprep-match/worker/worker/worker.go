package worker

import (
	"encoding/json"
	"log"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/api/model"
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

func (w *Worker) HandleMessage(req model.MatchRequestMessage) {
	// Check DB for any potential matches

	// 1. check requests with same category and complexity
	// 2. check requests with same complexity
	// 3. check requests with same category
	// 4. If no match return

	// If got match, update DB status and create message for
	// collaboration

}

func (w *Worker) Close() {
	w.channel.Close()
	w.conn.Close()
}
