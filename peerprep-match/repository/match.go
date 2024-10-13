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

func (qr MatchRepository) GetMatch(id primitive.ObjectID) (model.Match, error) {
	var question model.Match
	filter := bson.M{"_id": id}
	collection := db.GetCollection(qr.mongoClient, "matches")
	err := collection.FindOne(context.Background(), filter).Decode(&question)

	if err != nil {
		return model.Match{}, err
	}
	return question, nil
}

func (qr MatchRepository) GetMatchWithUserId(userId string) (model.Match, error) {
	var match model.Match
	filter := bson.M{"user_id": userId}
	collection := db.GetCollection(qr.mongoClient, "matches")
	err := collection.FindOne(context.Background(), filter).Decode(&match)

	if err != nil {
		return model.Match{}, err
	}
	return match, nil
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

func (qr MatchRepository) UpdateMatch(id string, updateRequest model.UpdateMatchRequest) error {
	questionId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return model.InvalidInputError{}
	}
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "questions")
	update := bson.M{"$set": updateRequest}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}
	return nil
}
