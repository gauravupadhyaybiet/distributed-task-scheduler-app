require("../config/mongo");

const cron = require("node-cron");
const CronJob = require("../models/CronJob");
const Job = require("../models/jobmodel");
const { addJob } = require("../queue/jobQueue");

const scheduledTasks = new Map();
let running = false;

/* ===================== JOB CREATION ===================== */

async function createJobFromCron(cronJob) {
  const jobId = `job:${Date.now()}`;

  console.log("🔥 Cron triggered");
  console.log("   • Cron Name :", cronJob.name);
  console.log("   • Schedule  :", cronJob.schedule);
  console.log("   • Job Type  :", cronJob.type);

  await Job.create({
    jobId,
    type: cronJob.type,
    payload: cronJob.payload,
    idempotencyKey: jobId,
    scheduledAt: new Date()
  });

  await addJob(jobId);

  cronJob.lastRunAt = new Date();
  await cronJob.save();

  console.log(`📤 Job queued from cron | jobId=${jobId}`);
}

/* ===================== START CRON ===================== */

function startCron(cronJob) {
  const id = cronJob._id.toString();
  if (scheduledTasks.has(id)) {
    console.log(`⚠️ Cron already scheduled | id=${id}`);
    return;
  }

  console.log(
    `▶️ Scheduling cron | name="${cronJob.name}" | schedule="${cronJob.schedule}"`
  );

  const task = cron.schedule(
    cronJob.schedule,
    async () => {
      console.log(`⏳ Cron fired | name="${cronJob.name}"`);

      const fresh = await CronJob.findById(id);
      if (!fresh) {
        console.log(`⚠️ Cron not found in DB | id=${id}`);
        return;
      }

      if (!fresh.active) {
        console.log(`⏸ Cron is inactive, skipping | name="${fresh.name}"`);
        return;
      }

      await createJobFromCron(fresh);
    },
    { timezone: "Asia/Kolkata" }
  );

  scheduledTasks.set(id, task);
}

/* ===================== STOP CRON ===================== */

function stopCron(id) {
  const task = scheduledTasks.get(id);
  if (task) {
    task.stop();
    scheduledTasks.delete(id);
    console.log(`⏹ Cron stopped | id=${id}`);
  } else {
    console.log(`⚠️ Attempted to stop non-running cron | id=${id}`);
  }
}

/* ===================== RECONCILER ===================== */

async function reconcileCrons() {
  console.log("🔄 Reconciling cron jobs…");

  const cronJobs = await CronJob.find();
  const activeIds = new Set(
    cronJobs.filter(j => j.active).map(j => j._id.toString())
  );

  for (const job of cronJobs) {
    if (job.active && !scheduledTasks.has(job._id.toString())) {
      console.log(`➕ Found new active cron | name="${job.name}"`);
      startCron(job);
    }
  }

  for (const id of scheduledTasks.keys()) {
    if (!activeIds.has(id)) {
      console.log(`➖ Cron no longer active → stopping | id=${id}`);
      stopCron(id);
    }
  }
}

/* ===================== RUNNER CONTROL ===================== */

async function startCronRunner() {
  if (running) {
    console.log("⚠️ Cron runner already running");
    return;
  }

  running = true;
  console.log("⏰ Cron runner started");
  await reconcileCrons();

  setInterval(() => {
    if (!running) return;
    reconcileCrons();
  }, 5000);
}

function stopCronRunner() {
  if (!running) {
    console.log("⚠️ Cron runner already stopped");
    return;
  }

  running = false;

  for (const task of scheduledTasks.values()) {
    task.stop();
  }
  scheduledTasks.clear();

  console.log("⏹ Cron runner stopped");
}

function cronStatus() {
  return running;
}

module.exports = {
  startCronRunner,
  stopCronRunner,
  cronStatus,
  stopCron // exported for cron-jobs routes
};
