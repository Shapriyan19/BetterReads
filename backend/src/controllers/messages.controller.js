import Message from "../models/messages.model.js";

// Get messages for a club
export const getClubMessages = async (req, res) => {
  try {
    const { clubId } = req.params;
    const messages = await Message.find({ club: clubId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'firstName lastName profilePic');
    
    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error("Error fetching club messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });
  }
};

// Save a new message
export const saveMessage = async (req, res) => {
  try {
    console.log("Received message request:", req.body);
    console.log("User from request:", req.user);
    
    const { text, clubId } = req.body;
    
    if (!text || !clubId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: text or clubId"
      });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }
    
    const senderId = req.user._id;

    const newMessage = new Message({
      text,
      senderId,
      club: clubId
    });

    console.log("Saving new message:", newMessage);
    await newMessage.save();
    console.log("Message saved successfully");
    
    // Populate sender info for the response
    await newMessage.populate('senderId', 'firstName lastName profilePic');
    console.log("Message populated with sender info");
    
    // Get io instance from app
    const io = req.app.get('io');
    if (!io) {
      console.error("Socket.io instance not found in app");
      return res.status(500).json({
        success: false,
        message: "Socket.io instance not available"
      });
    }
    
    // Format the message data for socket emission
    const messageData = {
      _id: newMessage._id,
      text: newMessage.text,
      userId: newMessage.senderId._id,
      username: `${newMessage.senderId.firstName} ${newMessage.senderId.lastName}`,
      timestamp: newMessage.createdAt.toISOString() // Use ISO string format for consistent parsing
    };
    
    console.log("Emitting message to socket:", messageData);
    // Emit the message to all users in the club's chat room
    io.to(`club_${clubId}`).emit('receive_message', messageData);

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save message",
      error: error.message
    });
  }
}; 