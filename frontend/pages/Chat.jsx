import { useEffect } from "react";
import {io} from "socket.io-client";
const API_URL = import.meta.env.VITE_API_URL;

const socket = io(API_URL);


export default function Chat() {

  useEffect ( ()=> {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    return () => {
      socket.disconnect();
    };
  },[]);
  return (
    <div>
      <h1>Welcome to Chat App 🚀</h1>
    </div>
  );
}