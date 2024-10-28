import express from "express";

import {endSession} from "../controller/collab-controller.js";

const router = express.Router();

router.post("/end-session", async (req, res) => {
    const { roomId } = req.body;

    if (!roomId) {
        return res.status(400).json({ error: "roomId is required" });
    }

    try {
        await endSession(roomId);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error in end-session route:", error);
        res.status(500).json({ error: "Failed to end session" });
    }
});
export default router;
