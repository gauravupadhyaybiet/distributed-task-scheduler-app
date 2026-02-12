const mongoose = require("mongoose");

const CronJobSchema = new mongoose.Schema({
  name: String,

  schedule: {
    type: String, // cron expression
    required: true
  },

  type: String,
  payload: Object,

  active: {
    type: Boolean,
    default: true
  },

  lastRunAt: Date,
  nextRunAt: Date
});

module.exports = mongoose.model("CronJob", CronJobSchema);
