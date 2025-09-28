import express from "express";
import {
  createMeeting,
  deleteMeeting,
  updateMeeting,
  getAllMeetings,
  getMeetingById,
} from "../controllers/meetingsController.js";

const router = express.Router();

router.get("/", getAllMeetings);

router.get("/:id", getMeetingById);

router.post("/", createMeeting);

router.put("/:id", updateMeeting);

router.delete("/:id", deleteMeeting);

export default router;
