import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    club: {type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true},
    text: {type: String, required: true},
    image: {type: String},
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;