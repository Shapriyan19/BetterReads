import express from "express";
import { searchBook, searchAuthor, sortBook, recommendedBooks, aiReviewSummary, getReview, postReview, getAvailabilityInfo,getBookDetails } from "../controllers/book.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);
router.get("/sort-book",sortBook);
router.post("/recommended-books",protectRoute,recommendedBooks);
router.get("/ai-review-summary",aiReviewSummary);
router.get("/get-review",getReview);
router.post("/post-review",protectRoute,postReview,getReview);
router.get("/get-availability",getAvailabilityInfo);
router.post("/get-book-details",getBookDetails);

export default router;