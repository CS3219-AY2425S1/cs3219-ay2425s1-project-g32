package messagequeue

import (
	"encoding/json"
	"log"
	"os"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"github.com/joho/godotenv"
	"github.com/streadway/amqp"
)

type RabbitMQConn struct {
	RabbitUrl string
	QueueName string
	Conn      *amqp.Connection
	Channel   *amqp.Channel
}

func ConnectRabbitMQ() (*RabbitMQConn, error) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
		return nil, err
	}
	uri := os.Getenv("RABBIT_MQ_URI")
	conn, err := amqp.Dial(uri)
	queue_name := os.Getenv("RABBIT_MQ_NAME")
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	mqConn := RabbitMQConn{
		RabbitUrl: uri,
		QueueName: queue_name,
		Conn:      conn,
		Channel:   ch,
	}

	return &mqConn, nil
}

func (r *RabbitMQConn) Publish(msg model.MatchRequestMessage) error {
	body, err := json.Marshal(msg)
	if err != nil {
		log.Fatal("Error marshalling message, %s", err)
		return err
	}
	log.Println("Publishing MQ message")
	err = r.Channel.Publish(
		"",          // Exchange
		r.QueueName, // Routing key (queue name)
		false,       // Mandatory
		false,       // Immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		},
	)
	return err
}
