import User from "../models/users.model.js";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export const searchBook= async (req,res)=>{
    try{
        const {book}=req.body;
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
        const result=await fetch(`https://openlibrary.org/search.json?q=${book}&sort=${sort}`).then(a=>a.json());
        if (!result){
            return res.status(400).json({message:"Book not found"});
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log("error in sortBook: ",error);
        res.status(500).json({message:"Internal server error"});
    }   
}

export const searchAuthor = async (req,res)=>{
    try{
        const{author}=req.body;
        const result=await fetch (`https://openlibrary.org/search/authors.json?q=${author}`).then(a=>a.json());        
        if (!result){
            return res.status(400).json({message:"Author not found"});
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
        const {book_name,auth_name}=req.body;
        const prompt = `can you give summarization of review for the book ${book_name} by author ${auth_name} based on review of readers`;
        // console.log(process.env.GEMINI_API_KEY);
        const result=await model.generateContent(prompt);
        if(!result){
            return res.status(400).json({message:"no result"});
        }
        //console.log(result.response.text);
        const summary = result.response.text();
        return res.status(200).json({ book: book_name, author: auth_name, summary });
    } catch (error) {
        console.log("error in aiReviewSummary: ",error);
        res.status(500).json({message:"Internal server error"});
    }
}