import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Supabase sends token in URL hash: #access_token=xxx&type=recovery
    // OR as query params: ?token=xxx&type=recovery
    // We need to handle both cases
    const handleToken = async () => {
      try {
        // Check hash fragment first (most common with Supabase)
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          const params = new URLSearchParams(hash.replace("#", ""));
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (type === "recovery" && accessToken) {
            // Set the session with the tokens from the URL
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || "",
            });
            if (!error) {
              setValidToken(true);
              setChecking(false);
              return;
            }
          }
        }

        // Check if already have a valid session (user clicked link and session was set)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setValidToken(true);
          setChecking(false);
          return;
        }

        // No valid token found
        setError("This reset link is invalid or has expired. Please request a new one.");
        setChecking(false);
      } catch (e) {
        setError("Something went wrong. Please request a new reset link.");
        setChecking(false);
      }
    };

    handleToken();
  }, []);

  const handleSubmit = async () => {
    if (!password) { setError("Please enter a new password."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Sign out and redirect to login after 3 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to update password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans',sans-serif", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        .inp:focus { border-color: rgba(108,99,255,0.6) !important; outline: none; box-shadow: 0 0 0 3px rgba(108,99,255,0.12); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(108,99,255,0.45) !important; }
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "40px 36px" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#6C63FF,#FF6584)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚀</div>
          <span style={{ fontFamily: "'Noto Serif',serif", fontSize: 18, fontWeight: 700, color: "white" }}>JobwinResume<span style={{ color: "#6C63FF" }}>.pro</span></span>
        </div>

        {checking ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Verifying reset link...</p>
          </div>
        ) : success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 22, fontWeight: 700, color: "white", marginBottom: 10 }}>Password Updated!</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>Your password has been changed successfully. Redirecting to login...</p>
          </div>
        ) : !validToken ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: 20, fontWeight: 700, color: "white", marginBottom: 10 }}>Link Expired</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{error}</p>
            <button onClick={() => router.push("/forgot-password")}
              style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Request New Reset Link
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: 24, fontWeight: 700, color: "white", marginBottom: 8 }}>Set New Password</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>Enter your new password below.</p>

            {error && (
              <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#ff8080", fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>New Password</label>
                <input
                  className="inp"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 14, color: "white", transition: "all 0.3s" }}
                />
              </div>

              <div>
                <label style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Confirm Password</label>
                <input
                  className="inp"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 14, color: "white", transition: "all 0.3s" }}
                />
              </div>

              <button
                className="btn"
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: "100%", padding: "14px", background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg,#6C63FF,#FF6584)", color: "white", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", marginTop: 4 }}>
                {loading ? "Updating..." : "Update Password →"}
              </button>

              <button onClick={() => router.push("/login")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer", padding: "4px", textAlign: "center" }}>
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
