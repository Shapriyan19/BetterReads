import express from "express";
import { searchBook, searchAuthor, sortBook, recommendedBooks, aiReviewSummary, getReview, postReview, getAvailabilityInfo,getBookDetails, getPlaylist } from "../controllers/book.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { postRating } from "../controllers/book.controller.js";
import { getAverageRating } from "../controllers/book.controller.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);
router.get("/sort-book",sortBook);
router.post("/recommended-books",protectRoute,recommendedBooks);
router.get("/ai-review-summary",aiReviewSummary);
router.get("/get-review",getReview);
router.post("/post-review",protectRoute,postReview,getReview);
router.post("/get-availability",getAvailabilityInfo);
router.post("/get-book-details",getBookDetails);
router.post("/post-rating", protectRoute, postRating);
router.get("/get-average-rating", getAverageRating);
router.post("/get-playlist",getPlaylist);

export default router;