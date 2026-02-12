const express = require("express");
const router = express.Router();
const DeadJob = require("../models/DeadJob");

/**
 * GET ALL DEAD JOBS
 * GET /dead-jobs
 */
router.get("/", async (req, res) => {
  try {
    const deadJobs = await DeadJob.find().sort({ failedAt: -1 });
    res.json(deadJobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET DEAD JOB BY JOB ID
 * GET /dead-jobs/:jobId
 */
router.get("/:jobId", async (req, res) => {
  try {
    const job = await DeadJob.findOne({ jobId: req.params.jobId });
    if (!job) {
      return res.status(404).json({ error: "Dead job not found" });
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
