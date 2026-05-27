import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import "../pages/chat.css";
import useSocket from "../hooks/useSocket.js";


export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const {socket, user} = useSocket()
  const [currentRoom, setCurrentRoom] = useState("room1");
  const rooms = [
    { id: "room1", name: "General Chat" },
    { id: "room2", name: "Developers" },
    { id: "room3", name: "Friends" },
  ];


  const handleRoomClick = (roomId) => {
    if (!socket) return;

    // leave old room
    socket.emit("leave_room", currentRoom);

    // join new room
    socket.emit("join_room", roomId);

    setCurrentRoom(roomId);
    setChat([]); // clear old messages
  };


  useEffect (() => {
    if(!socket) return;

    socket.emit("join_room", currentRoom);

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("old messages", (messages) => {
      setChat(messages);
    })

    return () => {
      socket.off("receive_message");
      socket.off("old messages");
    };
  },[socket])


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

    socket.emit("send_message", {
      room:currentRoom,
      ...msgData
    });
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
        <div className="user-list">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="user-item"
              onClick={() => handleRoomClick(room.id)}
            >
              <div className="avatar"></div>
              <div>
                <div className="name">{room.name}</div>
              </div>
            </div>
          ))}
        </div>
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

            {/* show name only for other user */}
              {msg.sender !== user.username && (
                <p className="sender-name">{msg.sender}</p>
              )}
              <p>{msg.text}</p>
              <span className="time">{msg.time}</span>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <form 
          className="input-box"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" disabled={!message.trim()}>➤</button>
        </form>
      </div>
    </div>
  );
}