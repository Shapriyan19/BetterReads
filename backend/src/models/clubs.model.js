import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    adminName: {type: String, required: true},
    roles: [{
        role: {type: String, required: true},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
    }],
    description: {type: String, required: true},
    image: {type: String},
    genres: [{type: String}],
}, {timestamps: true});

const Club = mongoose.model("Club", clubSchema);

export default Club;