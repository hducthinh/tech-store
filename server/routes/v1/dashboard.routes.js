import express from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import { getStats, getChart } from "../../controllers/dashboard.controllers.js";

const router = express.Router();

// Tất cả các route trong file này đều yêu cầu đăng nhập và là admin
router.use(verifyToken, verifyAdmin);

router.get("/stats", getStats);
router.get("/chart", getChart);

export default router;
