package repository

import (
	"context"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-match/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MatchRepository struct {
	mongoClient *mongo.Client
}

func NewRepository(mongoClient *mongo.Client) MatchRepository {
	return MatchRepository{
		mongoClient: mongoClient,
	}
}

func GetFilter(filter model.GetMatchFilter) (bson.M, error) {
	f := bson.M{}
	if filter.UserId != "" {
		questionId, err := primitive.ObjectIDFromHex(filter.UserId)
		if err != nil {
			return nil, model.InvalidInputError{}
		}
		f["_id"] = questionId
	}

	if filter.Category != "" {
		f["category"] = filter.Category
	}

	if filter.Complexity != "" {
		f["complexity"] = filter.Complexity
	}

	return f, nil
}

func (qr MatchRepository) GetPossibleMatchesForUser(userId string, filter model.GetMatchFilter) ([]model.Match, error) {
	f, err := GetFilter(filter)
	if err != nil {
		return nil, err
	}

	// Exclude the current user from possible matches
	f["user_id"] = bson.M{"$ne": userId}
	// Exclude matched rows as well
	f["has_match"] = false
	// Calculate the timestamp for 5 minutes ago
	fiveMinutesAgo := time.Now().Add(-5 * time.Minute)
	// Add filter for records created within the last 5 minutes
	f["created_at"] = bson.M{"$gte": fiveMinutesAgo}

	sortOpts := options.Find().SetSort(bson.D{{"created_at", 1}})
	collection := db.GetCollection(qr.mongoClient, "matches")
	cursor, err := collection.Find(context.Background(), f, sortOpts)
	if err != nil {
		return nil, err
	}

	var matches []model.Match
	for cursor.Next(context.Background()) {
		var match model.Match
		if err := cursor.Decode(&match); err != nil {
			return nil, err
		}
		matches = append(matches, match)
	}

	return matches, nil
}

func (qr MatchRepository) GetMatch(id primitive.ObjectID) (model.Match, error) {
	var match model.Match
	filter := bson.M{"_id": id}
	collection := db.GetCollection(qr.mongoClient, "matches")
	err := collection.FindOne(context.Background(), filter).Decode(&match)

	if err != nil {
		return model.Match{}, err
	}
	return match, nil
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

func (qr MatchRepository) UpdateMatch(questionId primitive.ObjectID, updateRequest model.UpdateMatchRequest) error {
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "matches")
	update := bson.M{"$set": updateRequest}
	_, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (qr MatchRepository) CreateMatch(match model.Match) (*mongo.InsertOneResult, error) {
	collection := db.GetCollection(qr.mongoClient, "matches")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, match)
	if err != nil {
		return nil, err
	}
	return result, nil
}
