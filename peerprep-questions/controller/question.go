package controller

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/model"
	repository "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/respository"
	"github.com/go-chi/chi"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type QuestionController struct {
	questionRepository repository.QuestionRepository
}

func NewQuestionController(questionRepository repository.QuestionRepository) QuestionController {
	return QuestionController{
		questionRepository: questionRepository,
	}
}

func (qc QuestionController) CreateQuestion(w http.ResponseWriter, r *http.Request) {
	var question model.Question
	if err := json.NewDecoder(r.Body).Decode(&question); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Validation

	// Set to DB
	result, err := qc.questionRepository.CreateQuestion(question)
	
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			http.Error(w, "A question with this title already exists", http.StatusConflict)
			return
        }
		log.Fatal("Error creating question")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	question.Id = result.InsertedID.(primitive.ObjectID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(question)
}

func (qc QuestionController) ListQuestions(w http.ResponseWriter, r *http.Request) {
	// parse pagination/filter if need

	// Get from DB
	questions, err := qc.questionRepository.ListQuestions()
	if err != nil {
		log.Printf("Error getting all question")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(questions)
}

func (qc QuestionController) UpdateQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	log.Printf("Updating question with id %v", id)

	// parse request body into update request
	updateRequest := model.UpdateQuestionRequest{}
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		log.Printf("Invalid input error: %v", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	err := qc.questionRepository.UpdateQuestion(id, updateRequest)
	if err != nil {
		if errors.Is(err, model.InvalidInputError{}) {
			log.Printf("Invalid input error: %v", err)
			http.Error(w, "Invalid input", http.StatusBadRequest)
		} else {
			log.Printf("Error updating question: %v", err)
			w.WriteHeader(http.StatusNotFound)
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (qc QuestionController) DeleteQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	log.Printf("Deleting question with id %v", id)

	// Delete from DB
	err := qc.questionRepository.DeleteQuestion(id)
	if err != nil {
		if errors.Is(err, model.InvalidInputError{}) {
			log.Printf("Invalid input error: %v", err)
			http.Error(w, "Invalid input", http.StatusBadRequest)
		} else {
			log.Printf("Error deleting question: %v", err)
			w.WriteHeader(http.StatusNotFound)
		}
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (qc QuestionController) GetQuestion(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	log.Printf("Getting question with id %v", id)

	question, err := qc.questionRepository.GetQuestion(id)
	if err != nil {
		if errors.Is(err, model.InvalidInputError{}) {
			log.Printf("Invalid input error: %v", err)
			http.Error(w, "Invalid input", http.StatusBadRequest)
		} else {
			log.Printf("Error getting question: %v", err)
			w.WriteHeader(http.StatusNotFound)
		}
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(question)
}
