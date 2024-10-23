import express from "express";

import { createSession, endSession } from "../controller/collab-controller.js";

const router = express.Router();

router.post("/create-session", createSession);
router.post("/end-session", endSession);

export default router;
