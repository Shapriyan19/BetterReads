import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import Club from "../models/clubs.model.js"

export const protectRoute=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:"Unauthorized-No Token Provided"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({message:"Unauthorized-Invalid Token"});
        }

        const user=await User.findById(decoded.userId).select("-password"); //retreving everything except the password

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        req.user=user;
        next();
    } catch (error) {
        console.log("Error in protect auth middleware: ",error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

// Check if user is admin of the club
export const isClubAdmin = async (req, res, next) => {
    const clubId = req.params.clubId;
    
    try {
        const club = await Club.findById(clubId);
        
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        // Check if user is admin
        const isAdmin = club.roles.some(
            role => role.role === 'admin' && role.user.toString() === req.user._id.toString()
        );
        
        if (isAdmin) {
            req.club = club;
            return next();
        }
        
        return res.status(403).json({ success: false, message: 'Not authorized as a club admin' });
    } catch (error) {
        console.log("Error in isClubAdmin middleware:", error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Check if user is a member of the club
export const isClubMember = async (req, res, next) => {
    const clubId = req.params.clubId;
    
    try {
        const club = await Club.findById(clubId);
        
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        const isMember = club.roles.some(
            role => role.user.toString() === req.user._id.toString()
        );
        
        if (isMember) {
            req.club = club;
            return next();
        }
        
        return res.status(403).json({ success: false, message: 'Not authorized as a club member' });
    } catch (error) {
        console.log("Error in isClubMember middleware:", error.message);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};