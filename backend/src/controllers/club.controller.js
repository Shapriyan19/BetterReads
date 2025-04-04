import Club from "../models/clubs.model.js";
import cloudinary from "../lib/cloudinary.js";

export const createClub = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Received files:', req.file);
        console.log('User info:', req.user);
        
        const { name, description, adminName, genres, roles } = req.body;
        console.log('Extracted fields:', { name, description, adminName, genres, roles });
        
        // Validate required fields
        if (!name || !name.trim()) {
            console.log('Name validation failed:', { name });
            return res.status(400).json({
                success: false,
                message: "Club name is required"
            });
        }

        if (!description || !description.trim()) {
            console.log('Description validation failed:', { description });
            return res.status(400).json({
                success: false,
                message: "Club description is required"
            });
        }

        let parsedGenres = [];
        let parsedRoles = [];
        
        // Parse genres
        try {
            if (req.body.genres) {
                parsedGenres = JSON.parse(req.body.genres);
                if (!Array.isArray(parsedGenres)) {
                    throw new Error('Genres must be an array');
                }
                console.log('Parsed genres:', parsedGenres);
            }
        } catch (error) {
            console.error("Error parsing genres:", error);
            return res.status(400).json({ 
                success: false,
                message: "Invalid genres format. Please provide a valid array of genres."
            });
        }

        // Parse roles
        try {
            if (req.body.roles) {
                parsedRoles = JSON.parse(req.body.roles);
                if (!Array.isArray(parsedRoles)) {
                    throw new Error('Roles must be an array');
                }
                console.log('Parsed roles:', parsedRoles);
            }
        } catch (error) {
            console.error("Error parsing roles:", error);
            return res.status(400).json({ 
                success: false,
                message: "Invalid roles format. Please provide a valid array of roles."
            });
        }

        // Upload image to cloudinary if provided
        let imageUrl = "";
        if (req.file) {
            try {
                // Convert buffer to base64
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                
                const result = await cloudinary.uploader.upload(dataURI, {
                    resource_type: "auto",
                });
                imageUrl = result.secure_url;
            } catch (error) {
                console.error("Error uploading to cloudinary:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading image"
                });
            }
        }

        // Create new club with validated data
        const newClub = new Club({
            name: name.trim(),
            adminName: adminName || `${req.user.firstName} ${req.user.lastName}`,
            description: description.trim(),
            image: imageUrl,
            genres: parsedGenres,
            roles: parsedRoles.length > 0 ? parsedRoles : [{
                role: 'admin',
                user: req.user._id.toString()
            }]
        });

        await newClub.save();

        res.status(201).json({
            success: true,
            data: newClub
        });
    } catch (error) {
        console.error("Error creating club:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Error creating club"
        });
    }
};

export const getClubs = async (req, res) => {
    try {
        console.log('Fetching all clubs...');
        const clubs = await Club.find().populate('roles.user', 'firstName lastName');
        console.log('Found clubs:', clubs);
        
        res.status(200).json({
            success: true,
            data: clubs
        });
    } catch (error) {
        console.error('Error fetching clubs:', error);
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

export const getUserClubs = async (req, res) => {
    try {
        const clubs = await Club.find({
            'roles.user': req.user._id.toString()
        });
        
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