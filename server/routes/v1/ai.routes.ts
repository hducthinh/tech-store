// server/routes/v1/ai.routes.js
import express from "express";
import { chat } from "../../controllers/ai.controllers.js";

const router = express.Router();

router.post("/chat", chat);

export default router;

