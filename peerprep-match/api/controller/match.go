package controller

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/api/model"
)

type MatchController struct{}

func NewMatchController() *MatchController {
	return &MatchController{}
}

func (mc *MatchController) Match(w http.ResponseWriter, r *http.Request) {
	var matchRequest model.MatchRequest

	if err := json.NewDecoder(r.Body).Decode(&matchRequest); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// #TODO: dispatch to MQ(s)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Matching request received. Poll for its status."})
}

func (mc *MatchController) Poll(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	// Step 2: Fetch the current status from the database
	status, err := db.GetMatchStatus(userID)
	if err != nil {
		log.Printf("Error fetching match status for user %s: %v", userID, err)
		http.Error(w, "Failed to fetch match status", http.StatusInternalServerError)
		return
	}

	// Step 3: Return the status as JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": string(status)})
}
