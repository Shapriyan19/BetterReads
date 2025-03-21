import express from "express";
import { searchBook, searchAuthor, sortBook, recommendedBooks, aiReviewSummary, getReview, postReview } from "../controllers/book.controller.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);
router.get("/sort-book",sortBook);
router.get("/recommended-books",recommendedBooks);
router.get("/ai-review-summary",aiReviewSummary);
router.get("/get-review",getReview);
router.post("/post-review",postReview,getReview);

export default router;