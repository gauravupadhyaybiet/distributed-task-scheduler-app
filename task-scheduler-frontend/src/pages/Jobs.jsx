import React, { useEffect, useState } from "react";
import api from "../api/api";

/* Job type → form fields mapping */
const JOB_FIELDS = {
  EMAIL: [
    { key: "to", label: "To Email" },
    { key: "subject", label: "Subject" },
    { key: "message", label: "Message" }
  ],
  PAYMENT: [
    { key: "amount", label: "Amount" },
    { key: "currency", label: "Currency" },
    { key: "customerId", label: "Customer ID" }
  ],
  WEBHOOK: [
    { key: "url", label: "Webhook URL" },
    { key: "method", label: "HTTP Method" }
  ],
  FILE: [{ key: "path", label: "File Path" }],
  VIDEO: [{ key: "videoId", label: "Video ID" }],
  CLEANUP: [{ key: "olderThanDays", label: "Older Than Days" }],
  CRON: [{ key: "cronJobId", label: "Cron Job ID" }]
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [type, setType] = useState("EMAIL");
  const [formPayload, setFormPayload] = useState({});
  const [loading, setLoading] = useState(false);

  /* ===================== LOAD JOBS ===================== */

  const loadJobs = async () => {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data);
    } catch {
      alert("Failed to load jobs");
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  /* ===================== CREATE JOB ===================== */

  const createJob = async () => {
    try {
      setLoading(true);
      await api.post("/jobs", {
        type,
        payload: formPayload
      });

      setFormPayload({});
      loadJobs();
    } catch {
      alert("Job creation failed");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== DELETE JOB ===================== */

  const deleteJob = async id => {
    if (!window.confirm("Delete this job?")) return;

    try {
      await api.delete(`/jobs/${id}`);
      loadJobs();
    } catch {
      alert("Failed to delete job");
    }
  };

  /* ===================== HELPERS ===================== */

  const statusColor = status => {
    if (status === "SUCCESS") return "#22c55e";
    if (status === "FAILED") return "#ef4444";
    if (status === "RUNNING") return "#3b82f6";
    if (status === "RETRYING") return "#facc15";
    if (status === "CANCELLED") return "#94a3b8";
    return "#a855f7"; // PENDING
  };

  /* ===================== UI ===================== */

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>⚡ Distributed Job Scheduler</h1>

      {/* ===================== CREATE JOB ===================== */}
      <div style={styles.card}>
        <h2>Create Job</h2>

        <select
          value={type}
          onChange={e => {
            setType(e.target.value);
            setFormPayload({});
          }}
          style={styles.select}
        >
          {Object.keys(JOB_FIELDS).map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {JOB_FIELDS[type].map(field => (
          <input
            key={field.key}
            placeholder={field.label}
            value={formPayload[field.key] || ""}
            onChange={e =>
              setFormPayload(prev => ({
                ...prev,
                [field.key]: e.target.value
              }))
            }
            style={styles.input}
          />
        ))}

        <button
          onClick={createJob}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Creating..." : "🚀 Create Job"}
        </button>
      </div>

      {/* ===================== JOB LIST ===================== */}
      <h2 style={{ marginTop: 40 }}>🧠 Jobs</h2>

      <div style={styles.grid}>
        {jobs.length === 0 && <p>No jobs found</p>}

        {jobs.map(job => (
          <div key={job._id} style={styles.jobCard}>
            <div style={styles.jobHeader}>
              <span style={styles.jobType}>{job.type}</span>
              <span
                style={{
                  ...styles.status,
                  background: statusColor(job.status)
                }}
              >
                {job.status}
              </span>
            </div>

            <p><b>ID:</b> {job.jobId}</p>
            <p><b>Retries:</b> {job.retries}/{job.maxRetries}</p>

            {job.lastError && (
              <p style={styles.error}>⚠ {job.lastError}</p>
            )}

            {/* ONLY DELETE BUTTON */}
            <div style={styles.actions}>
              <button
                onClick={() => deleteJob(job._id)}
                style={{ ...styles.actionBtn, background: "#ef4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const styles = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background: "linear-gradient(135deg, #0f172a, #020617)",
    color: "#e5e7eb",
    fontFamily: "Inter, sans-serif"
  },
  title: {
    textAlign: "center",
    fontSize: 32,
    marginBottom: 40
  },
  card: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 25,
    borderRadius: 16,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    background: "#020617",
    color: "#fff",
    border: "1px solid #334155"
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    background: "#020617",
    color: "#fff",
    border: "1px solid #334155"
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg, #6366f1, #22d3ee)",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer"
  },
  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20
  },
  jobCard: {
    padding: 20,
    borderRadius: 14,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  },
  jobType: {
    fontWeight: "bold",
    letterSpacing: 1
  },
  status: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    color: "#000",
    fontWeight: "bold"
  },
  error: {
    marginTop: 10,
    color: "#f87171",
    fontSize: 13
  },
  actions: {
    marginTop: 15,
    display: "flex"
  },
  actionBtn: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    border: "none",
    fontWeight: "bold",
    cursor: "pointer"
  }
};


