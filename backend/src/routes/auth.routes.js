import express from "express";
import { signup, login, logout, updateProfile, checkAuth, verifyForgotPasswordPin, updatePassword, sendForgotPasswordPin, addToBookVault, getBookVault } from "../controllers/auth.controller.js"; 
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router=express.Router();

router.post("/signup", upload.single('profilePic'), signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

// Forgot password routes
router.post("/forgot-password/send-pin", sendForgotPasswordPin);
router.post("/forgot-password/verify-pin", verifyForgotPasswordPin);
router.post("/forgot-password/update", updatePassword);

router.post("/add-to-bookvault", protectRoute, addToBookVault);
router.get("/get-bookvault", protectRoute, getBookVault);

export default router;