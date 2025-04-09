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
        
        // Calculate how many books to fetch per preference to get 30 total
        const booksPerPreference = Math.ceil(30 / preferences.length);
        
        for (let i=0;i<preferences.length;i++){
            const preference_book=await fetch(`https://openlibrary.org/search.json?q=subject:${preferences[i]}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,isbn`).then(a=>a.json());
            if (preference_book["docs"]) {
                // Filter books to ensure they match the preference
                const matchingBooks = preference_book["docs"].filter(book => {
                    // Check if any of the book's subjects match the current preference
                    return book.subject?.some(subject => 
                        subject.toLowerCase().includes(preferences[i].toLowerCase())
                    );
                });

                for (let j = 0; j < Math.min(booksPerPreference, matchingBooks.length); j++) {
                    const book = matchingBooks[j];
                    // Only add the book if we haven't seen its key before
                    if (!booksMap.has(book.key)) {
                        // Find the first subject that matches user's preferences
                        const matchingSubject = book.subject?.find(subject => 
                            preferences.some(pref => 
                                subject.toLowerCase().includes(pref.toLowerCase())
                            )
                        );
                        
                        // If no matching subject found, use the current preference
                        book.primary_subject = matchingSubject || preferences[i];
                        booksMap.set(book.key, book);
                    }
                }
            }
        }
        
        // Convert Map values back to array and ensure we have exactly 30 books
        let books = Array.from(booksMap.values());
        
        // If we have fewer than 30 books, fetch more from the first preference
        if (books.length < 30) {
            const firstPreference = preferences[0];
            const additionalBooks = await fetch(`https://openlibrary.org/search.json?q=subject:${firstPreference}&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,isbn`).then(a=>a.json());
            
            if (additionalBooks["docs"]) {
                // Filter additional books to ensure they match the preference
                const matchingAdditionalBooks = additionalBooks["docs"].filter(book => 
                    book.subject?.some(subject => 
                        subject.toLowerCase().includes(firstPreference.toLowerCase())
                    )
                );

                for (let i = 0; i < matchingAdditionalBooks.length && books.length < 30; i++) {
                    const book = matchingAdditionalBooks[i];
                    if (!booksMap.has(book.key)) {
                        book.primary_subject = firstPreference;
                        books.push(book);
                        booksMap.set(book.key, book);
                    }
                }
            }
        }
        
        // If we still have fewer than 30 books, fetch from general fiction
        if (books.length < 30) {
            const fictionBooks = await fetch(`https://openlibrary.org/search.json?q=subject:Fiction&fields=key,title,author_name,first_publish_year,cover_i,subject,edition_count,isbn`).then(a=>a.json());
            
            if (fictionBooks["docs"]) {
                // Only add fiction books if they match at least one preference
                const matchingFictionBooks = fictionBooks["docs"].filter(book => 
                    book.subject?.some(subject => 
                        preferences.some(pref => 
                            subject.toLowerCase().includes(pref.toLowerCase())
                        )
                    )
                );

                for (let i = 0; i < matchingFictionBooks.length && books.length < 30; i++) {
                    const book = matchingFictionBooks[i];
                    if (!booksMap.has(book.key)) {
                        // Find the first subject that matches user's preferences
                        const matchingSubject = book.subject?.find(subject => 
                            preferences.some(pref => 
                                subject.toLowerCase().includes(pref.toLowerCase())
                            )
                        );
                        
                        book.primary_subject = matchingSubject || 'Fiction';
                        books.push(book);
                        booksMap.set(book.key, book);
                    }
                }
            }
        }
        
        // Ensure we have exactly 30 books
        books = books.slice(0, 30);
        
        return res.status(200).json(books);
    } catch(error) {
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

        // Updated prompt to request JSON format explicitly
        const prompt = `Create a summary of reader reviews for the book "${book_name}" by ${auth_name}. 
        Format your response as clean JSON with a single field "summary" containing the text summary.
        The output should be valid JSON in the following format: {"summary": "your summary text here"}
        Do not include code blocks like \`\`\`json or any other formatting.`;

        const result = await model.generateContent(prompt);
        
        if (!result || !result.response) {
            return res.status(500).json({ message: "Failed to generate AI review summary" });
        }

        // Get the text response
        let rawSummary = result.response.text().trim();
        
        // Clean up the response to ensure it's valid JSON
        // Remove any code block syntax if present
        rawSummary = rawSummary.replace(/```json|```/g, "").trim();
        
        let parsedSummary;
        try {
            // Try to parse the JSON
            parsedSummary = JSON.parse(rawSummary);
            
            // Return the parsed summary
            return res.status(200).json({ 
                book: book_name, 
                author: auth_name, 
                summary: parsedSummary.summary 
            });
        } catch (parseError) {
            console.error("Error parsing AI response as JSON:", parseError);
            
            // If parsing failed, return the raw text
            return res.status(200).json({ 
                book: book_name, 
                author: auth_name, 
                summary: rawSummary 
            });
        }
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
            res.status(400).json({message: "Both rating and review are required"});
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
        return res.status(500).json({message:"Internal server error"});
    }
};

export const getReview=async (req,res)=>{
    try {
        const bookName = req.body.bookName || req.query.bookName;

        if (!bookName){
            res.status(400).json({message: "Book name is required"});
        }
        const reviews=await Review.find({bookName:bookName});
        if (!reviews || reviews.length === 0) {
            return res.status(200).json({ message: "No reviews found for this book", reviews: [] });
        }
        else{
            return res.status(200).json({reviews});
        }

    } catch (error) {
        console.log("error in getReview: ",error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export const getAvailabilityInfo= async (req,res)=>{
    const baseUrl = "https://openweb.nlb.gov.sg/api/v2/Catalogue";
    const endpoint = "/GetAvailabilityInfo";
    const API_KEY="8(I<YgZlt6JB-BHg@G18#TTTe`w).eai"
    const APP_CODE="DEV-Shanmugapriyan"
    try{
        const {bookName, fieldName = "ISBN", bid} = req.body;
        
        // Validate parameters
        if (!bookName && !bid) {
            console.log("Error: Either ISBN or BID is required but neither was provided");
            return res.status(400).json({ message: "Either ISBN or BID is required" });
        }
        
        if (!fieldName) {
            console.log("Error: FieldName is required but was not provided");
            return res.status(400).json({ message: "FieldName is required" });
        }
        
        // Use BID if available, otherwise use ISBN
        const identifier = fieldName === "BID" ? (bid || bookName) : bookName;
        
        console.log(`Fetching availability using ${fieldName}: ${identifier}`);
        const url = `${baseUrl}${endpoint}?${fieldName}=${identifier}`;
        
        console.log("Request URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-Api-Key": API_KEY,
                "X-App-Code":APP_CODE,
                "Content-Type": "application/json"
            }
        });
    
        if (!response.ok) {
            const errorText = await response.text();
            console.log("NLB API Error Status:", response.status, response.statusText);
            console.log("NLB API Error Response:", errorText);
            
            try {
                // Try to parse error as JSON if possible
                const errorJson = JSON.parse(errorText);
                console.log("Parsed error:", errorJson);
                
                // Check for specific error types
                if (errorJson.message === "brn not found") {
                    return res.status(404).json({ 
                        message: "Book not found in library system",
                        error: errorJson,
                        status: response.status 
                    });
                }
                
                return res.status(response.status).json({ 
                    message: `Error from NLB API: ${errorJson.message || response.statusText}`,
                    error: errorJson,
                    status: response.status 
                });
            } catch (e) {
                // If not JSON, return as text
                return res.status(response.status).json({ 
                    message: `Error from NLB API: ${response.statusText}`,
                    error: errorText,
                    status: response.status 
                });
            }
        }
        
        const data = await response.json();
        console.log("NLB API Success Response:", data);
        
        if (!data || !data.items || data.items.length === 0) {
            console.log(`No availability information found for ${fieldName}: ${identifier}`);
            return res.status(404).json({ message: "No availability information found for this book" });
        }
        
        res.status(200).json({data});
    }catch(error){
        console.log("error in getAvailabilityInfo: ", error);
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

export const getPlaylist = async (req, res, next) => {
    try {
        const { bookCategory, bookName } = req.body || req.params;

        if (!bookCategory) {
            return res.status(400).json({ message: "Book Category is required" });
        }

        const prompt = `can you give a playlist of 10 songs when I am reading a book of category or genre ${bookCategory} and book name ${bookName} , just give the songs as json {title:songName,artist:artistName};`;

        const result = await model.generateContent(prompt);
        if (!result || !result.response) {
            return res.status(500).json({ message: "Failed to generate AI playlist" });
        }

        // Extract text response
        let playlistText = result.response.text();

        // Remove code block formatting (```json ... ```)
        playlistText = playlistText.replace(/```json|```/g, "").trim();

        // Parse into JSON object
        let playlist;
        try {
            playlist = JSON.parse(playlistText);
        } catch (error) {
            return res.status(500).json({ message: "Invalid JSON format from AI response" });
        }

        // Store the playlist in req.body and call next() without sending a response
        req.body.playlist = playlist;
        req.body.bookCategory=bookCategory;
        next();
    } catch (error) {
        console.log("Error in getPlaylist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTracks = async (req,res) =>{
    const playlist = req.body.playlist;
    const bookCategory = req.body.bookCategory;
    console.log("Book category:", bookCategory);
    console.log("Playlist:", playlist);
    
    // Check if playlist is valid
    if (!playlist || !Array.isArray(playlist) || playlist.length === 0) {
        console.error("Invalid playlist format:", playlist);
        return res.status(400).json({ message: "Invalid playlist format" });
    }
    
    const tracks = [];

    const getAccessToken = async () => {
        try {
            // Create the base64 encoded credentials string
            const credentials = Buffer.from(process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET).toString("base64");
            
            const response = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + credentials
                },
                body: "grant_type=client_credentials"
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Spotify API error response:", errorText);
                throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error("Error getting Spotify access token:", error);
            throw error;
        }
    };
    
    try {
        const token = await getAccessToken();
        console.log("Got Spotify token:", token.substring(0, 10) + "...");
        
        for (let i = 0; i < playlist.length; i++) {
            // Check if the playlist item has a title property
            if (!playlist[i] || !playlist[i].title) {
                console.error("Invalid playlist item:", playlist[i]);
                continue;
            }
            
            const song = playlist[i].title;
            console.log(`Searching for song: ${song}`);
            
            // Use the exact same format as the curl example
            const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            if (!result.ok) {
                const errorText = await result.text();
                console.error(`Error searching for track "${song}":`, result.status, result.statusText);
                console.error("Error details:", errorText);
                continue;
            }
            
            const data = await result.json();
            console.log(`Found ${data.tracks?.items?.length || 0} tracks for "${song}"`);
            
            // Extract the external_urls.spotify, uri, and album cover image
            if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
                const track = data.tracks.items[0];
                tracks.push({
                    songName: song,
                    external_urls: track.external_urls,
                    // uri: track.uri,
                    albumCover: track.album?.images?.[0]?.url || null
                });
            }
        }
        
        // Return the tracks in the format expected by the client
        res.status(200).json({ tracks });
    } catch (error) {
        console.error("Error in getTracks:", error);
        // Only send one error response
        res.status(500).json({ message: "Failed to fetch tracks from Spotify" });
    }
}

export const postRating = async (req, res) => {
    try {
        const { userName, bookName, stars } = req.body;
        
        if (!userName || !bookName || !stars) {
            return res.status(400).json({ message: "Both rating and review are required" });
        }
        // Validate star rating
        if (stars < 1 || stars > 5 || !Number.isInteger(stars)) {
            return res.status(400).json({ message: "Star rating must be an integer between 1 and 5" });
        }
        // Create a new review with just the rating
        const newReview = new Review({
            userName,
            bookName,
            stars,
            review: "" // Empty review for rating-only submissions
        });
        await newReview.save();
        
        // Calculate and return the average rating
        const allReviews = await Review.find({ bookName });
        const averageRating = allReviews.reduce((acc, review) => acc + review.stars, 0) / allReviews.length;
        
        return res.status(200).json({
            message: "Rating submitted successfully",
            averageRating: averageRating.toFixed(1),
            totalRatings: allReviews.length
        });
    } catch (error) {
        console.log("error in postRating: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const getAverageRating = async (req, res) => {
    try {
        const { bookName } = req.query;
        
        if (!bookName) {
            return res.status(400).json({ message: "Book name is required" });
        }
        
        const reviews = await Review.find({ bookName });
        
        if (!reviews || reviews.length === 0) {
            return res.status(200).json({
                averageRating: 0,
                totalRatings: 0
            });
        }
        
        const averageRating = reviews.reduce((acc, review) => acc + review.stars, 0) / reviews.length;
        
        return res.status(200).json({
            averageRating: averageRating.toFixed(1),
            totalRatings: reviews.length
        });
    } catch (error) {
        console.log("error in getAverageRating: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


