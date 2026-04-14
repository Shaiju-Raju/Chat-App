import express from 'express';
import authRouters from "./routes/authRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());


app.use("/api/auth/",authRouters);

app.get("/", (req, res) => {
  res.send("Chat App Backend Running");
});

export default app