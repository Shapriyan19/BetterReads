import Club from "../models/clubs.model.js";

export const createClub=async (req, res) => {
    try {
        const { name, description, image } = req.body;
        
        const newClub = new Club({
            name,
            adminName: `${req.user.firstName} ${req.user.lastName}`,
            description,
            image,
            roles: [
                {
                    role: 'admin',
                    user: req.user._id.toString()
                }
            ]
        });
        
        await newClub.save();
        
        res.status(201).json({
            success: true,
            data: newClub
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getClubs= async (req, res) => {
    try {
        const clubs = await Club.find();
        
        res.status(200).json({
            success: true,
            count: clubs.length,
            data: clubs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const getClub= async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const updateClub= async (req, res) => {
    try {
        const { description, image } = req.body;
        
        const updateData = {};
        if (description) updateData.description = description;
        if (image) updateData.image = image;
        
        const club = await Club.findByIdAndUpdate(
            req.params.clubId,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: club
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteClub= async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        await club.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Club successfully deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};