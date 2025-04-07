import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; //this allows to get cookies
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import clubRoutes from "./routes/club.routes.js";
import membershipRoutes from "./routes/membership.routes.js";
import cors from "cors";
import fileUpload from "express-fileupload";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/membership', membershipRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
console.log()