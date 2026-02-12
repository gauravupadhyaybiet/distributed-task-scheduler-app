const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      "PAYMENT",
      "EMAIL",
      "VIDEO",
      "FILE",
      "CLEANUP",
      "WEBHOOK",
      "CRON"
    ],
    required: true
  },

  payload: {
    type: Object,
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "RUNNING", "RETRYING", "SUCCESS", "FAILED"],
    default: "PENDING"
  },

  retries: {
    type: Number,
    default: 0
  },

  maxRetries: {
    type: Number,
    default: 5
  },

  idempotencyKey: {
    type: String,
    index: true
  },

  lastError: {
    type: String
  },

  workerId: {
    type: String
  },

  scheduledAt: {
    type: Date,
    default: Date.now
  },

  startedAt: {
    type: Date
  },

  finishedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
