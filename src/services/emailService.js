import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  // Check if email configuration is provided
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.warn(
      "Email configuration not found. Email sending will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send confirmation email to client
const sendConfirmationEmail = async (meetingData) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("Email service not configured. Skipping email send.");
    return { success: false, message: "Email service not configured" };
  }

  try {
    const {
      client,
      email,
      content,
      selectedDate,
      selectedTime,
      clientsTimeZone,
    } = meetingData;

    // Format the date and time for display
    const meetingDate = new Date(
      `${selectedDate}T${selectedTime}`
    ).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const meetingTime = new Date(
      `2000-01-01T${selectedTime}`
    ).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation - Avoex",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Avoex</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-top: 0;">Hello, ${client}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for your booking! Your consultation has been successfully scheduled.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin-top: 0;">Booking Details:</h3>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${meetingDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${meetingTime}</p>
              <p style="margin: 8px 0;"><strong>Topic:</strong> ${content}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions or need to change your booking, please contact us.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px;">
                This email was sent automatically from the Avoex booking system.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully to:", email);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, message: error.message };
  }
};

export { sendConfirmationEmail };
