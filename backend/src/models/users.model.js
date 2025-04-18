import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    firstName: {type:String, required: true},
    lastName: {type:String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 8},
    profilePic:  {type: String, default: ""},
    preferences: {type:[String], required: true},
    location: {type: String, required: true},
    forgotPasswordPin: {type:String,required: true},
},{timestamps: true});

const User=mongoose.model("User",userSchema);

export default User;