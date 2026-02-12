const express = require("express");
const router = express.Router();
const CronJob = require("../models/CronJob");
const { stopCron } = require("../services/cronService");
router.post("/", async (req, res) => {
  try {
    const { name, schedule, type, payload } = req.body;

    if (!schedule || !type) {
      return res.status(400).json({
        error: "schedule and type are required"
      });
    }

    const cronJob = await CronJob.create({
      name,
      schedule,
      type,
      payload
    });

    return res.status(201).json(cronJob);
  } catch (err) {
    console.error("❌ Create cron error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET ALL CRON JOBS
 * GET /cron-jobs
 */
router.get("/", async (req, res) => {
  try {
    const cronJobs = await CronJob.find().sort({ createdAt: -1 });
    return res.json(cronJobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  try {
    const { active } = req.body;

    const cronJob = await CronJob.findByIdAndUpdate(
      req.params.id,
      { active },
      { new: true }
    );

    if (!cronJob) {
      return res.status(404).json({ error: "Cron job not found" });
    }

    if (active) {
      startCron(cronJob);
    } else {
      stopCron(cronJob._id.toString());
    }

    return res.json(cronJob);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


router.patch("/:id/edit", async (req, res) => {
  try {
    const { name, schedule, type, payload } = req.body;

    const cronJob = await CronJob.findById(req.params.id);
    if (!cronJob) {
      return res.status(404).json({ error: "Cron job not found" });
    }

    if (name !== undefined) cronJob.name = name;
    if (schedule !== undefined) cronJob.schedule = schedule;
    if (type !== undefined) cronJob.type = type;
    if (payload !== undefined) cronJob.payload = payload;

    await cronJob.save();

    res.json(cronJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE CRON JOB
 * DELETE /cron-jobs/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    stopCron(req.params.id);
    await CronJob.findByIdAndDelete(req.params.id);
    res.json({ message: "Cron job deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



