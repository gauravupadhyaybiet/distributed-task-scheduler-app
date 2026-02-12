
const { MAX_RETRIES } = require("../constants");
const { addJob, removeJob } = require("../queue/jobQueue");
const DeadJob = require("../models/DeadJob");

const MAX_DELAY = 60 * 1000; // 1 minute cap

exports.retry = async job => {
  job.retries += 1;

  /* ===================== DLQ ===================== */

  if (job.retries > MAX_RETRIES) {
    console.log("💀 Job moved to Dead Letter Queue:", job.jobId);

    await DeadJob.create({
      jobId: job.jobId,
      type: job.type,
      payload: job.payload,
      retries: job.retries,
      lastError: job.lastError
    });

    job.status = "FAILED";
    await job.save();

    // Remove permanently from Redis
    await removeJob(job.jobId);
    return;
  }

  /* ===================== BACKOFF ===================== */

  const baseDelay = Math.pow(2, job.retries) * 1000; // 2^n seconds
  const jitter = Math.floor(Math.random() * 2000); // 0–2s
  const delayMs = Math.min(baseDelay + jitter, MAX_DELAY);

  console.log(
    `🔁 Retrying job ${job.jobId} | attempt=${job.retries} | delay=${delayMs}ms`
  );

  await job.save();

  // Requeue with delay
  await addJob(job.jobId, delayMs);
};



