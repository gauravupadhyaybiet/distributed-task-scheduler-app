const redis = require("../config/redis");

exports.isDone = key => redis.exists(`done:${key}`);
exports.markDone = key => redis.set(`done:${key}`, "1");
