import mongoose from "mongoose";

const bookSchema=new mongoose.Schema({
    bookName: {type: String, required: true},
    genre: {type: String, required: true},
    authorName: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String},
    rating: {type: Number},
    imdbNumber: {type: String},
},{timestamp: true});

const Book=mongoose.model("Book", bookSchema);

export default Book;