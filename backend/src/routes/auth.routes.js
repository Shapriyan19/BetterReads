import express from "express";
import { signup,login,logout,updateProfile,checkAuth, forgotPassword , updatePassword, sendForgotPasswordPin, addToBookVault, getBookVault } from "../controllers/auth.controller.js"; 
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check",protectRoute,checkAuth);
router.put("/forgot-password",sendForgotPasswordPin,forgotPassword,updatePassword);
router.post("/add-to-bookvault",protectRoute,addToBookVault);
router.get("/get-bookvault",protectRoute,getBookVault);

export default router;