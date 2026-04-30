import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../pages/chat.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);

  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ❌ No token → go login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const newSocket = io(API_URL, {
      auth: { token },
    });

    // ❌ Backend rejects (expired / invalid)
    newSocket.on("connect_error", (err) => {
      console.log("❌ Connection error:", err.message);

      if (
        err.message === "Token expired" ||
        err.message === "Invalid token" ||
        err.message === "No Token"
      ) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    });

    // ✅ Connected successfully
    newSocket.on("connect", () => {
      console.log("✅ Connected:", newSocket.id);

      // 🔥 Get user from backend (decoded token)
      const decodedUser = newSocket.auth?.user || null;

      // OR better: backend should emit user (recommended)
      newSocket.emit("get_user");

      setSocket(newSocket);
    });

    // ✅ Receive user from backend (recommended way)
    newSocket.on("user_data", (userData) => {
      setUser(userData);
    });

    // ✅ Receive messages
    newSocket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate]);

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // ✅ Send message
  const sendMessage = () => {
    if (!message.trim() || !user || !socket) return;

    const msgData = {
      text: message,
      sender: user.username,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", msgData);
    setMessage("");
  };

  // ⏳ While connecting / loading
  if (!socket) return <p>Connecting...</p>;
  if (!user) return <p>Loading user...</p>;

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">ChatApp</h2>
      </div>

      {/* CHAT AREA */}
      <div className="chat-area">
        <div className="chat-header">
          <div className="avatar"></div>
          <h3>{user.username}</h3>
        </div>

        <div className="chat-box">
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === user.username
                  ? "my-message"
                  : "other-message"
              }`}
            >
              <p>{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <div className="input-box">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>
    </div>
  );
}