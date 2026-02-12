const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected to job_scheduler"))
  .catch(err => console.error("❌ Mongo error:", err));

module.exports = mongoose;

