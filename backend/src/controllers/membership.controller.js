import User from "../models/users.model.js";
import Club from "../models/clubs.model.js";

export const joinClub= async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Check if user is already a member
        const existingMember = club.roles.find(
            role => role.user === req.user._id.toString()
        );
        
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this club'
            });
        }
        
        // Add user as a member
        club.roles.push({
            role: 'member',
            user: req.user._id.toString()
        });
        
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Successfully joined the club',
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const leaveClub= async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Check if user is the main admin
        if (club.adminName === `${req.user.firstName} ${req.user.lastName}`) {
            return res.status(400).json({
                success: false,
                message: 'Main admin cannot leave the club. Transfer ownership or delete the club instead.'
            });
        }
        
        // Find role index
        const roleIndex = club.roles.findIndex(
            role => role.user === req.user._id.toString()
        );
        
        if (roleIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'You are not a member of this club'
            });
        }
        
        // Remove role
        club.roles.splice(roleIndex, 1);
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Successfully left the club'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const promoteRole= async (req, res) => {
    try {
        const club = req.club;
        const userId = req.params.userId;
        
        // Find the member's role
        const roleIndex = club.roles.findIndex(
            role => role.user === userId && role.role === 'member'
        );
        
        if (roleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        // Update role to admin
        club.roles[roleIndex].role = 'admin';
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Member promoted to admin',
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const demoteRole= async (req, res) => {
    try {
        const club = req.club;
        const userId = req.params.userId;
        
        // Cannot demote the main admin
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const fullName = `${user.firstName} ${user.lastName}`;
        if (club.adminName === fullName) {
            return res.status(400).json({
                success: false,
                message: 'Cannot demote the main admin'
            });
        }
        
        // Find the admin's role
        const roleIndex = club.roles.findIndex(
            role => role.user === userId && role.role === 'admin'
        );
        
        if (roleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }
        
        // Update role to member
        club.roles[roleIndex].role = 'member';
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Admin demoted to member',
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const removeMember=async (req, res) => {
    try {
        const club = req.club;
        const userId = req.params.userId;
        
        // Cannot remove the main admin
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const fullName = `${user.firstName} ${user.lastName}`;
        if (club.adminName === fullName) {
            return res.status(400).json({
                success: false,
                message: 'Cannot remove the main admin'
            });
        }
        
        // Find the role
        const roleIndex = club.roles.findIndex(
            role => role.user === userId
        );
        
        if (roleIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }
        
        // Remove role
        club.roles.splice(roleIndex, 1);
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Member removed successfully',
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const getMembers=async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Fetch user details for all members
        const memberIds = club.roles.map(role => role.user);
        const members = await User.find(
            { _id: { $in: memberIds } },
            'firstName lastName email profilePic location'
        );
        
        // Combine with role information
        const membersWithRoles = members.map(member => {
            const role = club.roles.find(r => r.user === member._id.toString());
            return {
                user: member,
                role: role.role
            };
        });
        
        res.status(200).json({
            success: true,
            count: membersWithRoles.length,
            data: membersWithRoles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

export const transferOwnership=async (req, res) => {
    try {
        const club = await Club.findById(req.params.clubId);
        
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }
        
        // Check if current user is the main admin
        if (club.adminName !== `${req.user.firstName} ${req.user.lastName}`) {
            return res.status(403).json({
                success: false,
                message: 'Only the main admin can transfer ownership'
            });
        }
        
        const newAdminId = req.params.userId;
        const newAdmin = await User.findById(newAdminId);
        
        if (!newAdmin) {
            return res.status(404).json({
                success: false,
                message: 'New admin not found'
            });
        }
        
        // Update admin name
        club.adminName = `${newAdmin.firstName} ${newAdmin.lastName}`;
        
        // Make sure new admin has admin role
        const adminRoleIndex = club.roles.findIndex(
            role => role.user === newAdminId
        );
        
        if (adminRoleIndex === -1) {
            // Add new admin to roles if not present
            club.roles.push({
                role: 'admin',
                user: newAdminId
            });
        } else {
            // Update role to admin if already a member
            club.roles[adminRoleIndex].role = 'admin';
        }
        
        await club.save();
        
        res.status(200).json({
            success: true,
            message: 'Club ownership transferred successfully',
            data: club
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};