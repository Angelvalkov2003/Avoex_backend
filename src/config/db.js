import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Mongodb connected");
  } catch (error) {
    console.error("Not connected mongo db", error);
    process.exit(1);
  }
};
