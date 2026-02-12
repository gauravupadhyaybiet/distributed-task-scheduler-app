require("dotenv").config();
const nodemailer = require("nodemailer");

/* ===================== BREVO SMTP TRANSPORT ===================== */
/*
  Brevo SMTP is very stable on Render.
  user = "apikey"
  pass = your Brevo API key
*/

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER, // usually "apikey"
    pass: process.env.BREVO_SMTP_PASS  // Brevo API key
  },

  // 🔥 CRITICAL FOR CLOUD STABILITY
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
    console.log(`📨 Sending email → ${to}`);

    await transporter.sendMail({
      from: `"Scheduler App" <${process.env.EMAIL_FROM}>`,
      to,
      subject: subject || "Job Notification",
      text: message
    });

    console.log(`📧 Email sent successfully → ${to}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);

    // IMPORTANT: rethrow so worker retries or DLQ kicks in
    throw err;
  }
}

module.exports = { sendEmail };



