import express from "express";
import meetingsRoutes from "./routes/meetingsRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(rateLimiter);

app.use("/api/meetings", meetingsRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("server started ot PORT:", PORT);
  });
});
