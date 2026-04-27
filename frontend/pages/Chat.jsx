import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "../pages/chat.css";
import useLocalStorage from "../hooks/useLocalStorage";

const API_URL = import.meta.env.VITE_API_URL;

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useLocalStorage("user", null);

  const chatEndRef = useRef(null); // ✅ inside component

  // ✅ Load user + create socket (ONLY ONCE)
  useEffect(() => {
    if (!user) return; // wait until user loads

    const newSocket = io(API_URL, {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    setSocket(newSocket);

    newSocket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []); // ✅ EMPTY dependency

  // ✅ Auto scroll when chat updates
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

  if (!user) return <p>Loading...</p>;

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