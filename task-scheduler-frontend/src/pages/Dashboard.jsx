import React, { useEffect, useState } from "react";
import api from "../api/api";
import { theme } from "../styles/theme";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    running: 0,
    success: 0,
    failed: 0
  });

  /* ================= LOAD JOB STATS ================= */

  const loadStats = async () => {
    try {
      const res = await api.get("/jobs");
      const jobs = res.data;

      setStats({
        total: jobs.length,
        pending: jobs.filter(j => j.status === "PENDING").length,
        running: jobs.filter(j => j.status === "RUNNING").length,
        success: jobs.filter(j => j.status === "SUCCESS").length,
        failed: jobs.filter(j => j.status === "FAILED").length
      });
    } catch (e) {
      console.error("Failed to load stats");
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 3000);
    return () => clearInterval(interval);
  }, []);

  /* ================= WORKER ACTION ================= */

  const startWorker = async () => {
    try {
      await api.post("/worker/start");
      alert("✅ Worker started");
    } catch (e) {
      alert("❌ Failed to start worker");
    }
  };

  /* ================= HEALTH ================= */

  const health =
    stats.failed > 0
      ? { text: "DEGRADED", color: "#ef4444" }
      : stats.running > 5
      ? { text: "HIGH LOAD", color: "#facc15" }
      : { text: "HEALTHY", color: "#22c55e" };

  return (
    <div style={theme.page}>
      {/* ===== HERO / HEADER ===== */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.title}>Distributed Scheduler Control Center</h1>
          <p style={styles.subtitle}>
            Real-time orchestration, retries, cron execution & fault tolerance
          </p>
        </div>

        <div style={{ ...styles.healthBadge, color: health.color }}>
          ● {health.text}
        </div>
      </div>

      {/* ===== WORKER CONTROL ===== */}
      <div style={{ marginBottom: 40 }}>
        <button
          onClick={startWorker}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            background: "#22c55e",
            color: "#000"
          }}
        >
          ▶ Start Worker
        </button>
      </div>

      {/* ===== KPI STRIP ===== */}
      <div style={styles.kpiStrip}>
        <KPI label="Total Jobs" value={stats.total} />
        <KPI label="Pending" value={stats.pending} />
        <KPI label="Running" value={stats.running} />
        <KPI label="Success" value={stats.success} />
        <KPI label="Failed" value={stats.failed} />
      </div>

      {/* ===== MAIN METRICS ===== */}
      <div style={styles.grid}>
        <Metric
          title="Job Throughput"
          value={`${stats.success}/min`}
          hint="Completed jobs per minute"
          color="#22c55e"
        />
        <Metric
          title="Retry Pressure"
          value={stats.failed}
          hint="Jobs currently failing"
          color="#ef4444"
        />
        <Metric
          title="Active Workers"
          value={Math.max(stats.running, 1)}
          hint="Estimated active executors"
          color="#3b82f6"
        />
        <Metric
          title="Queue Depth"
          value={stats.pending}
          hint="Waiting to be executed"
          color="#facc15"
        />
      </div>

      {/* ===== SYSTEM INSIGHT ===== */}
      <div style={{ ...theme.card, marginTop: 50 }}>
        <h3 style={{ marginBottom: 10 }}>🧠 System Insight</h3>
        <p style={{ opacity: 0.8 }}>
          {stats.failed > 0
            ? "Failures detected. Dead-letter queue is accumulating jobs. Immediate investigation recommended."
            : stats.pending > 10
            ? "Queue depth increasing. Consider scaling workers horizontally."
            : "System stable. Jobs are flowing normally across workers."}
        </p>
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function KPI({ label, value }) {
  return (
    <div style={styles.kpi}>
      <span style={styles.kpiLabel}>{label}</span>
      <span style={styles.kpiValue}>{value}</span>
    </div>
  );
}

function Metric({ title, value, hint, color }) {
  return (
    <div style={{ ...styles.metricCard, borderLeft: `4px solid ${color}` }}>
      <h4 style={{ opacity: 0.8 }}>{title}</h4>
      <h1 style={{ color }}>{value}</h1>
      <p style={styles.hint}>{hint}</p>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40
  },

  title: {
    fontSize: 36,
    fontWeight: "bold"
  },

  subtitle: {
    opacity: 0.7,
    marginTop: 6
  },

  healthBadge: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid currentColor",
    fontWeight: "bold",
    fontSize: 14
  },

  kpiStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 20,
    marginBottom: 50
  },

  kpi: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 16,
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
  },

  kpiLabel: {
    fontSize: 12,
    opacity: 0.7,
    letterSpacing: 1
  },

  kpiValue: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 6
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 30
  },

  metricCard: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 15px 40px rgba(0,0,0,0.5)"
  },

  hint: {
    marginTop: 10,
    fontSize: 13,
    opacity: 0.7
  }
};


