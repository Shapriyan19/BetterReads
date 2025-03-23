import express from "express";

import { protectRoute, isClubAdmin, isClubMember } from "../middleware/auth.middleware.js";
import { demoteRole, getMembers, joinClub, leaveClub, promoteRole, removeMember, transferOwnership } from "../controllers/membership.controller.js";

const router = express.Router();

// Join a club (add member role)
router.post('/:clubId/join', protectRoute, joinClub);

// Leave a club (remove member role)
router.delete('/:clubId/leave', protectRoute, leaveClub);

// Promote a member to admin
router.put('/:clubId/promote/:userId', protectRoute, isClubAdmin, promoteRole);

// Demote an admin to member
router.put('/:clubId/demote/:userId', protectRoute, isClubAdmin, demoteRole);

// Remove a member (admin only)
router.delete('/:clubId/members/:userId', protectRoute, isClubAdmin, removeMember);

// Get all members of a club
router.get('/:clubId/members', protectRoute, isClubMember, getMembers);

// Transfer club ownership (main admin only)
router.put('/:clubId/transfer-ownership/:userId', protectRoute, transferOwnership);

export default router;