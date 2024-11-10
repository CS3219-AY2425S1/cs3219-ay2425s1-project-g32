package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Question struct {
	Id           primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"` // mongo uses _id in bson for their object id, json id is for our requests
	Title        string             `json:"title"`
	Description  string             `json:"description"`
	Category     []string           `json:"category"` // could maybe have category & complexity as some enum
	Complexity   string             `json:"complexity"`
	Explaination string             `json:"explaination" bson:"explaination"`
	SampleInput  string             `json:"sample_input" bson:"sample_input"`
	SampleOutput string             `json:"sample_output" bson:"sample_output"`
}

type UpdateQuestionRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Category    []string `json:"category"`
	Complexity  string   `json:"complexity"`
}

type RandomQuestionRequest struct {
	Category   string `json:"category"`
	Complexity string `json:"complexity"`
}
