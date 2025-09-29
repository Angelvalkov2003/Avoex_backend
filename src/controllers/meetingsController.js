import Meeting from "../models/Meeting.js";

export async function getAllMeetings(_, res) {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getBookedSlotsByDate(req, res) {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Find all meetings for the specified date
    const meetings = await Meeting.find({ BGdate: date }).select("BGtime");

    // Extract only the time slots
    const bookedSlots = meetings.map((meeting) => meeting.BGtime);

    res.status(200).json({
      date: date,
      bookedSlots: bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.status(500).json({ message: "Failed to fetch booked slots" });
  }
}

export async function getMeetingById(req, res) {
  try {
    const meeting = await Meeting.findById(req.params.id);
    res.status(200).json(meeting);
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
}

export async function createMeeting(req, res) {
  try {
    const {
      client,
      content,
      email,
      ClientsDate,
      ClientsTimeZone,
      BGdate,
      BGtime,
    } = req.body;

    // Check if a reservation already exists for this date and time
    const existingReservation = await Meeting.findOne({ BGdate, BGtime });
    if (existingReservation) {
      return res.status(409).json({
        message:
          "This time slot is already booked. Please choose a different time.",
        code: "DUPLICATE_TIME_SLOT",
      });
    }

    const newMeeting = new Meeting({
      client,
      content,
      email,
      ClientsDate,
      ClientsTimeZone,
      BGdate,
      BGtime,
    });
    const savedMeeting = await newMeeting.save();
    res.status(201).json(savedMeeting);
  } catch (error) {
    console.error("Error creating meeting:", error);

    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This time slot is already booked. Please choose a different time.",
        code: "DUPLICATE_TIME_SLOT",
      });
    }

    res
      .status(500)
      .json({ message: "Failed to create reservation. Please try again." });
  }
}

export async function updateMeeting(req, res) {
  try {
    const {
      client,
      content,
      email,
      ClientsDate,
      ClientsTimeZone,
      BGdate,
      BGtime,
    } = req.body;
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      {
        client,
        content,
        email,
        ClientsDate,
        ClientsTimeZone,
        BGdate,
        BGtime,
      },
      {
        new: true,
      }
    );

    res.status(200).json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}

export async function deleteMeeting(req, res) {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);

    res.status(200).json(deletedMeeting);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}
