import mongoose from "mongoose";

const reviewSchema=new mongoose.Schema({
    userName: {type:String, required: true},
    bookName: {type:String, required: true},
    profilePic:  {type: String, default: ""},
    stars: {type: Number, required: true},
    review: {type: String},
},{timestamps: true});

const Review=mongoose.model("Review",reviewSchema);

export default Review;