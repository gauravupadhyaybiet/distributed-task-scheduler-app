const Redis = require("ioredis");

(async () => {
  const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    db: 0
  });

  await redis.zadd("JOB_QUEUE", Date.now(), "proof-job");

  const data = await redis.zrange("JOB_QUEUE", 0, -1);
  console.log("REDIS DATA:", data);

  process.exit(0);
})();
