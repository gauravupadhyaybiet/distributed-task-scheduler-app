import React from "react";

export default function JobTable({ jobs }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Job ID</th>
          <th>Type</th>
          <th>Status</th>
          <th>Retries</th>
        </tr>
      </thead>
      <tbody>
        {jobs.map(job => (
          <tr key={job._id}>
            <td>{job.jobId}</td>
            <td>{job.type}</td>
            <td>{job.status}</td>
            <td>{job.retries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
