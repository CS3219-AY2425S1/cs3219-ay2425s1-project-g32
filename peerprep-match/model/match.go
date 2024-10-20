package model

import (
	"encoding/json"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MatchRequest struct {
	Category   string `json:"category"`
	Complexity string `json:"complexity"`
}

type MatchRequestMessage struct {
	Id     primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"` // mongo uses _id in bson for their object id, json id is for our requests
	UserId string             `json:"user_id" bson:"user_id"`
}

// manual unmarshal to handle primitive.ObjectID type
func (m *MatchRequestMessage) UnmarshalJSON(data []byte) error {
	// Create a temporary struct without ObjectID to help with unmarshaling
	var temp struct {
		Id     string `json:"id"`
		UserId string `json:"user_id"`
	}

	// Unmarshal JSON into the temporary struct
	if err := json.Unmarshal(data, &temp); err != nil {
		log.Printf("Y")
		return fmt.Errorf("failed to unmarshal message: %v", err)
	}

	// Convert the UserID string to primitive.ObjectID
	objID, err := primitive.ObjectIDFromHex(temp.Id)
	if err != nil {
		return fmt.Errorf("invalid ObjectID for user_id: %v", err)
	}

	// Assign the fields to the original struct
	m.UserId = temp.UserId
	m.Id = objID
	return nil
}

type Match struct {
	Id          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"` // mongo uses _id in bson for their object id, json id is for our requests
	UserId      string             `json:"user_id" bson:"user_id"`
	Category    string             `json:"category"`
	Complexity  string             `json:"complexity"`
	HasMatch    bool               `json:"has_match" bson:"has_match"`
	CreatedAt   primitive.DateTime `json:"created_at" bson:"created_at"`
	IsCancelled bool               `json:"is_cancelled" bson:"is_cancelled"`
}

type UpdateMatchRequest struct {
	UserId     string `json:"user_id" bson:"user_id"`
	Category   string `json:"category"`
	Complexity string `json:"complexity"`
	HasMatch   bool   `json:"has_match" bson:"has_match"`
}

type CancelRequest struct {
	Id string `json:"id"`
}

type GetMatchFilter struct {
	UserId     string `json:"user_id" bson:"user_id"`
	Category   string `json:"category"`
	Complexity string `json:"complexity"`
}
