require("../config/mongo");

const redis = require("../config/redis");
const Job = require("../models/jobmodel");
const { fetchDueJobs, removeJob } = require("../queue/jobQueue");
const {
  markProcessing,
  recoverExpiredJobs,
  removeProcessing
} = require("../queue/processingQueue");
const { acquireLock, releaseLock } = require("./lockService");
const { isDone, markDone } = require("./idempotencyService");
const { retry } = require("./retryService");
const { processJob } = require("../handlers/jobHandler");

const WORKER_ID = `worker-${Date.now()}`;
const MAX_IDLE_CYCLES = 10;

let running = false;
let idleCycles = 0;

/* ===================== WORKER LOOP ===================== */

async function workerLoop() {
  console.log(`👷 Worker loop started | ID=${WORKER_ID}`);

  while (running) {
    console.log("🔍 Checking expired processing jobs…");

    const expired = await recoverExpiredJobs();
    if (expired.length > 0) {
      console.log("♻️ Recovered expired jobs:", expired);
    }

    for (const id of expired) {
      await removeProcessing(id);
    }

    console.log("📥 Fetching due jobs from queue…");
    const jobs = await fetchDueJobs();

    /* ===================== NO JOBS ===================== */

    if (jobs.length === 0) {
      idleCycles++;
      console.log(
        `⏳ No jobs found | idle cycle ${idleCycles}/${MAX_IDLE_CYCLES}`
      );

      if (idleCycles >= MAX_IDLE_CYCLES) {
        console.log(
          "🛑 Idle limit reached → Worker auto-stopping to save resources"
        );
        running = false;
        break;
      }

      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    idleCycles = 0;
    console.log(`📦 ${jobs.length} job(s) fetched from queue`);

    /* ===================== PROCESS JOBS ===================== */

    for (const jobId of jobs) {
      console.log(`➡️ Picked job from queue | jobId=${jobId}`);

      const job = await Job.findOne({ jobId });
      if (!job) {
        console.log(`⚠️ Job not found in DB | jobId=${jobId}`);
        continue;
      }

      const locked = await acquireLock(jobId, WORKER_ID);
      if (!locked) {
        console.log(`🔒 Job already locked by another worker | jobId=${jobId}`);
        continue;
      }

      console.log(`🔐 Lock acquired | jobId=${jobId}`);
      await markProcessing(jobId);

      try {
        if (await isDone(job.idempotencyKey)) {
          console.log(`✅ Job already processed (idempotent) | jobId=${jobId}`);
          await removeJob(jobId);
          await removeProcessing(jobId);
          continue;
        }

        console.log("⚙️ Processing job");
        console.log("   • Job ID   :", jobId);
        console.log("   • Type     :", job.type);
        console.log("   • Payload  :", job.payload);

        job.status = "RUNNING";
        job.startedAt = new Date();
        await job.save();

        await processJob(job);

        await markDone(job.idempotencyKey);

        job.status = "SUCCESS";
        job.finishedAt = new Date();
        await job.save();

        console.log(`🎉 Job completed successfully | jobId=${jobId}`);

        await removeJob(jobId);
        await removeProcessing(jobId);
      } catch (e) {
        console.log(`❌ Job failed | jobId=${jobId}`);
        console.log("   • Error:", e.message);

        job.status = "RETRYING";
        job.lastError = e.message;
        await job.save();

        await retry(job);
      } finally {
        await releaseLock(jobId);
        console.log(`🔓 Lock released | jobId=${jobId}`);
      }
    }
  }

  console.log(`🛑 Worker loop exited | ID=${WORKER_ID}`);
}

/* ===================== CONTROL ===================== */

function startWorker() {
  if (running) {
    console.log("⚠️ Worker already running");
    return;
  }

  running = true;
  idleCycles = 0;
  console.log("🚀 Worker started");
  workerLoop();
}

function stopWorker() {
  if (!running) {
    console.log("⚠️ Worker already stopped");
    return;
  }

  running = false;
  console.log("⏹ Worker stopped manually");
}

function workerStatus() {
  return running;
}

module.exports = {
  startWorker,
  stopWorker,
  workerStatus
};
