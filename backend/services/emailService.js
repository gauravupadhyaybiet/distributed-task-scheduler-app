const axios = require("axios");

/**
 * Send email using Brevo HTTP API (Render-safe)
 */
async function sendEmail(payload) {
  const { to, subject, message } = payload;

  if (!to || !message) {
    throw new Error("Invalid email payload");
  }

  try {
    console.log(`📨 Sending email via Brevo API → ${to}`);

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Scheduler App",
          email: process.env.EMAIL_FROM
        },
        to: [{ email: to }],
        subject: subject || "Job Notification",
        textContent: message
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log(`📧 Email sent successfully → ${to}`);
  } catch (err) {
    console.error(
      "❌ Brevo Email API failed:",
      err.response?.data || err.message
    );
    throw err; // let retry/DLQ handle it
  }
}

module.exports = { sendEmail };


