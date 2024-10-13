package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Request struct {
	Id         primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"` // mongo uses _id in bson for their object id, json id is for our requests
	UserId     string             `json:"user_id"`
	Category   string             `json:"category"`
	Complexity string             `json:"complexity"`
	HasMatch   bool               `json:"has_match"`
	CreatedAt  primitive.DateTime `json:"created_at"`
}
