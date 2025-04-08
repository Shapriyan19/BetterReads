import express from "express";
import { getClubMessages, saveMessage } from "../controllers/messages.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get messages for a club
router.get("/club/:clubId", protectRoute, getClubMessages);

// Save a new message
router.post("/", protectRoute, saveMessage);

export default router; 