const { MAX_RETRIES } = require("../constants");
const { addJob, removeJob } = require("../queue/jobQueue");
const DeadJob = require("../models/DeadJob");

exports.retry = async job => {
  job.retries += 1;

  // 💀 Move to Dead Letter Queue
  if (job.retries > MAX_RETRIES) {
    console.log("💀 Job moved to DLQ:", job.jobId);

    await DeadJob.create({
      jobId: job.jobId,
      type: job.type,
      payload: job.payload,
      retries: job.retries,
      lastError: job.lastError
    });

    job.status = "FAILED";
    await job.save();

    // Remove from Redis queue
    await removeJob(job.jobId);
    return;
  }

  // 🔁 Retry with exponential backoff
  const delayMs = Math.pow(2, job.retries) * 1000;

  console.log(`🔁 Retrying job ${job.jobId} in ${delayMs}ms`);

  await job.save();
  await addJob(job.jobId, delayMs);
};

