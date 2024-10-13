package repository

import (
	"context"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type MatchRepository struct {
	mongoClient *mongo.Client
}

func NewRepository(mongoClient *mongo.Client) MatchRepository {
	return MatchRepository{
		mongoClient: mongoClient,
	}
}

func (qr MatchRepository) GetRequest(id string) (model.Request, error) {
	var question model.Request
	questionId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return model.Request{}, err
	}
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "matches")
	err = collection.FindOne(context.Background(), filter).Decode(&question)

	if err != nil {
		return model.Request{}, err
	}
	return question, nil
}

func (qr MatchRepository) GetRequestWithUserId(userId string) (model.Request, error) {
	var request model.Request
	filter := bson.M{"user_id": userId}
	collection := db.GetCollection(qr.mongoClient, "matches")
	err := collection.FindOne(context.Background(), filter).Decode(&request)

	if err != nil {
		return model.Request{}, err
	}
	return request, nil
}

func (mr MatchRepository) DeleteMatchWithUserId(id string) error {
	filter := bson.M{"user_id": id}
	collection := db.GetCollection(mr.mongoClient, "matches")
	_, err := collection.DeleteMany(context.Background(), filter)
	if err != nil {
		return err
	}
	return nil
}
