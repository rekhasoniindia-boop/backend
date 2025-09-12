import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRouter from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cors from "cors";
import subscribe from "./routes/subscribe.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "https://justclickary.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use("/api/users", userRouter);
app.use("/api/admin", adminRoutes);
app.use("/", subscribe)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
