require("dotenv").config();
require("./config/mongo");

const express = require("express");
const cors = require("cors");
const os = require("os");

/* ===== ROUTES ===== */
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobRoutes");
const cronJobsRoutes = require("./routes/cronRoutes");

/* ===== MIDDLEWARE ===== */
const auth = require("./middleware/auth");

/* ===== SERVICES ===== */
const {
  startWorker,
  stopWorker,
  workerStatus
} = require("./services/workerService");

const {
  startCronRunner,
  stopCronRunner,
  cronStatus
} = require("./services/cronService");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

app.use((req, res, next) => {
  console.log(`[PID ${process.pid}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ================= AUTH ================= */

app.use("/auth", authRoutes);

/* ================= BUSINESS ROUTES ================= */

app.use("/jobs", auth, jobRoutes);
app.use("/cron-jobs", auth, cronJobsRoutes);

/* ================= CONTROL ROUTES ================= */

app.post("/worker/start", auth, (req, res) => {
  startWorker();
  res.json({ running: true });
});

app.post("/worker/stop", auth, (req, res) => {
  stopWorker();
  res.json({ running: false });
});

app.get("/worker/status", auth, (req, res) => {
  res.json({ running: workerStatus() });
});

app.post("/cron/start", auth, (req, res) => {
  startCronRunner();
  res.json({ running: true });
});

app.post("/cron/stop", auth, (req, res) => {
  stopCronRunner();
  res.json({ running: false });
});

app.get("/cron/status", auth, (req, res) => {
  res.json({ running: cronStatus() });
});

/* ================= HEALTH ================= */

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    pid: process.pid,
    uptime: process.uptime(),
    host: os.hostname()
  });
});

/* ================= START SERVER ================= */

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


