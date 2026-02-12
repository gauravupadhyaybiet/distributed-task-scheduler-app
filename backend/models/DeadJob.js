const mongoose = require("mongoose");

const DeadJobSchema = new mongoose.Schema({
  jobId: String,
  type: String,
  payload: Object,
  retries: Number,
  lastError: String,
  failedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("DeadJob", DeadJobSchema);
