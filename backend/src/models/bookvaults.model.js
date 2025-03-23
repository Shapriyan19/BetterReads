import mongoose from "mongoose";

const bookVaultSchema=new mongoose.Schema({
    email: {type:String, required:true},
    vaultName: {type:String, required: true},
    bookList: {type:[String]},
});

const BookVault=mongoose.model("BookVault",bookVaultSchema);
export default BookVault;