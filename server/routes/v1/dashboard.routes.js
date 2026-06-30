import express from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import { getSummary, getRevenue, getCategoryRevenue, getTopProducts, getOverview } from "../../controllers/dashboard.controllers.js";

const router = express.Router();

// router.use(verifyToken, verifyAdmin);

router.get("/overview", getOverview);
router.get("/summary", getSummary);
router.get("/revenue", getRevenue);
router.get("/category-revenue", getCategoryRevenue);
router.get("/top-products", getTopProducts);

export default router;


