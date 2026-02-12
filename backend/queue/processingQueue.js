
const redis = require("../config/redis");
const { PROCESSING_KEY, VISIBILITY_TIMEOUT } = require("../constants");

async function markProcessing(jobId) {
  await redis.zadd(PROCESSING_KEY, Date.now() + VISIBILITY_TIMEOUT, jobId);
}

async function recoverExpiredJobs() {
  return redis.zrangebyscore(PROCESSING_KEY, 0, Date.now());
}

async function removeProcessing(jobId) {
  await redis.zrem(PROCESSING_KEY, jobId);
}

module.exports = { markProcessing, recoverExpiredJobs, removeProcessing };
