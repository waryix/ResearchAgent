import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const c = {
  bg: "#f8f8f7", sidebar: "#f0efea", card: "#ffffff",
  border: "rgba(0,0,0,0.1)", borderStrong: "rgba(0,0,0,0.2)",
  text: "#1a1a18", textSub: "#5a5a58", textMuted: "#9b9b98",
  accent: "#2563eb", accentBg: "#dbeafe", accentText: "#1d4ed8",
  successBg: "#dcfce7", successText: "#166534",
  warningBg: "#fefce8", warningBorder: "#fde047", warningText: "#854d0e",
  dangerBg: "#fee2e2", dangerText: "#991b1b",
  orangeBg: "#fff7ed", orangeText: "#9a3412",
};

const STEPS = ["Search", "Read PDFs", "Summarize", "Insights", "Critique"];

const Badge = ({ label, type = "success" }) => {
  const map = {
    success: { bg: c.successBg, color: c.successText },
    warning: { bg: c.warningBg, color: c.warningText },
    danger: { bg: c.dangerBg, color: c.dangerText },
    orange: { bg: c.orangeBg, color: c.orangeText },
    accent: { bg: c.accentBg, color: c.accentText },
  };
  const s = map[type] || map.success;
  return <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{label}</span>;
};

export default function Dashboard({ session }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [activeNav, setActiveNav] = useState("new");
  const [mode, setMode] = useState("arxiv");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedPaths, setUploadedPaths] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileRef = useRef();

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
          setCurrentJobId(jobId);
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 20) {
      setError("Maximum 20 PDFs allowed");
      return;
    }
    setSelectedFiles(files);
    setError("");
    setUploadedPaths([]);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadStatus("Uploading...");
    try {
      const formData = new FormData();
      selectedFiles.forEach(f => formData.append("files", f));
      const res = await axios.post(`${API}/upload-pdfs`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setUploadedPaths(res.data.uploaded);
      setUploadStatus(`? ${res.data.uploaded.length} PDF${res.data.uploaded.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      setError("Upload failed. Try again.");
      setUploadStatus("");
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "upload" && !uploadedPaths.length) {
      setError("Please upload PDFs first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setStatus(null);
    setJobId(null);
    setCurrentJobId(null);
    try {
      const res = await axios.post(`${API}/research`,
        { topic: topic || "Uploaded PDFs", pdf_paths: mode === "upload" ? uploadedPaths : [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobId(res.data.job_id);
      setStatus("PENDING");
    } catch (e) {
      setError("Could not start research. Check that the backend is running.");
    }
    setLoading(false);
  };

  const handleDownload = async (jid, fmt) => {
    try {
      const res = await axios.get(`${API}/download/${jid}/${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `research_report.${fmt}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError("Download failed.");
    }
  };

  const navItems = [{ id: "new", label: "New research", icon: "??" }, { id: "jobs", label: "Past jobs", icon: "??" }];

  const inputStyle = { flex: 1, padding: "10px 14px", fontSize: 14, border: `1px solid ${c.borderStrong}`, borderRadius: 8, background: c.bg, color: c.text, outline: "none", fontFamily: "inherit" };
  const btnPrimary = { padding: "10px 20px", background: c.accent, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" };
  const btnSecondary = { padding: "8px 14px", background: c.bg, color: c.text, border: `1px solid ${c.borderStrong}`, borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", background: c.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", color: c.text }}>

      {/* Sidebar */}
      <div style={{ background: c.sidebar, borderRight: `0.5px solid ${c.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `0.5px solid ${c.border}` }}>
          <div style={{ width: 28, height: 28, background: c.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15 }}>??</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>Research Agent</span>
        </div>
        <div style={{ padding: "12px 0" }}>
          {navItems.map(({ id, label, icon }) => (
            <div key={id} onClick={() => setActiveNav(id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer",
                color: activeNav === id ? c.text : c.textSub, background: activeNav === id ? c.card : "transparent",
                fontWeight: activeNav === id ? 600 : 400, borderRight: activeNav === id ? `2px solid ${c.accent}` : "2px solid transparent" }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", padding: 16, borderTop: `0.5px solid ${c.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.accentBg, color: c.accentText, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: c.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{email}</div>
            </div>
            <span onClick={() => supabase.auth.signOut()} title="Sign out" style={{ fontSize: 18, color: c.textMuted, cursor: "pointer" }}>?</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 28px", borderBottom: `0.5px solid ${c.border}`, background: c.card }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{activeNav === "new" ? "New research" : "Past jobs"}</div>
          <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{activeNav === "new" ? "Search arxiv or upload your own PDFs" : `${jobs.length} jobs completed`}</div>
        </div>

        <div style={{ padding: 28, flex: 1 }}>
          {activeNav === "new" && (
            <>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 4, marginBottom: 16, background: c.sidebar, padding: 4, borderRadius: 8, width: "fit-content", border: `0.5px solid ${c.border}` }}>
                {[{ id: "arxiv", label: "?? Search arxiv" }, { id: "upload", label: "?? Upload PDFs" }].map(({ id, label }) => (
                  <button key={id} onClick={() => { setMode(id); setError(""); }}
                    style={{ padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                      background: mode === id ? c.card : "transparent", color: mode === id ? c.text : c.textSub,
                      boxShadow: mode === id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Search card */}
              <div style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
                {mode === "arxiv" ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Research topic</div>
                    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
                      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. transformer models for NLP" required style={inputStyle} />
                      <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
                        {loading ? "Starting…" : "Start research"}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Upload PDFs (max 20)</div>

                    <div onClick={() => fileRef.current.click()}
                      style={{ border: `2px dashed ${c.borderStrong}`, borderRadius: 8, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: c.bg, marginBottom: 12 }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>??</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: c.text, marginBottom: 4 }}>Click to select PDFs</div>
                      <div style={{ fontSize: 12, color: c.textMuted }}>Up to 20 PDF files</div>
                      <input ref={fileRef} type="file" accept=".pdf" multiple onChange={handleFileChange} style={{ display: "none" }} />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: c.textSub, marginBottom: 8 }}>{selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected:</div>
                        <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                          {selectedFiles.map((f, i) => (
                            <div key={i} style={{ fontSize: 12, color: c.text, padding: "4px 8px", background: c.bg, borderRadius: 4, border: `0.5px solid ${c.border}` }}>
                              ?? {f.name} <span style={{ color: c.textMuted }}>({(f.size / 1024).toFixed(0)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={handleUpload} disabled={!selectedFiles.length || uploading}
                        style={{ ...btnSecondary, opacity: !selectedFiles.length || uploading ? 0.5 : 1 }}>
                        {uploading ? "Uploading…" : "Upload to cloud"}
                      </button>
                      {uploadStatus && <span style={{ fontSize: 12, color: c.successText, fontWeight: 500 }}>{uploadStatus}</span>}
                    </div>

                    {uploadedPaths.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Topic label (optional)</div>
                        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
                          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. My uploaded papers on NLP" style={inputStyle} />
                          <button type="submit" disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
                            {loading ? "Starting…" : "Analyse PDFs"}
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
                {error && <div style={{ marginTop: 10, fontSize: 13, color: c.dangerText, background: c.dangerBg, padding: "8px 12px", borderRadius: 6 }}>{error}</div>}
              </div>

              {/* Pipeline status */}
              {status && status !== "SUCCESS" && (
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "12px 16px", background: c.warningBg, border: `0.5px solid ${c.warningBorder}`, borderRadius: 8, fontSize: 13, color: c.warningText, marginBottom: 20 }}>
                  <span>? Pipeline running…</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
                    {STEPS.map((step, i) => (
                      <div key={step} style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4,
                          background: i < 2 ? c.successBg : i === 2 ? c.warningBg : "transparent",
                          color: i < 2 ? c.successText : i === 2 ? c.warningText : c.textMuted, fontWeight: i <= 2 ? 600 : 400 }}>
                          {i < 2 ? "? " : ""}{step}
                        </span>
                        {i < STEPS.length - 1 && <span style={{ margin: "0 2px", color: c.textMuted, fontSize: 11 }}>?</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Results</div>
                      <Badge label={`${result.summaries?.length || 0} papers`} type="accent" />
                    </div>
                    {currentJobId && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleDownload(currentJobId, "pdf")} style={btnSecondary}>? Download PDF</button>
                        <button onClick={() => handleDownload(currentJobId, "docx")} style={btnSecondary}>? Download DOCX</button>
                      </div>
                    )}
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
                        <div style={{ fontSize: 13, color: c.text, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result[key] || `No ${label.toLowerCase()} returned`}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!result && !status && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: c.textMuted }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>??</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: c.textSub, marginBottom: 6 }}>Start your first research</div>
                  <div style={{ fontSize: 13 }}>Search arxiv or upload your own PDFs to get started.</div>
                </div>
              )}
            </>
          )}

          {activeNav === "jobs" && (
            <div style={{ background: c.card, border: `0.5px solid ${c.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", padding: "10px 18px", background: c.sidebar, borderBottom: `0.5px solid ${c.border}`, fontSize: 11, fontWeight: 600, color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", gap: 12 }}>
                <div style={{ flex: 1 }}>Topic</div>
                <div style={{ minWidth: 90 }}>Date</div>
                <div style={{ minWidth: 120, textAlign: "right" }}>Actions</div>
              </div>
              {jobs.length === 0 ? (
                <div style={{ padding: "40px 18px", textAlign: "center", fontSize: 13, color: c.textMuted }}>No research jobs yet.</div>
              ) : jobs.map((j, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "13px 18px", borderBottom: i < jobs.length - 1 ? `0.5px solid ${c.border}` : "none", gap: 12, fontSize: 13 }}>
                  <div style={{ flex: 1, color: c.text }}>{j.topic}</div>
                  <div style={{ minWidth: 90, fontSize: 12, color: c.textMuted }}>{j.created_at ? new Date(j.created_at).toLocaleDateString() : "—"}</div>
                  <div style={{ minWidth: 120, display: "flex", gap: 4, justifyContent: "flex-end", alignItems: "center" }}>
                    <Badge label={j.status} type={j.status === "done" ? "success" : j.status === "failed" ? "danger" : "orange"} />
                    {j.status === "done" && (
                      <>
                        <button onClick={() => handleDownload(j.job_id, "pdf")} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }}>PDF</button>
                        <button onClick={() => handleDownload(j.job_id, "docx")} style={{ ...btnSecondary, padding: "3px 8px", fontSize: 11 }}>DOCX</button>
                      </>
                    )}
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
