package repository

import (
	"context"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/db"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32/peerprep-questions/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type QuestionRepository struct {
	mongoClient *mongo.Client
}

func NewRepository(mongoClient *mongo.Client) QuestionRepository {
	return QuestionRepository{
		mongoClient: mongoClient,
	}
}

func (qr QuestionRepository) CreateQuestion(question model.Question) (*mongo.InsertOneResult, error) {
	collection := db.GetCollection(qr.mongoClient, "questions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, question)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (qr QuestionRepository) ListQuestions(complexity, category string) ([]model.Question, error) {
	collection := db.GetCollection(qr.mongoClient, "questions")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// // Set up options for pagination
	// opts := options.Find()
	// opts.SetSkip(int64((page - 1) * limit)) // Calculate the number of documents to skip
	// opts.SetLimit(int64(limit))              // Limit the number of documents returned

	// setup filter
	filter := bson.M{}
	if complexity != "" {
		filter["complexity"] = complexity
	}
	if category != "" {
		filter["category"] = category
	}

	// Find the questions with the given filter
	cursor, err := collection.Find(ctx, filter)

	// cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Iterate through the cursor and collect results
	var questions []model.Question
	for cursor.Next(ctx) {
		var question model.Question
		if err := cursor.Decode(&question); err != nil {
			return nil, err
		}
		questions = append(questions, question)
	}

	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return questions, nil
}

// get question with specific id
func (qr QuestionRepository) GetQuestion(id string) (model.Question, error) {
	var question model.Question
	questionId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return model.Question{}, err
	}
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "questions")
	err = collection.FindOne(context.Background(), filter).Decode(&question)

	if err != nil {
		return model.Question{}, err
	}
	return question, nil
}

func (qr QuestionRepository) DeleteQuestion(id string) error {
	questionId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return model.InvalidInputError{}
	}
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "questions")
	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}
	return nil
}

func (qr QuestionRepository) UpdateQuestion(id string, updateRequest model.UpdateQuestionRequest) (*model.Question, error) {
	questionId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, model.InvalidInputError{}
	}
	filter := bson.M{"_id": questionId}
	collection := db.GetCollection(qr.mongoClient, "questions")
	update := bson.M{"$set": updateRequest}
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return nil, err
	}

	var updatedQuestion model.Question
	err = collection.FindOne(context.Background(), filter).Decode(&updatedQuestion)
	if err != nil {
		return nil, err
	}

	return &updatedQuestion, nil
}

func (qr QuestionRepository) GetRandomQuestion(category string, complexity string) (string, error) {
	collection := db.GetCollection(qr.mongoClient, "questions")

	matchFilter := bson.D{}

	if complexity != "All" && complexity != "" {
		matchFilter = append(matchFilter, bson.E{"complexity", complexity})
	}

	if category != "All" && category != "" {
		matchFilter = append(matchFilter, bson.E{"category", bson.D{{"$elemMatch", bson.D{{"$eq", category}}}}})
	}

	pipeline := mongo.Pipeline{
		{{"$match", matchFilter}},
		{{"$sample", bson.D{{"size", 1}}}}, // Randomly select one matching document
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return "", err
	}
	defer cursor.Close(context.Background())

	var result struct {
		ID primitive.ObjectID `bson:"_id"`
	}
	if cursor.Next(context.Background()) {
		if err := cursor.Decode(&result); err != nil {
			return "", err
		}
		return result.ID.Hex(), nil
	}

	return "", nil
}
