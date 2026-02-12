require("dotenv").config();
const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail(payload) {
  const { to, subject, message } = payload;

  if (!to || !message) {
    throw new Error("Invalid email payload");
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: subject || "Job Notification",
    text: message
  });
}

module.exports = { sendEmail };
