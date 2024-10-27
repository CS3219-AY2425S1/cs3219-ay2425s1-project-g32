package controller

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/common/rabbitmq"
	authMiddleware "github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/api/middleware"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/repository"
	"github.com/go-chi/chi"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MatchController struct {
	matchRepository repository.MatchRepository
	mqConn          *rabbitmq.RabbitMQConn
}

func NewMatchController(matchRepository repository.MatchRepository, mqConn *rabbitmq.RabbitMQConn) *MatchController {
	return &MatchController{
		matchRepository: matchRepository,
		mqConn:          mqConn,
	}
}

func (mc *MatchController) Match(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(authMiddleware.UserKey).(*authMiddleware.User)
	if !ok {
		http.Error(w, "User not found in context", http.StatusInternalServerError)
		return
	}

	fmt.Printf("Processing %s user match request\n", user.Username)

	var matchRequest model.MatchRequest

	if err := json.NewDecoder(r.Body).Decode(&matchRequest); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// check if user has any active match requests
	activeReq, err := mc.matchRepository.GetActiveMatchWithUserId(user.Id)

	if err != nil {
		log.Printf("Failed to check db, error: %s", err)
		http.Error(w, "Failed to check db", http.StatusInternalServerError)
		return
	}
	var zeroMatch model.Match

	if activeReq != zeroMatch {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(struct {
			Id    string `json:"id"`
			IsNew bool   `json:"isNew"`
		}{
			Id:    activeReq.Id.Hex(),
			IsNew: false,
		})
		return
	}

	// update db
	match := model.Match{
		UserId:        user.Id,
		Category:      matchRequest.Category,
		Complexity:    matchRequest.Complexity,
		HasMatch:      false,
		CreatedAt:     primitive.NewDateTimeFromTime(time.Now()),
		IsCancelled:   false,
		IsRoomCreated: false,
	}
	res, _ := mc.matchRepository.CreateMatch(match)
	reqId := res.InsertedID.(primitive.ObjectID)

	mqMsg := model.MatchRequestMessage{
		Id:     reqId,
		UserId: user.Id,
	}
	err = mc.mqConn.Publish(mqMsg)
	if err != nil {
		http.Error(w, "Failed to publish match request", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(struct {
		Id    string `json:"id"`
		IsNew bool   `json:"isNew"`
	}{
		Id:    reqId.Hex(),
		IsNew: true,
	})
}

func (mc *MatchController) Poll(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "request id is required", http.StatusBadRequest)
		return
	}

	// Step 2: Fetch the current status from the database
	prim_id, _ := primitive.ObjectIDFromHex(id)
	req, err := mc.matchRepository.GetMatch(prim_id)
	if err != nil {
		log.Printf("Error fetching match status for id %s: %v", id, err)
		http.Error(w, "Failed to fetch match status", http.StatusInternalServerError)
		return
	}

	var status string
	if req.HasMatch {
		if req.IsRoomCreated {
			status = "Matched"
		} else {
			status = "CreatingRoom"
		}
	} else {
		if time.Since(req.CreatedAt.Time()) > 5*time.Minute {
			status = "Timeout"
		} else if req.IsCancelled {
			status = "Cancelled"
		} else {
			status = "Matching"
		}
	}

	// Step 3: Return the status as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": status})
}

func (mc *MatchController) Cancel(w http.ResponseWriter, r *http.Request) {
	var cancelRequest model.CancelRequest
	err := json.NewDecoder(r.Body).Decode(&cancelRequest)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}

	err = mc.matchRepository.CancelMatch(cancelRequest)
	if err != nil {
		http.Error(w, "Failed to set as cancelled", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
}

func (mc *MatchController) RoomCreated(w http.ResponseWriter, r *http.Request) {
	var roomCreatedReq model.RoomCreatedReq
	err := json.NewDecoder(r.Body).Decode(&roomCreatedReq)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	err = mc.matchRepository.UpdateRoomCreated(roomCreatedReq)
	if err != nil {
		http.Error(w, "Failed to update room created", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
}
