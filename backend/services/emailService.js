require("dotenv").config();
const nodemailer = require("nodemailer");

/* ===================== TRANSPORT ===================== */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },

  // 🔥 CRITICAL FOR RENDER / CLOUD
  connectionTimeout: 10000, // 10s
  greetingTimeout: 10000,
  socketTimeout: 10000
});

/* ===================== SEND EMAIL ===================== */

async function sendEmail(payload) {
  const { to, subject, message } = payload;

  if (!to || !message) {
    throw new Error("Invalid email payload");
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: subject || "Job Notification",
      text: message
    });

    console.log(`📧 Email sent successfully → ${to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);

    // IMPORTANT: rethrow so worker can retry
    throw err;
  }
}

module.exports = { sendEmail };


