package main

import (
	"log"

	db "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/worker/worker"
)

func main() {
	mongoClient := db.ConnectDB()
	// TODO: Set them as a global variable or env variable
	rabbitURL := "amqp://guest:guest@localhost:5672/"
	queueName := "test"
	questionRepository := repository.NewRepository(mongoClient)

	worker, err := worker.NewWorker(rabbitURL, queueName, questionRepository)
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
		return
	}
	defer worker.Close()

	if err = worker.DeclareQueue(); err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
		return
	}

	worker.Run()
}
