import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const c = {
  bg: "#f8f8f7",
  sidebar: "#f0efea",
  card: "#ffffff",
  border: "rgba(0,0,0,0.1)",
  borderStrong: "rgba(0,0,0,0.2)",
  text: "#1a1a18",
  textSub: "#5a5a58",
  textMuted: "#9b9b98",
  accent: "#2563eb",
  accentBg: "#dbeafe",
  accentText: "#1d4ed8",
  successBg: "#dcfce7",
  successText: "#166534",
  warningBg: "#fefce8",
  warningBorder: "#fde047",
  warningText: "#854d0e",
  dangerBg: "#fee2e2",
  dangerText: "#991b1b",
  orangeBg: "#fff7ed",
  orangeText: "#9a3412",
};

const STEPS = ["Search", "Read PDFs", "Summarize", "Insights", "Critique"];

export default function Dashboard({ session }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [activeNav, setActiveNav] = useState("new");

  const token = session.access_token;
  const email = session.user.email;
  const initials = email.slice(0, 2).toUpperCase();

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    if (!jobId || status === "SUCCESS" || status === "FAILURE") return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API}/status/${jobId}`, { headers: { Authorization: `Bearer ${token}` } });
        setStatus(res.data.status);
        if (res.data.status === "SUCCESS") {
          setResult(res.data.result);
          fetchJobs();
          clearInterval(interval);
        }
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, [jobId]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await axios.post(`${API}/research`, { topic }, { headers: { Authorization: `Bearer ${token}` } });
      setJobId(res.data.job_id);
      setStatus("PENDING");
    } catch (e) {
      setError("Could not start research. Check that the backend is running.");
    }
    setLoading(false);
  };

  const Badge = ({ label, type = "success" }) => {
    const map = {
      success: { bg: c.successBg, color: c.successText },
      warning: { bg: c.warningBg, color: c.warningText },
      danger: { bg: c.dangerBg, color: c.dangerText },
      orange: { bg: c.orangeBg, color: c.orangeText },
      accent: { bg: c.accentBg, color: c.accentText },
    };
    const s = map[type] || map.success;
    return (
      <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
        {label}
      </span>
    );
  };

  const navItems = [
    { id: "new", label: "New research", icon: "??" },
    { id: "jobs", label: "Past jobs", icon: "??" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", background: c.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: c.text }}>

      {/* Sidebar */}
      <div style={{ background: c.sidebar, borderRight: `0.5px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: `0.5px solid ${c.border}` }}>
          <div style={{ width: 28, height: 28, background: c.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15 }}>??</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Research Agent</span>
        </div>

        <div style={{ padding: "12px 0" }}>
          {navItems.map(({ id, label, icon }) => (
            <div key={id} onClick={() => setActiveNav(id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer",
                color: activeNav === id ? c.text : c.textSub,
                background: activeNav === id ? c.card : "transparent",
                fontWeight: activeNav === id ? 600 : 400,
                borderRight: activeNav === id ? `2px solid ${c.accent}` : "2px solid transparent" }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", padding: 16, borderTop: `0.5px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.accentBg, color: c.accentText, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: c.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
            </div>
            <span onClick={() => supabase.auth.signOut()} title="Sign out"
              style={{ fontSize: 18, color: c.textMuted, cursor: "pointer", lineHeight: 1 }}>?</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 28px", borderBottom: `0.5px solid ${c.border}`, background: c.card }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{activeNav === "new" ? "New research" : "Past jobs"}</div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
            {activeNav === "new" ? "Search arxiv papers and generate AI analysis" : `${jobs.length} jobs completed`}
          </div>
        </div>

        <div style={{ padding: 28, flex: 1 }}>

          {activeNav === "new" && (
            <>
              <div style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Research topic</div>
                <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. transformer models for NLP"
                    required
                    style={{ flex: 1, padding: "10px 14px", fontSize: 14, border: `1px solid ${c.borderStrong}`, borderRadius: 8, background: c.bg, color: c.text, outline: "none", fontFamily: "inherit" }}
                  />
                  <button type="submit" disabled={loading}
                    style={{ padding: "10px 20px", background: loading ? "#93c5fd" : c.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                    {loading ? "Starting…" : "Start research"}
                  </button>
                </form>
                {error && <div style={{ marginTop: 10, fontSize: 13, color: c.dangerText, background: c.dangerBg, padding: "8px 12px", borderRadius: 6 }}>{error}</div>}
              </div>

              {status && status !== "SUCCESS" && (
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "12px 16px", background: c.warningBg, border: `0.5px solid ${c.warningBorder}`, borderRadius: 8, fontSize: 13, color: c.warningText, marginBottom: 20 }}>
                  <span>? Pipeline running…</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
                    {STEPS.map((step, i) => (
                      <div key={step} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4,
                          background: i < 2 ? c.successBg : i === 2 ? c.warningBg : "transparent",
                          color: i < 2 ? c.successText : i === 2 ? c.warningText : c.textMuted,
                          fontWeight: i <= 2 ? 600 : 400 }}>
                          {i < 2 ? "? " : ""}{step}
                        </span>
                        {i < STEPS.length - 1 && <span style={{ margin: "0 2px", color: c.textMuted, fontSize: 11 }}>?</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Paper summaries</div>
                    <Badge label={`${result.summaries?.length || 0} papers`} type="accent" />
                  </div>

                  {result.summaries?.map((s, i) => (
                    <div key={i} style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text, marginBottom: 12, lineHeight: 1.5 }}>{s.title}</div>
                      <div style={{ fontSize: 13, color: c.textSub, lineHeight: 1.7, whiteSpace: "pre-wrap", borderTop: `0.5px solid ${c.border}`, paddingTop: 12 }}>{s.summary}</div>
                    </div>
                  ))}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
                    {[{ label: "Research insights", key: "insights", emoji: "??" }, { label: "Critical review", key: "critique", emoji: "??" }].map(({ label, key, emoji }) => (
                      <div key={key} style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>{emoji} {label}</div>
                        <div style={{ fontSize: 13, color: c.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                          {result[key] || `No ${label.toLowerCase()} returned`}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!result && !status && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: c.textMuted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>??</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: c.textSub, marginBottom: 6 }}>Start your first research</div>
                  <div style={{ fontSize: 13 }}>Enter a topic above to search arxiv papers and generate AI analysis.</div>
                </div>
              )}
            </>
          )}

          {activeNav === "jobs" && (
            <div style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", padding: "10px 18px", background: c.sidebar, borderBottom: `0.5px solid ${c.border}`, fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", gap: 12 }}>
                <div style={{ flex: 1 }}>Topic</div>
                <div style={{ minWidth: 90 }}>Date</div>
                <div style={{ minWidth: 70, textAlign: "right" }}>Status</div>
              </div>
              {jobs.length === 0 ? (
                <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 13, color: c.textMuted }}>
                  No research jobs yet. Start your first research.
                </div>
              ) : jobs.map((j, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 18px", borderBottom: i < jobs.length - 1 ? `0.5px solid ${c.border}` : "none", gap: 12, fontSize: 13 }}>
                  <div style={{ flex: 1, color: c.text }}>{j.topic}</div>
                  <div style={{ minWidth: 90, fontSize: 12, color: c.textMuted }}>{j.created_at ? new Date(j.created_at).toLocaleDateString() : "—"}</div>
                  <div style={{ minWidth: 70, textAlign: "right" }}>
                    <Badge
                      label={j.status}
                      type={j.status === "done" ? "success" : j.status === "failed" ? "danger" : "orange"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
