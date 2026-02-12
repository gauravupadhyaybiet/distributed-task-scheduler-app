const { sendEmail } = require("../services/emailService");
const { processPayment } = require("../services/paymentService");

async function executeJob(job) {
  switch (job.type) {

    case "EMAIL":
      await sendEmail(job.payload);
      break;

    case "PAYMENT":
      await processPayment(job.payload);
      break;

    case "WEBHOOK":
    case "VIDEO":
    case "FILE":
    case "CLEANUP":
      // 🔁 existing logic stays unchanged
      console.log("Executing job:", job.type);
      break;

    default:
      throw new Error("Unsupported job type: " + job.type);
  }
}

module.exports = { executeJob };
