import { setupWSConnection } from "y-websocket/bin/utils";

const onConnection = (ws, req, user) => {
  console.log("USER", user);
  const docName = req.url.slice(1); // Use the URL as the document name
  setupWSConnection(ws, req, { docName });

  console.log(`User ${user.id} connected to document: ${docName}`);

  ws.on("close", () => {
    console.log(`User ${user.id} disconnected`);
  });
};

export { onConnection };
