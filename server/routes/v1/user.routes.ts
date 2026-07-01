import express from "express";
import { getAdminUsers, toggleUserStatus } from "../../controllers/user.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";

const router = express.Router();

router.use(verifyToken);

// Admin Routes
router.get("/admin", verifyAdmin, getAdminUsers);
router.patch("/admin/:id/toggle-status", verifyAdmin, toggleUserStatus);

export default router;
