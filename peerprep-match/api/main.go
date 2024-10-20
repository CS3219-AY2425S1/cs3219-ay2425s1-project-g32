package main

import (
	"log"
	"net/http"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/api/controller"
	authMiddleware "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/api/middleware"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/messagequeue"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/rs/cors"
)

func main() {
	// connect to db
	mongoClient := db.ConnectDB()
	// connect to messagequeue
	mqConn, err := messagequeue.ConnectRabbitMQ()
	if err != nil {
		log.Fatalf("Failed to connect to rabbitmq: %v", err)
		return
	}
	mqConn.DeclareQueue()
	questionRepository := repository.NewRepository(mongoClient)
	controller := controller.NewMatchController(questionRepository, mqConn)

	r := chi.NewRouter()
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
	})

	r.Use(middleware.Logger)
	r.Use(authMiddleware.Auth)
	r.Use(c.Handler)
	r.Route("/match", func(r chi.Router) {
		r.Post("/", controller.Match)
		r.Get("/poll/{id}", controller.Poll)
		r.Post("/cancel", controller.Cancel)
	})
	log.Println("Running on port 3003")
	http.ListenAndServe(":3003", r)
}
