import { generateToken } from "../lib/utils.js";
import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import transporter from "../lib/nodemailer.js";
import {passwordStrength} from "check-password-strength";
import passwordcheck from "../lib/passwordcheck.js";
import pingenertation from "../lib/pingeneration.js";

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
        const forgot_password_pin=pingenertation();
        const newUser= new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            profilePic: profilePic,
            preferences: preferences,
            location: location,
            forgotPasswordPin: forgot_password_pin,
        });

        if(newUser){
            //generate jwt token 
            generateToken(newUser._id,res);
            await newUser.save(); //saving to the database
            res.status(201).json({
                firstName: firstName,
                lastName: lastName,
                email: email,
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
            return res.status(400).json({message: "Profile pic is required"});
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

export const sendForgotPasswordPin = async(req,res,next)=>{
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
                subject: "Pin to reset password",
                text:  `Your pin to reset your password for email ${email} is ${forgot_password_pin}`,
            });
        }catch(error){
            console.log("Error in sending mail",error.message);
            return res.status(500).json({ message: "Failed to send email. Please try again." });
        }

        req.body.user=user;
        next();
    }catch(error){
        console.log("Error in sendForgotPasswordPin controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const forgotPassword = async (req,res,next)=>{
    try {
        const {forgotPasswordPin}=req.body;
        const user=req.body.user;
        
        if(!forgotPasswordPin){
            return res.status(400).json({message: "Forgot Password Pin is required to reset password. Please Check you email."})
        }

        if(forgotPasswordPin!==user.forgotPasswordPin){
            return res.status(400).json({message:"Forgot Password Pin is invalid."});
        }

        req.body.user=user;
        next();
    }catch(error){
        console.log("Error in forgotPassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updatePassword = async (req,res)=>{
    try{
        const {newPassword} = req.body;
        const userId=req.body.user._id;

        const passwordSecurity=passwordStrength(newPassword,passwordcheck).value;

        if (passwordSecurity==="Too weak" || passwordSecurity==="Weak"){
            return res.status(400).json({message: "Your password must include atleast 1 uppercase, 1 lowercase character, a number and a symbol"});
        }
        //hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(newPassword,salt);

        if(!newPassword){
            return res.status(400).json({message: "New Password is required"});
        }

        if(!userId){
            return res.status(400).json({message:"User not found"});
        }
        const forgot_password_pin=pingenertation();
        const updateUser=await User.findByIdAndUpdate(
            userId,
            {password: hashedPassword,
            forgotPasswordPin: forgot_password_pin,
            },
            {new: true} //sends updated user
        );

        res.status(200).json(updateUser);
    }catch(error){
        console.log("Error in updatePassword controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}