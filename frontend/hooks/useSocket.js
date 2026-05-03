import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

export default function useSocket() {
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
    const token = localStorage.getItem("token");

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
        setSocket(newSocket);
    });

    // ✅ Receive user from backend (recommended way)
    newSocket.on("user_data", (userData) => {
        setUser(userData);
    });

    return () => {
        newSocket.disconnect();
    };
    }, [navigate]);

    return {socket, user};
}