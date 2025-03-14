import mongoose from "mongoose";

const clubSchema=new mongoose.Schema({
    adminName: {type: String, required: true},
    roles: [{role:{type: String, required: true}, user: {type: String, required: true}}],
    description: {type: String, required: true},
    image: {type: String},
},{timestamp: true});

const Club=mongoose.model("Club", clubSchema);

export default Club;