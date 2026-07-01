import { useState } from "react";
import { supabase } from "../supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    else if (!isLogin) setMessage("Check your email to confirm your account!");
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>{isLogin ? "Login" : "Sign Up"} — Research Agent</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8, boxSizing: "border-box" }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, background: "#0070f3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <p style={{ marginTop: 12, textAlign: "center" }}>
        {isLogin ? "No account?" : "Have an account?"}{" "}
        <span style={{ color: "#0070f3", cursor: "pointer" }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign Up" : "Login"}
        </span>
      </p>
    </div>
  );
}
