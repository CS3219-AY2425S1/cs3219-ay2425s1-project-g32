const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;
const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express();
const port = 1234;
const jwtKey = process.env.JWT_SECRET;


app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket upgrades
server.on('upgrade', (request, socket, head) => {
  // auth middelware
  const token = request.headers['sec-websocket-protocol'];

  if (!token) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
  console.log(token);

  jwt.verify(token, jwtKey, (err, user) => {
    if (err) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    // TODO: check if user is actually allowed in session
    console.log(user.id);

    // Proceed with WebSocket connection
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, user);
    });
  });
});


// Handle Yjs WebSocket connection
wss.on('connection', (ws, req, user) => {
  const docName = req.url.slice(1); // Use the URL as the document name
  setupWSConnection(ws, req, { docName });

  console.log(`User ${user.id} connected to document: ${docName}`);

  ws.on('close', () => {
    console.log(`User ${user.id} disconnected`);
  });
});


// Start the server
server.listen(port, () => {
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
