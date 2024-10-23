import { setupWSConnection } from "y-websocket/bin/utils";

const userInRoom = (user, room) => {
  return true;
};

export const onConnection = (ws, req, user) => {
  const docName = req.url.slice(1); // Use the URL as the document name
  // Verify and check if the room has been created in DB
  // If room not created yet, reject this connection
  const room = {};
  if (!room) {
    ws.emit("close");
    return;
  }

  // If created, check if the current user is supposed to be in this room
  if (!userInRoom(user.id, room)) {
    ws.emit("close");
    return;
  }

  setupWSConnection(ws, req, { docName });

  console.log(`User ${user.id} connected to document: ${docName}`);

  ws.on("close", () => {
    console.log(`User ${user.id} disconnected`);
  });
};

export const createSession = () => {};

export const endSession = () => {};
