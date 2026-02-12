const { MAX_RETRIES } = require("../constants");
const { addJob, removeJob } = require("../queue/jobQueue");
const DeadJob = require("../models/DeadJob");

const MAX_DELAY = 60000; // 1 minute

exports.retry = async job => {
  job.retries += 1;

  // 💀 Dead Letter Queue
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

    await removeJob(job.jobId);
    return;
  }

  const jitter = Math.floor(Math.random() * 2000);
  const delayMs = Math.min(
    Math.pow(2, job.retries) * 1000 + jitter,
    MAX_DELAY
  );

  console.log(`🔁 Retrying job ${job.jobId} in ${delayMs}ms`);

  await job.save();
  await addJob(job.jobId, delayMs);
};


