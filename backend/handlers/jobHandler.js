const { sendEmail } = require("../services/emailService");
const { processPayment } = require("../services/paymentService");

/**
 * This function executes ONLY NORMAL JOBS.
 * Cron jobs only CREATE normal jobs.
 */
exports.processJob = async job => {
  switch (job.type) {

    case "EMAIL":
      // 📧 REAL EMAIL INTEGRATION
      await sendEmail(job.payload);
      break;

    case "PAYMENT":
      // 💳 REAL PAYMENT INTEGRATION (Stripe test mode)
      await processPayment(job.payload);
      break;

    case "WEBHOOK":
      // existing / simple logic
      console.log("🌐 Webhook job executed");
      break;

    case "FILE":
    case "VIDEO":
    case "CLEANUP":
      // keep previous behavior
      console.log(`📦 ${job.type} job executed`);
      break;

    case "CRON":
      // ❌ cron jobs should never be executed by worker
      throw new Error("CRON jobs are not executable");

    default:
      throw new Error("Unsupported job type: " + job.type);
  }
};
