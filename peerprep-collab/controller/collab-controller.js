import { setupWSConnection } from "y-websocket/bin/utils";
import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv'
import connectDB  from "../db/database.js";
import { ObjectId } from 'mongodb'
import { transpileModule } from "typescript";

dotenv.config();

const questions_url = process.env.QUESTIONS_BACKEND_URL
const matching_url = process.env.MATCHING_BACKEND_URL

const userInRoom = (user, room) => {
  return true;
};

export const onConnection = (ws, req, user) => {
  const docName = req.url.slice(1); // Use the URL as the document name
  // Verify and check if the room has been created in DB
  // If room not created yet, reject this connection
  const room = {};
  if (!room) {
    console.log("Invalid room");
    ws.emit("close");
    return;
  }

  // If created, check if the current user is supposed to be in this room
  if (!userInRoom(user.id, room)) {
    console.log("User not ssupposed to be in room");
    ws.emit("close");
    return;
  }
  setupWSConnection(ws, req, { docName });

  console.log(`User ${user.id} connected to document: ${docName}`);

  ws.on("close", () => {
    console.log(`User ${user.id} disconnected`);
  });
};

export const getQuestionId = async (category, complexity) => {
  try {
    const response = await axios.post(`${questions_url}/question/get-random`, {
          category: category,
          complexity: complexity,
    });

    const questionId = response.data;
    console.log(`Got question id ${questionId}`);
    return questionId;
  } catch (error) {
    console.error("Error fetching question from question service:", error.message);
    return null;
  }
}

const createRoomRecord = async (data, questionId) => {
  const db = await connectDB();
  const roomsCollection = db.collection('rooms');

  const room = {
    user_id1: data.user_id1,
    user_id2: data.user_id2,
    match_id1: data.match_id1,
    match_id2: data.match_id2,
    category: data.category,
    complexity: data.complexity,
    question_id: questionId,
    created_at: new Date(),
    status: "active"
  }

  const res = await roomsCollection.insertOne(room);
  console.log('Room record created in MongoDB with ID:', res.insertedId);
  return res.insertedId
}

const updateRoomCreated = async (match_id1, match_id2, room_id) => {
  try {
    console.log(`Updating matching service for ids ${match_id1} and ${match_id2}, with room_id ${room_id}`)
    const response = await axios.post(`${matching_url}/match/room-created`, {
          match_id1: match_id1,
          match_id2: match_id2,
          room_id: room_id,
    },
    {
      headers: {
        'X-Microservice-Secret': process.env.MICROSERVICE_SECRET,
      },     
    });
    return true;
  } catch (error) {
    console.error("Error updating matching service over created room", error.message);
    return false;
  }
}

const createSession = async (data) => {
  // get a random question that satisfies the requirements
  const questionId = await getQuestionId(data.category, data.complexity);
  const roomId = await createRoomRecord(data, questionId);
  await updateRoomCreated(data.match_id1, data.match_id2, roomId);
};

export const consumeMessages = async (rmq_uri, rmq_queue_name) => {
  try {
    const connection = await amqp.connect(rmq_uri);
    const channel = await connection.createChannel();

    await channel.assertQueue(rmq_queue_name, { durable: false });

    console.log(`Waiting for messages in ${rmq_queue_name}`);

    channel.consume(rmq_queue_name, (message) => {
      if (message!==null) {
        const roomInfo = JSON.parse(message.content.toString());
        console.log('Received room creation message: ', roomInfo)

        createSession(roomInfo);
      }
    });
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}

export const endSession = async (roomId) => {
  try {
      const db = await connectDB();
      const roomsCollection = db.collection('rooms');

      // Update the room status to "completed" and retrieve match_id1 and match_id2
      const result = await roomsCollection.findOneAndUpdate(
          { _id: new ObjectId(roomId) },
          { $set: { status: "completed" } },
          { returnDocument: 'after' }
      );

      if (!result.value) {
          console.log(`No room found with id: ${roomId}`);
          return { message: "Room not found", success: false };
      }

      const { match_id1, match_id2 } = result.value;

      // Call the matching service's cancel API for each match_id
      await Promise.all([
          axios.post(`${matching_url}/cancel`, { match_id: match_id1 }, {
            headers: {
              'X-Microservice-Secret': process.env.MICROSERVICE_SECRET,
            },     
          }),
          axios.post(`${matching_url}/cancel`, { match_id: match_id2 }, {
            headers: {
              'X-Microservice-Secret': process.env.MICROSERVICE_SECRET,
            },     
          })
      ]);

      console.log(`Room with id ${roomId} updated to "completed" and matches canceled`);
  } catch (error) {
      console.error('Error ending session and canceling matches:', error);
  }
};

export const getRoomDetails = async (roomId) => {
  try {
    const db = await connectDB();
    const roomsCollection = db.collection('rooms');
    
    const room = await roomsCollection.findOne({ _id: new ObjectId(roomId) });

    if (room) {
      return {
        question_id: room.question_id,
        user_id1: room.user_id1,
        user_id2: room.user_id2,
      };
    } else {
      console.error(`No room found for id ${roomId}`);
    }
  } catch (error) {
    console.error('Error fetching room details:', error);
  }
};
