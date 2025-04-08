import {Server} from "socket.io";

// This function will be called from index.js with the HTTP server
export const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"]
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        // Join a club's chat room
        socket.on("join_club_chat", (clubId) => {
            socket.join(`club_${clubId}`);
            console.log(`User ${socket.id} joined club chat: ${clubId}`);
        });

        // Leave a club's chat room
        socket.on("leave_club_chat", (clubId) => {
            socket.leave(`club_${clubId}`);
            console.log(`User ${socket.id} left club chat: ${clubId}`);
        });

        // Handle new chat messages - this is now handled by the backend controller
        // We're keeping this for backward compatibility
        socket.on("send_message", (data) => {
            console.log("Received message from socket:", data);
            // We don't need to do anything here as the backend controller handles this
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected", socket.id);
        });
    });

    return io;
};