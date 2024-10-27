package main

import (
	"log"

	db "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	worker "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/worker/matchworker"
)

func main() {
	mongoClient := db.ConnectDB()
	// TODO: Set them as a global variable or env variable
	questionRepository := repository.NewRepository(mongoClient)

	worker, err := worker.NewWorker(questionRepository)
	if err != nil {
		log.Fatalf("Failed to register consumer: %v", err)
		return
	}
	defer worker.Close()

	if err = worker.DeclareQueues(); err != nil {
		log.Fatalf("Failed to declare queues: %v", err)
		return
	}

	worker.Run()
}
