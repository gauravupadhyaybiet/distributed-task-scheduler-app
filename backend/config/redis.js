require("dotenv").config();
const Redis = require("ioredis");

let redis;

if (process.env.REDIS_URL) {
  // ✅ Render / Production / Upstash
  redis = new Redis(process.env.REDIS_URL);
} else {
  // ✅ Local development
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    db: 0
  });
}

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

module.exports = redis;





