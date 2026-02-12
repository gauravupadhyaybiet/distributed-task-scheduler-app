const redis = require("../config/redis");
const { QUEUE_KEY } = require("../constants");

// Add job to sorted set
// Add job to sorted set
async function addJob(job, delayMs = 0) {
  const runAt = Date.now() + delayMs;

  // ✅ Always store string in Redis
  const value =
    typeof job === "string"
      ? job
      : JSON.stringify(job);

  const result = await redis.zadd(QUEUE_KEY, runAt, value);

  console.log(
    "📤 Job queued:",
    value,
    "at:",
    runAt,
    "result:",
    result,
    "key:",
    QUEUE_KEY
  );

  return result;
}

// Fetch jobs due up to now
async function fetchDueJobs() {
  const values = await redis.zrangebyscore(
    QUEUE_KEY,
    0,
    Date.now()
  );

  // ✅ Safely parse JSON if possible
  return values.map(v => {
    try {
      return JSON.parse(v);
    } catch {
      return v; // old string jobs
    }
  });
}

// Remove job from queue
async function removeJob(job) {
  const value =
    typeof job === "string"
      ? job
      : JSON.stringify(job);

  return redis.zrem(QUEUE_KEY, value);
}

module.exports = { addJob, fetchDueJobs, removeJob };





