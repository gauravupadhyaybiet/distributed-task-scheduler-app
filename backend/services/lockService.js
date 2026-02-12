const redis = require("../config/redis");

async function acquireLock(jobId, workerId) {
  return redis.set(`lock:${jobId}`, workerId, "NX", "PX", 10000);
}

async function releaseLock(jobId) {
  await redis.del(`lock:${jobId}`);
}

module.exports = { acquireLock, releaseLock };
