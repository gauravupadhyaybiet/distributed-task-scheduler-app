import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false); // 🔥 trigger re-render
    navigate("/login");
  };

  return (
    <div
      style={{
        background: "#020617",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      {/* Navigation */}
      <div style={{ display: "flex", gap: 16 }}>
        <Link style={styles.link} to="/">Dashboard</Link>
        <Link style={styles.link} to="/jobs">Jobs</Link>
        <Link style={styles.link} to="/cron">Cron Jobs</Link>
        <Link style={styles.link} to="/dead">Dead Jobs</Link>
      </div>

      {/* Logout */}
      <button onClick={logout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
}

const styles = {
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontWeight: 500
  },
  logout: {
    padding: "6px 14px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer"
  }
};

