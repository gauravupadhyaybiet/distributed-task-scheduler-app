const express = require("express");
const router = express.Router();
const { createJob, getAllJobs , updateJob,deleteJob} = require("../services/jobService");

// create job
router.post("/", createJob);

// get all jobs
router.get("/", getAllJobs);

router.patch("/:id", updateJob);

// delete job
router.delete("/:id", deleteJob);


module.exports = router;
