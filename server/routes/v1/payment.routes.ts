import express from "express";
import { sepayWebhook } from "../../controllers/payment.controllers.js";

const router = express.Router();

router.post("/sepay-webhook", sepayWebhook);

export default router;
