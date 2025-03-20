import express from "express";
import { searchBook, searchAuthor, sortBook, recommendedBooks, aiReviewSummary } from "../controllers/book.controller.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);
router.get("/sort-book",sortBook);
router.get("/recommended-books",recommendedBooks);
router.get("/ai-review-summary",aiReviewSummary);

export default router;