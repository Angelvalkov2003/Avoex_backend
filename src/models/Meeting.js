import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    client: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    ClientsDate: {
      type: String,
      required: true,
    },
    ClientsTimeZone: {
      type: String,
      required: true,
    },
    BGdate: {
      type: String,
      required: true,
    },
    BGtime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Add unique compound index for BGdate and BGtime to prevent duplicate reservations
meetingSchema.index({ BGdate: 1, BGtime: 1 }, { unique: true });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
