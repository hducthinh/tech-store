// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from "../../controllers/auth.controllers.js";
import verifyToken from "../../middlewares/verifyToken.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { validateRegisterInput, validateLoginInput } from "../../utils/validators.js";

const router = express.Router();

// Public routes
router.post("/register", validateRequest(validateRegisterInput), register);
router.post("/login", validateRequest(validateLoginInput), login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

export default router;

