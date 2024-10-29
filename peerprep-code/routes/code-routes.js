import express from "express";

import { runCode } from "../controller/code-controller.js";

const router = express.Router();

router.post("/", runCode);

export default router;
