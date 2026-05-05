import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// user Verification
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {    
    return next(new Error("No Token"));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decode;
  
    next ();
  } catch (err) {
    if(err.name === "TokenExpiredError") {
      return next(new Error("Token expired"));
    }
    return next(new Error("Invalid token"));
  }
});


//Real time chating after verificatioin
io.on("connection", (socket) => {
  socket.emit("user_data", socket.user);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined ${room}`);
  });

  socket.on("leave_room", (room) => {
    socket.leave(room);
  });

  socket.on("send_message", (data) => {
    const { room, ...message } = data;
    io.to(room).emit("receive_message", message);
  });
  


  socket.on("disconnect", () => {
  });
});


//Server Config
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});