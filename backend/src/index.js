import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; //this allows to get cookies
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json()); // to get data from frontend
app.use(cookieParser());

app.use("/api/auth",authRoutes);

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`);
    connectDB()
})
console.log()