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

  console.log("Token from Client:", token);

  if (!token) {
    return next(new Error("No Token"));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET)
    socket.user = decode;
    console.log("Decode User", decode);

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
  console.log("🟢 User connected:", socket.id);

  socket.on("send_message", (data)=> {
    console.log("📩 Message:", data);

    io.emit("receive_message", data);
  })

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


//Server Config
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});