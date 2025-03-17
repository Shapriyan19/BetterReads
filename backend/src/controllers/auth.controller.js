import { generateToken } from "../lib/utils.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import transporter from "../lib/nodemailer.js";
import {passwordStrength} from "check-password-strength";
import passwordcheck from "../lib/passwordcheck.js";

export const signup =async (req,res)=>{
    const {email,firstName,lastName,password,profilePic,preferences,location}=req.body;
    try{    
        if(!firstName || !lastName || !email || !preferences || !location){
            return res.status(400).json({message: "All fields except profile picture is required"});
        }

        if (password.length<8){
            return res.status(400).json({message: "Password must be at least 8 characters"});
        }

        const passwordSecurity=passwordStrength(password,passwordcheck).value;

        if (passwordSecurity==="Too weak" || passwordSecurity==="Weak"){
            return res.status(400).json({message: "Your password must include atleast 1 uppercase, 1 lowercase character, a number and a symbol"});
        }

        const user=await User.findOne({email}); //finding if user exist with same email adddress
        
        if (user) return res.status(400).json({message:"Email already exist"});
        //hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser= new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            profilePic: profilePic,
            preferences: preferences,
            location: location
        });

        if(newUser){
            //generate jwt token 
            generateToken(newUser._id,res);
            await newUser.save(); //saving to the database
            res.status(201).json({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword,
                profilePic: profilePic,
                preferences: preferences,
                location: location
            });
            try{
                const info = await transporter.sendMail({
                    from: '"Betterreads" <hailee0@ethereal.email>',
                    to: email,
                    subject: "Welcome to BetterReads",
                    text: "Thanks for signing up fot BetterReads",
                });
                console.log("Message sent",info.messageId);
            }catch(error){
                console.log("Error in sending mail",error.message);
            }
        } else{
            res.status(400).json({message: "Invalid user data"});
        }

    }catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json({message: "Internal Server Error"});
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
        const {profilePic}=req.body;
        const userId= req.user._id;

        if(!profilePic){
            return res.status(400).json({messahe: "Profile pic is required"});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic);
        const updateUser=await findByIdAndUpdate(
            userId,
            {profilePic: uploadResponse.secure_url},
            {new: true} //sends updated user
        );

        res.status(200).json(updateUser);
    } catch (error) {
        console.log("error in update profile: ",error);
        res.status(500).json({message:"Internal server error"});
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