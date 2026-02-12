const Job = require("../models/jobmodel");
const { addJob } = require("../queue/jobQueue");



exports.createJob = async (req, res) => {
  try {
    const { type, payload } = req.body;

    if (!type || !payload) {
      return res.status(400).json({ error: "type and payload required" });
    }

    const jobId = `job:${Date.now()}`;

    const job = await Job.create({
      jobId,
      type,
      payload,
      idempotencyKey: jobId,
      scheduledAt: new Date()
    });

    console.log("✅ Job saved in Mongo:", job.jobId);

    // Ensure we await addJob
    const result = await addJob(jobId);
    console.log("✅ Job queued in Redis:", jobId, "result:", result);

    return res.status(201).json({ jobId });
  } catch (err) {
    console.error("❌ createJob error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// GET ALL JOBS (Express handler)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
 
/**
 * UPDATE JOB
 * PATCH /jobs/:id
 */
exports.updateJob = async (req, res) => {
  try {
    const { status, payload, retries } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // allow safe updates only
    if (status !== undefined) job.status = status;
    if (payload !== undefined) job.payload = payload;
    if (retries !== undefined) job.retries = retries;

    await job.save();
    return res.json(job);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE JOB
 * DELETE /jobs/:id
 */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({ message: "Job deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
