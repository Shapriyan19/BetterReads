import User from "../models/users.model.js";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";
import Review from "../models/reviews.model.js";

dotenv.config();
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export const searchBook= async (req,res)=>{
    try{
        const {book}=req.query;

        if (!book) {
            return res.status(400).json({ message: "Book name is required" });
          }
        const result=await fetch(`https://openlibrary.org/search.json?q=${book}`).then(a=>a.json());
        if (!result){
            return res.status(400).json({message:"Book not found"});
        }
        return res.status(200).json(result);
    }catch(error){
        console.log("error in searchBook: ",error);
        res.status(500).json({message:"Internal server error"});
    }
    
};

export const sortBook = async (req,res)=>{
    try {
        const {book,sort}=req.body;

        if (!book) {
            return res.status(400).json({ message: "Book name is required" });
        }
          
        if (!sort) {
            return res.status(400).json({ message: "Sort parameter is required" });
        }
        const result=await fetch(`https://openlibrary.org/search.json?q=${book}&sort=${sort}`).then(a=>a.json());
        if (!result || result.numFound === 0) {
            return res.status(404).json({ message: "No books found matching your search" });
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log("error in sortBook: ",error);
        res.status(500).json({message:"Internal server error"});
    }   
}

export const searchAuthor = async (req,res)=>{
    try{
        const{author}=req.query;

        if (!author) {
            return res.status(400).json({ message: "Author search term is required" });
        }
        
        const result=await fetch (`https://openlibrary.org/search/authors.json?q=${author}`).then(a=>a.json());        
        if (!result || result.numFound === 0) {
            return res.status(404).json({ message: "No authors found matching your search" });
        }
        return res.status(200).json(result);
    }catch(error){
        console.log("error in searchByAuthor: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const recommendedBooks= async (req,res)=>{
    try{
        const {email}=req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        const preferences=user.preferences;
        
        let books=[];
        for (let i=0;i<preferences.length;i++){
            const preference_book=await fetch(`https://openlibrary.org/search.json?q=subject:${preferences[i]}`).then(a=>a.json());
            if (preference_book["docs"]) {
                for (let j = 0; j < Math.min(10, preference_book["docs"].length); j++) {
                    books.push(preference_book["docs"][j]);
                }
            }
        }
        return res.status(200).json(books);
    }catch(error){
        console.log("error in recommendedBooks: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const aiReviewSummary= async (req,res)=>{
    try {
        const {book_name,auth_name}=req.query;

        if (!book_name || !auth_name) {
            return res.status(400).json({ message: "Book name and author name are required" });
          }
        const prompt = `can you give summarization of review for the book ${book_name} by author ${auth_name} based on review of readers`;
        // console.log(process.env.GEMINI_API_KEY);
        const result=await model.generateContent(prompt);
        if (!result || !result.response) {
            return res.status(500).json({ message: "Failed to generate AI review summary" });
          }
        //console.log(result.response.text);
        const summary = result.response.text();
        return res.status(200).json({ book: book_name, author: auth_name, summary });
    } catch (error) {
        console.log("error in aiReviewSummary: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const postReview=async (req,res,next)=>{
    try {
        const {firstname,lastname,bookName,profilePic,stars,review}=req.body;
        var userName=firstname+lastname;
        if(!userName || !bookName || !stars){
            res.status(400).json({message: "All field except review are required"});
        }

        // Validate star rating
        if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
            return res.status(400).json({ message: "Star rating must be an integer between 1 and 5" });
        }

        const newReview=new Review({
            userName,
            bookName,
            profilePic,
            stars,
            review,
        });
        await newReview.save();
        if(newReview){
            req.body.bookName=bookName;
            next();
        };
    } catch (error) {
        console.log("error in postReview: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const getReview=async (req,res)=>{
    try {
        const bookName = req.body.bookName || req.query.bookName;

        if (!bookName){
            res.status(400).json({message: "All field except review are required"});
        }
        const reviews=await Review.find({bookName:bookName});
        if (!reviews || reviews.length === 0) {
            return res.status(200).json({ message: "No reviews found for this book", reviews: [] });
        }
        else{
            res.status(200).json({reviews});
        }

    } catch (error) {
        console.log("error in getReview: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};