export const theme = {
  page: {
    minHeight: "100vh",
    padding: "40px 60px",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    color: "#e5e7eb",
    fontFamily: "Inter, sans-serif"
  },

  card: {
    maxWidth: 600,          // 🔥 keeps form narrow
    margin: "0 auto 40px",  // 🔥 center + spacing from table
    padding: 25,
    borderRadius: 16,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
  },

  form: {
    display: "flex",
    flexDirection: "column" // 🔥 vertical alignment
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    background: "#020617",
    color: "#fff",
    border: "1px solid #334155"
  },

  button: {
    marginTop: 10,
    padding: 14,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(90deg, #6366f1, #22d3ee)",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer"
  },

  tableWrapper: {
    marginTop: 30 // 🔥 separation from form
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    padding: 14,
    textAlign: "left",
    borderBottom: "1px solid #334155"
  },

  td: {
    padding: 14,
    borderBottom: "1px solid #334155"
  }
};
