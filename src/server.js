import express from "express";
import notesRoutes from "./routes/notesRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

connectDB();

app.use(express.json()); //middleware - parse request.body
app.use(rateLimiter);

app.use("/api/notes", notesRoutes);

app.listen(PORT, () => {
  console.log("server started ot PORT:", PORT);
});

//mongodb+srv://valkovangel2003_db_user:Fb2t4GEU4hlCArZz@avoex-cluster.m1p5mq9.mongodb.net/?retryWrites=true&w=majority&appName=avoex-cluster
