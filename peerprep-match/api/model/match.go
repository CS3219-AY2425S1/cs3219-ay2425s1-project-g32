package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type MatchRequest struct {
	UserId     string `json:"user_id"`
	Category   string `json:"category"`
	Complexity string `json:"complexity"`
}

type MatchRequestMessage struct {
	Id     primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	UserId string             `json:"user_id"`
}
