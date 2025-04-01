import User from "../models/users.model.js";
import {GoogleGenerativeAI} from "@google/generative-ai";
import dotenv from "dotenv";
import Review from "../models/reviews.model.js";

dotenv.config();
const genAI=new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


export const searchBook = async (req,res) => {
    try {
        const {book} = req.query;

        if (!book) {
            return res.status(400).json({ message: "Book name is required" });
        }

        // Use the same URL format as recommendedBooks
        const result = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(book)}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,isbn`).then(a => a.json());

        if (!result || !result.docs || result.docs.length === 0) {
            return res.status(404).json({ message: "No books found" });
        }

        // Process books similar to recommendedBooks
        const formattedBooks = result.docs
            .filter(book => book.title && book.author_name) // Only include books with title and author
            .map(book => {
                // Get subjects or use default
                const subjects = book.subject || [];
                
                return {
                    key: book.key,
                    title: book.title,
                    author_name: book.author_name,
                    cover_i: book.cover_i,
                    first_publish_year: book.first_publish_year || 'Unknown',
                    subject: subjects,
                    // Use first subject as primary or default to Fiction
                    primary_subject: subjects[0] || 'Fiction',
                    isbn: book.isbn || [],
                    edition_count: book.edition_count || 0
                };
            });

        // Return the formatted books directly
        return res.status(200).json(formattedBooks);
    } catch(error) {
        console.log("error in searchBook: ", error);
        res.status(500).json({message: "Internal server error"});
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
        
        let booksMap = new Map(); // Use a Map to store unique books by key
        
        for (let i=0;i<preferences.length;i++){
            const preference_book=await fetch(`https://openlibrary.org/search.json?q=subject:${preferences[i]}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,isbn`).then(a=>a.json());
            if (preference_book["docs"]) {
                for (let j = 0; j < Math.min(10, preference_book["docs"].length); j++) {
                    const book = preference_book["docs"][j];
                    // Only add the book if we haven't seen its key before
                    if (!booksMap.has(book.key)) {
                        // Find the first subject that matches user's preferences
                        const matchingSubject = book.subject?.find(subject => 
                            preferences.some(pref => 
                                subject.toLowerCase().includes(pref.toLowerCase())
                            )
                        );
                        
                        // If no matching subject found, use the first available subject or the current preference
                        book.primary_subject = matchingSubject || book.subject?.[0] || preferences[i];
                        booksMap.set(book.key, book);
                    }
                }
            }
        }
        
        // Convert Map values back to array
        const books = Array.from(booksMap.values());
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

export const getAvailabilityInfo= async (req,res)=>{
    const baseUrl = "https://openweb.nlb.gov.sg/api/v2/Catalogue";
    const endpoint = "/GetAvailabilityInfo";
    const API_KEY="8(I<YgZlt6JB-BHg@G18#TTTe`w).eai"
    const APP_CODE="DEV-Shanmugapriyan"
    try{
        const {bookName}=req.body;
        const url = `${baseUrl}${endpoint}?ISBN=${bookName}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Api-Key": API_KEY,
                "X-App-Code":APP_CODE,
                "Content-Type": "application/json"
            }
        });
    
        if (!response.ok) {
            console.log("Error:", response);
            return;
        }
        const data = await response.json();
        res.status(200).json({data});
    }catch(error){
        console.log("error in getAvailabilityInfo: ",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const getBookDetails=async (req,res)=>{
    try {
        const {bookISBN} = req.body;
        if (!bookISBN) {
            return res.status(400).json({ message: "Book ISBN is required" });
        }
        
        // First try to get book details using ISBN
        let result = await fetch(`https://openlibrary.org/isbn/${bookISBN}.json`).then(a=>a.json());
        
        // If no result with ISBN, try to get work details
        if (result.works && result.works[0]) {
            const workDetails = await fetch(`https://openlibrary.org${result.works[0].key}.json`).then(a=>a.json());
            result = { ...result, ...workDetails };
        }
        
        return res.status(200).json(result);
    } catch(error) {
        console.log("error in getBookDetails: ",error);
        res.status(500).json({message:"Internal server error"});
    }
};
