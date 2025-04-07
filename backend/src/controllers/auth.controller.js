import { generateToken } from "../lib/utils.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import transporter from "../lib/nodemailer.js";
import {passwordStrength} from "check-password-strength";
import passwordcheck from "../lib/passwordcheck.js";
import pingenertation from "../lib/pingeneration.js";
import BookVault from "../models/bookvaults.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

export const signup = async (req, res) => {
    try {    
        console.log("Raw request body:", req.body);
        console.log("Content-Type:", req.headers['content-type']);
        
        const { email, firstName, lastName, password, location } = req.body;
        let preferences;
        
        try {
            preferences = JSON.parse(req.body.preferences);
        } catch (error) {
            console.error("Error parsing preferences:", error);
            return res.status(400).json({ message: "Invalid preferences format" });
        }
        
        console.log("Extracted fields:", {
            email,
            firstName,
            lastName,
            password: password ? "exists" : "missing",
            preferences,
            location
        });

        // Validate all required fields
        const missingFields = [];
        if (!firstName) missingFields.push("firstName");
        if (!lastName) missingFields.push("lastName");
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        if (!location) missingFields.push("location");
        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            missingFields.push("preferences");
        }

        if (missingFields.length > 0) {
            console.log("Missing fields:", missingFields);
            return res.status(400).json({
                message: "All fields except profile picture is required",
                missingFields: missingFields
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const passwordSecurity = passwordStrength(password, passwordcheck).value;

        if (passwordSecurity === "Too weak" || passwordSecurity === "Weak") {
            return res.status(400).json({ message: "Your password must include atleast 1 uppercase, 1 lowercase character, a number and a symbol" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const forgot_password_pin = pingenertation();

        // Handle profile picture if uploaded
        let profilePic = "";
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path);
                profilePic = result.secure_url;
            } catch (error) {
                console.error("Error uploading to cloudinary:", error);
                // Continue without profile pic if upload fails
            }
        }

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic,
            preferences,
            location,
            forgotPasswordPin: forgot_password_pin,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            
            res.status(201).json({
                firstName,
                lastName,
                email,
                profilePic,
                preferences,
                location
            });

            try {
                await transporter.sendMail({
                    from: '"Betterreads" <hailee0@ethereal.email>',
                    to: email,
                    subject: "Welcome to BetterReads",
                    text: "Thanks for signing up for BetterReads",
                });
            } catch (error) {
                console.log("Error in sending mail", error.message);
            }
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.error("Error in signup controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login =async (req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }

        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"});
        }

        generateToken(user._id,res);
        res.status(200).json({
            id:user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePic: user.profilePic,
            preferences: user.preferences,
            location: user.location
        })
    }catch(error){
        console.log("Error in login controller",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const logout = (req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    }catch(error){
        console.log("Error in logout controller",error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
};

export const updateProfile= async(req,res)=>{
    try {
        console.log("Received update profile request");
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);
        
        const userId = req.user._id;
        let profilePic = "";

        // Check if profilePic is in the request files
        if (req.files && req.files.profilePic) {
            console.log("Processing uploaded file...");
            const file = req.files.profilePic;
            console.log("File details:", {
                name: file.name,
                size: file.size,
                mimetype: file.mimetype,
                tempFilePath: file.tempFilePath
            });
            
            try {
                const result = await cloudinary.uploader.upload(file.tempFilePath);
                console.log("Cloudinary upload result:", result);
                profilePic = result.secure_url;
            } catch (cloudinaryError) {
                console.error("Error uploading to Cloudinary:", cloudinaryError);
                return res.status(500).json({ message: "Error uploading image to cloud storage" });
            }
        } else {
            console.log("No file found in request");
            return res.status(400).json({ message: "Profile picture file is required" });
        }

        console.log("Updating user profile with new picture URL:", profilePic);
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: profilePic },
            { new: true }
        );

        if (!updateUser) {
            console.log("User not found for update");
            return res.status(404).json({ message: "User not found" });
        }

        // Update all reviews by this user with the new profile picture
        const userName = updateUser.firstName + updateUser.lastName;
        console.log("Updating all reviews for user:", userName);
        
        try {
            const Review = mongoose.model("Review");
            const updateResult = await Review.updateMany(
                { userName: userName },
                { profilePic: profilePic }
            );
            console.log("Updated reviews:", updateResult.modifiedCount);
        } catch (reviewError) {
            console.error("Error updating reviews:", reviewError);
            // Continue with the response even if review update fails
        }

        console.log("Profile updated successfully");
        res.status(200).json(updateUser);
    } catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }    
};

export const sendForgotPasswordPin = async(req,res)=>{
    try{
        const {email}=req.body;
        if(!email){
            return res.status(400).json({message: "Email is required."});
        }
        const user=await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"Enter a valid email address."});
        }

        const forgot_password_pin=user.forgotPasswordPin;

        try{
            const info = await transporter.sendMail({
                from: '"Betterreads" <hailee0@ethereal.email>',
                to: email,
                subject: "Reset Your Password",
                text: `A password reset was requested for your BetterReads account. Use the following PIN to reset your password: ${forgot_password_pin}`,
                html: `<p>A password reset was requested for your BetterReads account.</p>
                       <p>Use the following PIN to reset your password: <strong>${forgot_password_pin}</strong></p>
                       <p>If you didn't request this, please ignore this email.</p>`
            });
            res.status(200).json({ message: "PIN sent successfully" });
        }catch(error){
            console.log("Error in sending mail",error.message);
            return res.status(500).json({ message: "Failed to send email. Please try again." });
        }
    }catch(error){
        console.log("Error in sendForgotPasswordPin controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const verifyForgotPasswordPin = async (req,res)=>{
    try {
        const {email, forgotPasswordPin}=req.body;
        const user=await User.findOne({email});
        
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        if(!forgotPasswordPin){
            return res.status(400).json({message: "Forgot Password Pin is required to reset password. Please Check you email."})
        }

        if(forgotPasswordPin!==user.forgotPasswordPin){
            return res.status(400).json({message:"Invalid PIN. Please try again."});
        }

        res.status(200).json({ message: "PIN verified successfully" });
    }catch(error){
        console.log("Error in forgotPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updatePassword = async (req,res)=>{
    try{
        const {email, newPassword} = req.body;
        const user=await User.findOne({email});

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!newPassword) {
            return res.status(400).json({ message: "New Password is required" });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        const passwordSecurity=passwordStrength(newPassword,passwordcheck).value;

        if (passwordSecurity==="Too weak" || passwordSecurity==="Weak"){
            return res.status(400).json({message: "Your password must include atleast 1 uppercase, 1 lowercase character, a number and a symbol"});
        }

        //hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(newPassword,salt);
        const forgot_password_pin=pingenertation();

        const updateUser=await User.findByIdAndUpdate(
            user._id,
            {password: hashedPassword,
            forgotPasswordPin: forgot_password_pin,
            },
            {new: true} //sends updated user
        );

        res.status(200).json({ message: "Password updated successfully" });
    }catch(error){
        console.log("Error in updatePassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const addToBookVault = async (req,res)=>{
    try {
        const {vaultName,bookName}=req.body;
        if(!vaultName || !BookVault){
            return res.status(400).json({message: "Vault Name is required"});
        }

        const userBookVault=await BookVault.find({email});
        for (var i=0;i<userBookVault.length;i++){
            if(userBookVault[i].vaultName===vaultName){
                console.log(userBookVault[i].vaultName);
                const updatedBookList = [...userBookVault[i].bookList, bookName];
                const updateUserBookVault= await BookVault.findByIdAndUpdate(
                userBookVault[i]._id,
                {bookList: updatedBookList},
                {new: true}
                );

                return res.status(200).json(updateUserBookVault);
            }
        }

        const newUserBookVault=new BookVault({
            email,
            vaultName,
            bookList: [bookName],
        });

        await newUserBookVault.save();
        res.status(201).json(newUserBookVault);
    } catch (error) {
        console.log("Error in addToBookVault controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getBookVault=async(req,res)=>{
    try {
        const {email}=req.user.email;
        if(!email){
            return res.status(400).json({message: "Could not find user"});
        }

        const userBookVault=await BookVault.find({email});
        if(!userBookVault){
            res.status(200).json({message:"No BookVault found. Start adding books to your book Vault"});
        }
        else{
            res.status(200).json(userBookVault);
        }
    } catch (error) {
        console.log("Error in addToBookVault controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}