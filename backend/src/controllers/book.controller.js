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