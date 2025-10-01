import Meeting from "../models/Meeting.js";
import { sendConfirmationEmail } from "../services/emailService.js";
import {
  convertClientTimeToBulgarian,
  convertFromBulgarianTime,
  isValidTimezone,
} from "../utils/timezoneUtils.js";

export async function getAllMeetings(_, res) {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

    res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
}

export async function getBookedSlotsByDate(req, res) {
  try {
    const { date } = req.params;
    const { timezone } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Validate timezone if provided
    if (timezone && !isValidTimezone(timezone)) {
      return res.status(400).json({ message: "Invalid timezone format" });
    }

    // If timezone is provided, we need to check for meetings that would be
    // in the client's timezone on the specified date
    let searchDate = date;
    let bookedSlots = [];

    if (timezone) {
      // Convert the client's date to Bulgarian date to find the correct day
      // We'll check a range of dates to cover potential timezone differences
      const clientDate = date;

      // Get the start and end of the day in the client's timezone
      const startOfDay = new Date(`${clientDate}T00:00:00`);
      const endOfDay = new Date(`${clientDate}T23:59:59`);

      // Convert these to Bulgarian timezone to find the corresponding dates
      const bgStart = convertClientTimeToBulgarian(
        clientDate,
        "00:00",
        timezone
      );
      const bgEnd = convertClientTimeToBulgarian(clientDate, "23:59", timezone);

      // Find meetings that fall within this date range in Bulgarian time
      const meetings = await Meeting.find({
        BGdate: { $gte: bgStart.bgDate, $lte: bgEnd.bgDate },
      }).select("BGdate BGtime");

      // Filter meetings that actually fall within the client's day
      const relevantMeetings = meetings.filter((meeting) => {
        const meetingDateTime = new Date(`${meeting.BGdate}T${meeting.BGtime}`);

        // Convert Bulgarian time back to client timezone to check if it's within the client's day
        const clientTime = convertFromBulgarianTime(
          meeting.BGdate,
          meeting.BGtime,
          timezone
        );
        const clientDateTime = new Date(
          `${clientTime.clientDate}T${clientTime.clientTime}`
        );

        return clientDateTime >= startOfDay && clientDateTime <= endOfDay;
      });

      // Convert the booked slots back to client's timezone
      bookedSlots = relevantMeetings.map((meeting) => {
        const clientTime = convertFromBulgarianTime(
          meeting.BGdate,
          meeting.BGtime,
          timezone
        );
        return clientTime.clientTime;
      });
    } else {
      // Original behavior - find meetings for the specified Bulgarian date
      const meetings = await Meeting.find({ BGdate: date }).select("BGtime");
      bookedSlots = meetings.map((meeting) => meeting.BGtime);
    }

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

    res.status(200).json({
      date: date,
      timezone: timezone || "Europe/Sofia",
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

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

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

    // Input validation and sanitization
    if (!client || !content || !email || !BGdate || !BGtime) {
      return res.status(400).json({
        message: "All fields are required",
        code: "MISSING_FIELDS",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(BGdate)) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
        code: "INVALID_DATE",
      });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(BGtime)) {
      return res.status(400).json({
        message: "Invalid time format. Use HH:MM",
        code: "INVALID_TIME",
      });
    }

    // Validate that the date/time is not in the past
    const now = new Date();
    const meetingDateTime = new Date(`${BGdate}T${BGtime}`);

    // Add 2 hours buffer to prevent booking too close to current time
    const bufferTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (meetingDateTime < bufferTime) {
      return res.status(400).json({
        message:
          "Cannot book consultations in the past or within 2 hours of current time",
        code: "PAST_DATETIME",
      });
    }

    // Sanitize input
    const sanitizedClient = client.trim().substring(0, 100);
    const sanitizedContent = content.trim().substring(0, 1000);
    const sanitizedEmail = email.trim().toLowerCase();

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
      client: sanitizedClient,
      content: sanitizedContent,
      email: sanitizedEmail,
      ClientsDate,
      ClientsTimeZone,
      BGdate,
      BGtime,
    });
    const savedMeeting = await newMeeting.save();

    // Send confirmation email to client
    try {
      const emailData = {
        client: sanitizedClient,
        email: sanitizedEmail,
        content: sanitizedContent,
        selectedDate: BGdate,
        selectedTime: BGtime,
        clientsTimeZone: ClientsTimeZone,
      };

      // Send confirmation email only
      sendConfirmationEmail(emailData).catch((error) => {
        console.error("Error sending email:", error);
        // Don't fail the request if email sending fails
      });
    } catch (emailError) {
      console.error("Error preparing email data:", emailError);
      // Don't fail the request if email preparation fails
    }

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

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

    // Input validation and sanitization
    if (!client || !content || !email || !BGdate || !BGtime) {
      return res.status(400).json({
        message: "All fields are required",
        code: "MISSING_FIELDS",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    }

    // Sanitize input
    const sanitizedClient = client.trim().substring(0, 100);
    const sanitizedContent = content.trim().substring(0, 1000);
    const sanitizedEmail = email.trim().toLowerCase();

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      {
        client: sanitizedClient,
        content: sanitizedContent,
        email: sanitizedEmail,
        ClientsDate,
        ClientsTimeZone,
        BGdate,
        BGtime,
      },
      {
        new: true,
      }
    );

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

    res.status(200).json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}

export async function deleteMeeting(req, res) {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);

    // Set security headers
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    });

    res.status(200).json(deletedMeeting);
  } catch (error) {
    res.status(500).json({ message: "failed!" });
  }
}
