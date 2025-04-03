import express from "express";
import { protectRoute, isClubAdmin } from "../middleware/auth.middleware.js";
import { createClub, deleteClub, getClub, getClubs, updateClub } from "../controllers/club.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post('/', protectRoute, upload.single('image'), createClub);

// Get all book clubs
router.get('/', getClubs);

// Get single club by ID
router.get('/:clubId',getClub);

// Update club details
router.put('/:clubId', protectRoute, isClubAdmin, updateClub);

// Delete a club (admin only)
router.delete('/:clubId', protectRoute, isClubAdmin,deleteClub);

export default router;