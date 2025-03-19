import express from "express";
import { searchBook, searchAuthor } from "../controllers/book.controller.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);

export default router;