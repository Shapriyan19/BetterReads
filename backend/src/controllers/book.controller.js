import User from "../models/users.model.js";

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