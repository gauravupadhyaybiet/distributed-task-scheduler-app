import React, { useEffect, useState } from "react";
import api from "../api/api";
import { theme } from "../styles/theme";

/* ===== Cron Job Type → Payload Fields ===== */
const CRON_FIELDS = {
  EMAIL: [
    { key: "to", label: "To Email" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message" }
  ],
  PAYMENT: [
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    { key: "customerId", label: "Customer ID" },
    { key: "description", label: "Description" }
  ],
  REPORT: [
    { key: "reportType", label: "Report Type" },
    { key: "format", label: "Format" }
  ],
  CLEANUP: [{ key: "olderThanDays", label: "Older Than (days)" }],
  WEBHOOK: [
    { key: "url", label: "Webhook URL" },
    { key: "method", label: "HTTP Method" }
  ]
};

export default function CronJobs() {
  const [cronJobs, setCronJobs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  const [type, setType] = useState("");
  const [formPayload, setFormPayload] = useState({});
  const [creating, setCreating] = useState(false);

  /* ===== CRON RUNNER STATE ===== */
  const [cronRunning, setCronRunning] = useState(false);
  const [cronLoading, setCronLoading] = useState(false);

  /* ================= LOAD ================= */

  const load = async () => {
    const res = await api.get("/cron-jobs");
    setCronJobs(res.data);
  };

  const loadCronStatus = async () => {
    const res = await api.get("/cron/status");
    setCronRunning(res.data.running);
  };

  useEffect(() => {
    load();
    loadCronStatus();

    const i = setInterval(() => {
      load();
      loadCronStatus();
    }, 5000);

    return () => clearInterval(i);
  }, []);

  /* ================= CRON CONTROLS ================= */

  const startCronRunner = async () => {
    try {
      setCronLoading(true);
      await api.post("/cron/start");
      setCronRunning(true);
    } catch {
      alert("Failed to start cron runner");
    } finally {
      setCronLoading(false);
    }
  };

  const stopCronRunner = async () => {
    try {
      setCronLoading(true);
      await api.post("/cron/stop");
      setCronRunning(false);
    } catch {
      alert("Cron runner already stopped");
    } finally {
      setCronLoading(false);
    }
  };

  /* ================= CRUD ================= */

  const resetForm = () => {
    setEditingJob(null);
    setName("");
    setSchedule("");
    setType("");
    setFormPayload({});
  };

  const createCronJob = async e => {
    e.preventDefault();
    setCreating(true);
    await api.post("/cron-jobs", {
      name,
      schedule,
      type,
      payload: formPayload
    });
    resetForm();
    load();
    setCreating(false);
  };

  const toggle = async (id, active) => {
    setLoadingId(id);
    await api.patch(`/cron-jobs/${id}`, { active });
    load();
    setLoadingId(null);
  };

  /* ================= UI ================= */

  return (
    <div style={theme.page}>
      <h2>⏰ Cron Jobs</h2>

      {/* ===== CRON RUNNER ===== */}
      <div style={{ ...theme.card, marginBottom: 30 }}>
        <h3>⏱ Cron Runner</h3>
        <p>
          Status:{" "}
          <b style={{ color: cronRunning ? "#22c55e" : "#facc15" }}>
            {cronRunning ? "RUNNING" : "STOPPED"}
          </b>
        </p>

        <button
          onClick={startCronRunner}
          disabled={cronRunning || cronLoading}
          style={{ marginRight: 10 }}
        >
          ▶ Start Cron
        </button>

        <button
          onClick={stopCronRunner}
          disabled={!cronRunning || cronLoading}
        >
          ⏹ Stop Cron
        </button>
      </div>

      {/* ===== CREATE ===== */}
      <div style={theme.card}>
        <h3>Create Cron Job</h3>

        <form onSubmit={createCronJob}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            style={theme.input}
          />

          <input
            value={schedule}
            onChange={e => setSchedule(e.target.value)}
            placeholder="*/1 * * * *"
            required
            style={theme.input}
          />

          <select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setFormPayload({});
            }}
            required
            style={theme.input}
          >
            <option value="">Select Type</option>
            {Object.keys(CRON_FIELDS).map(t => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {CRON_FIELDS[type]?.map(f => (
            <input
              key={f.key}
              placeholder={f.label}
              value={formPayload[f.key] || ""}
              onChange={e =>
                setFormPayload(p => ({ ...p, [f.key]: e.target.value }))
              }
              style={theme.input}
            />
          ))}

          <button type="submit" disabled={creating}>
            Create
          </button>
        </form>
      </div>

      {/* ===== LIST ===== */}
      <table style={theme.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Schedule</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cronJobs.map(j => (
            <tr key={j._id}>
              <td>{j.name}</td>
              <td>{j.schedule}</td>
              <td>{j.active ? "ACTIVE" : "PAUSED"}</td>
              <td>
                <button onClick={() => toggle(j._id, !j.active)}>
                  {j.active ? "Pause" : "Resume"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

