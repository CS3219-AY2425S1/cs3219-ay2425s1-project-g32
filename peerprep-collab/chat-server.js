import { ExpressPeerServer } from "peer";
import { createServer } from "http";
import express, { json } from "express";
import { WebSocketServer } from "ws";
import { authenticateToken, auth } from "./middleware/auth.js";
import { onConnection } from "./controller/collab-controller.js";
import collabRoutes from "./routes/collab-routes.js";
import "dotenv/config";

const app = express();
const port = 9000;

app.use(json());
app.use(auth);
const server = createServer(app);

var peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use("/signaling", peerServer);
peerServer.on("connection", function (id) {
  console.log("connecitng chat", id.getId());
});

peerServer.on("disconnect", function (id) {
  console.log("disconnecting chat", id.getId());
});

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

server.listen(port, () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
