import React, { useEffect, useState } from "react";
import api from "../api/api";
import { theme } from "../styles/theme";

export default function DeadJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api.get("/dead-jobs").then(res => setJobs(res.data));
  }, []);

  return (
    <div style={theme.page}>
      <h2>☠️ Dead Jobs</h2>

      <div style={theme.card}>
        <table style={theme.table}>
          <thead>
            <tr>
              <th style={theme.th}>Job ID</th>
              <th style={theme.th}>Error</th>
              <th style={theme.th}>Retries</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td style={theme.td} colSpan="3">
                  No dead jobs 🎉
                </td>
              </tr>
            )}

            {jobs.map(job => (
              <tr key={job._id}>
                <td style={theme.td}>{job.jobId}</td>
                <td style={{ ...theme.td, color: "#f87171" }}>
                  {job.lastError}
                </td>
                <td style={theme.td}>{job.retries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

