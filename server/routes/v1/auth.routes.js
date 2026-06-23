// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile
} from "../../controllers/auth.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;
