import express from "express";
import { searchBook, searchAuthor, sortBook } from "../controllers/book.controller.js";

const router=express.Router();

router.get("/search",searchBook);
router.get("/search-author",searchAuthor);
router.get("/sort-book",sortBook);

export default router;