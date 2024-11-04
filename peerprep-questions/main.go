package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/rs/cors"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/controller"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/db"
	repository "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/respository"
)

func main() {
	mongoClient := db.ConnectDB()
	questionRepository := repository.NewRepository(mongoClient)
	questionController := controller.NewQuestionController(questionRepository)

	r := chi.NewRouter()
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"*"},
	})

	r.Use(middleware.Logger)
	r.Use(c.Handler)
	r.Route("/question", func(r chi.Router) {
		r.Get("/", questionController.ListQuestions)
		r.Post("/", questionController.CreateQuestion)
		r.Put("/{id}", questionController.UpdateQuestion)
		r.Delete("/{id}", questionController.DeleteQuestion)
		r.Get("/{id}", questionController.GetQuestion)
		r.Post("/get-random", questionController.GetRandomQuestion)
	})
	log.Println("Running on port 3001")
	http.ListenAndServe(":3001", r)
}
