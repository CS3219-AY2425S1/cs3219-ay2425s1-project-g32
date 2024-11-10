package repository

import (
	"context"
	"log"
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

	if filter.Category != "" && filter.Category != "All" {
		f["category"] = bson.M{
			"$in": []string{filter.Category, "All"},
		}
	}

	if filter.Complexity != "" && filter.Complexity != "All" {
		f["complexity"] = bson.M{
			"$in": []string{filter.Complexity, "All"},
		}
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
	// Exclude cancelled rows
	f["is_cancelled"] = false
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

func (qr MatchRepository) GetActiveMatchWithUserId(userId string) (model.Match, error) {
	var match model.Match
	filter := bson.M{"user_id": userId}
	// Calculate the timestamp for 5 minutes ago
	fiveMinutesAgo := time.Now().Add(-5 * time.Minute)
	// Add filter for records created within the last 5 minutes
	filter["created_at"] = bson.M{"$gte": fiveMinutesAgo}
	filter["is_cancelled"] = false

	collection := db.GetCollection(qr.mongoClient, "matches")

	// Set sort option to retrieve the most recent document based on "created_at"
	opts := options.FindOne().SetSort(bson.D{{"created_at", -1}})

	res := collection.FindOne(context.Background(), filter, opts)

	if err := res.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			return model.Match{}, nil
		}
		return model.Match{}, err
	}
	err := res.Decode(&match)

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

func (mr MatchRepository) CancelMatch(cancelRequest model.CancelRequest) error {
	id, _ := primitive.ObjectIDFromHex(cancelRequest.Id)
	filter := bson.M{"_id": id}
	collection := db.GetCollection(mr.mongoClient, "matches")
	update := bson.M{
		"$set": bson.M{
			"is_cancelled": true,
		},
	}
	res, err := collection.UpdateOne(context.Background(), filter, update)
	log.Printf("%d results modified", res.ModifiedCount)
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

func (mr MatchRepository) UpdateRoomCreated(req model.RoomCreatedReq) error {
	id1, err := primitive.ObjectIDFromHex(req.MatchId1)
	if err != nil {
		log.Printf("Invalid MatchId1: %v\n", err)
		return err
	}
	id2, err := primitive.ObjectIDFromHex(req.MatchId2)
	if err != nil {
		log.Printf("Invalid MatchId2: %v\n", err)
		return err
	}
	filter := bson.M{"_id": bson.M{"$in": []primitive.ObjectID{id1, id2}}}
	collection := db.GetCollection(mr.mongoClient, "matches")
	log.Printf("Updating with room_id: %s", req.RoomId)
	update := bson.M{
		"$set": bson.M{
			"is_room_created": true,
			"room_id":         req.RoomId,
		},
	}
	res, err := collection.UpdateMany(context.Background(), filter, update)
	if err != nil {
		log.Printf("Error updating room created - %s", err)
		return err
	}
	log.Printf("%d records modified for room creation", res.ModifiedCount)
	return nil
}
