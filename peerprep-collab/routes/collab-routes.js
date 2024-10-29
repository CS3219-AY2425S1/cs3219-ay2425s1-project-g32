import express from "express";

import { endSession, getRoomDetails } from "../controller/collab-controller.js";

const router = express.Router();

router.post("/end-session", async (req, res) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  try {
    await endSession(roomId);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error in end-session route:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
});

router.get("/room-details/:roomId", async (req, res) => {
  const { roomId } = req.params;

  if (!roomId) {
    return res.status(400).json({ message: "roomId is required" });
  }

  try {
    const roomDetails = await getRoomDetails(roomId);

    if (!roomDetails) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json(roomDetails);
  } catch (error) {
    console.error("Error in room-details route:", error);
    res.status(500).json({ message: "Failed to retrieve room details" });
  }
});

export default router;
