package controller

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/messagequeue"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	"github.com/go-chi/chi"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MatchController struct {
	matchRepository repository.MatchRepository
	mqConn          *messagequeue.RabbitMQConn
}

func NewMatchController(matchRepository repository.MatchRepository, mqConn *messagequeue.RabbitMQConn) *MatchController {
	return &MatchController{
		matchRepository: matchRepository,
		mqConn:          mqConn,
	}
}

func (mc *MatchController) Match(w http.ResponseWriter, r *http.Request) {
	var matchRequest model.MatchRequest

	if err := json.NewDecoder(r.Body).Decode(&matchRequest); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// update db
	match := model.Match{
		UserId:     matchRequest.UserId,
		Category:   matchRequest.Category,
		Complexity: matchRequest.Complexity,
		HasMatch:   false,
		CreatedAt:  primitive.NewDateTimeFromTime(time.Now()),
	}
	res, _ := mc.matchRepository.CreateMatch(match)
	reqId := res.InsertedID.(primitive.ObjectID)

	mqMsg := model.MatchRequestMessage{
		Id:     reqId,
		UserId: matchRequest.UserId,
	}
	err := mc.mqConn.Publish(mqMsg)
	if err != nil {
		http.Error(w, "Failed to publish match request", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"id": reqId.Hex()})
}

func (mc *MatchController) Poll(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	// Step 2: Fetch the current status from the database
	req, err := mc.matchRepository.GetMatchWithUserId(userID)
	if err != nil {
		log.Printf("Error fetching match status for user %s: %v", userID, err)
		http.Error(w, "Failed to fetch match status", http.StatusInternalServerError)
		return
	}

	// Step 3: Return the status as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"status": req.HasMatch})
}
