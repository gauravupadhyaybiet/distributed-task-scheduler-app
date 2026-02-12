import React, { useState } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    if (!email || !password) {
      return alert("Email and password required");
    }

    try {
      await api.post("/auth/register", { email, password });
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📝 Create Account</h2>
        <p style={styles.subtitle}>Distributed Job Scheduler</p>

        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={register}>
          Register
        </button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ===== SAME THEME ===== */
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    fontFamily: "Inter, sans-serif"
  },
  card: {
    width: 380,
    padding: 32,
    borderRadius: 18,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
    color: "#e5e7eb"
  },
  title: {
    textAlign: "center",
    marginBottom: 6
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    background: "#020617",
    border: "1px solid #334155",
    color: "#fff",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg, #22c55e, #4ade80)",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10
  },
  footer: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 14
  },
  link: {
    color: "#38bdf8",
    textDecoration: "none"
  }
};


