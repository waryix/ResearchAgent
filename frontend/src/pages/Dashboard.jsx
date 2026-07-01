import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard({ session }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  const token = session.access_token;

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (!jobId || status === "SUCCESS" || status === "FAILURE") return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/status/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("polling status:", res.data);
        setStatus(res.data.status);
        if (res.data.status === "SUCCESS" && res.data.result) {
          const r = res.data.result;
          setResult(r);
          fetchJobs();
          clearInterval(interval);
        }
      } catch (e) {
        console.error("polling error:", e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [jobId, status]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.jobs);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setStatus(null);
    setJobId(null);
    try {
      const res = await axios.post(`${API}/research`, { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("job started:", res.data);
      setJobId(res.data.job_id);
      setStatus("PENDING");
    } catch (e) {
      console.error(e);
      setError("Failed to start research. Is the backend running?");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Research Agent</h2>
        <div>
          <span style={{ marginRight: 12, fontSize: 14, color: "#555" }}>{session.user.email}</span>
          <button onClick={handleLogout} style={{ padding: "6px 12px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Enter research topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ flex: 1, padding: 10, fontSize: 15 }}
          required
        />
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 15 }}>
          {loading ? "Starting..." : "Research"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}

      {status && !result && (
        <div style={{ marginTop: 16, padding: 12, background: "#fff8e1", borderRadius: 8 }}>
          <p>? Status: <strong>{status}</strong> — checking every 3 seconds...</p>
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>?? Summaries</h3>
          {result.summaries?.map((s, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginBottom: 12 }}>
              <h4 style={{ marginTop: 0 }}>{s.title}</h4>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.6 }}>{s.summary}</pre>
            </div>
          ))}

          <h3>?? Insights</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
            {result.insights || "No insights returned"}
          </pre>

          <h3>?? Critique</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 16, borderRadius: 8, lineHeight: 1.6 }}>
            {result.critique || "No critique returned"}
          </pre>
        </div>
      )}

      {jobs.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3>?? Past Research Jobs</h3>
          {jobs.map((j, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{j.topic}</span>
              <span style={{ color: j.status === "done" ? "green" : j.status === "failed" ? "red" : "orange", fontWeight: "bold" }}>{j.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
