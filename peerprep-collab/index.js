import { createServer } from "http";
import express, { json } from "express";
import { WebSocketServer } from "ws";
import { authenticateToken, auth } from "./middleware/auth.js";
import { onConnection, consumeMessages } from "./controller/collab-controller.js";
import collabRoutes from "./routes/collab-routes.js";
import codeRoutes from "./routes/code-routes.js";
import dotenv from 'dotenv'

const app = express();
const port = 1234;
dotenv.config();
const rmq_uri = process.env.COLLAB_RMQ_URI
const rmq_queue_name = process.env.COLLAB_QUEUE

app.use(json());
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// To handle CORS Errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

app.use(auth);
app.use("/collab", collabRoutes);
app.use("/code", codeRoutes);

// Handle WebSocket upgrades
server.on("upgrade", async (request, socket, head) => {
  // auth middelware
  const token = request.headers["sec-websocket-protocol"];

  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const user = await authenticateToken(token);
  if (!user) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request, user);
  });
});

// Handle Yjs WebSocket connection
wss.on("connection", onConnection);

// Start the server
server.listen(port, () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
  consumeMessages(rmq_uri, rmq_queue_name);
});
