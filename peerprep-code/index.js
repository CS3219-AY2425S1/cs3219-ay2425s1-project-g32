import { createServer } from "http";
import express, { json } from "express";
import codeRoutes from "./routes/code-routes.js";
import dotenv from 'dotenv'
import Docker from 'dockerode';
import fs from 'fs';
import { auth } from "./middleware/auth.js";
import { pullAllImages } from "./utils/index.js";

// Setup docker images
const docker = new Docker({
  protocol: 'https',
  host: '127.0.0.1',
  port: 2376,
  ca: fs.readFileSync('/certs/client/ca.pem'),
  cert: fs.readFileSync('/certs/client/cert.pem'),
  key: fs.readFileSync('/certs/client/key.pem'),
});

await pullAllImages(docker)

const app = express();
const port = 4321;
dotenv.config();
app.use(json());
const server = createServer(app);

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
app.use("/code", codeRoutes);

// Start the server
server.listen(port, () => {
  console.log(`Code execution server running on http://localhost:${port}`);
});
