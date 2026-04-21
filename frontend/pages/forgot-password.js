import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        @keyframes checkPop { 0% { transform: scale(0); } 70% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.6s ease 0.4s forwards; opacity: 0; }
        .check-pop { animation: checkPop 0.5s ease forwards; }
        .inp:focus { border-color: rgba(108,99,255,0.5) !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); outline: none; }
        .inp { transition: all 0.3s; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(108,99,255,0.45) !important; }
        .back-btn:hover { color: white !important; }
        .link:hover { color: #8E84FF !important; }
      `}</style>

      {/* Background glows */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)", borderRadius: "50%", animation: "glow 6s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 65%)", borderRadius: "50%", animation: "glow 6s ease-in-out infinite 3s", pointerEvents: "none" }} />

      {/* Card */}
      <div className="fade-up" style={{ width: "100%", maxWidth: "440px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 40px", backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div className="fade-up-1" style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>🚀</div>
          <span style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: "white", borderBottom: "1px solid rgba(108,99,255,0.4)", paddingBottom: "2px" }}>
            JobwinResume<span style={{ color: "#6C63FF" }}>.pro</span>
          </span>
        </div>

        {sent ? (
          /* Success state */
          <div className="fade-up-2" style={{ textAlign: "center" }}>
            <div className="check-pop" style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(67,217,162,0.12)", border: "2px solid rgba(67,217,162,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "32px" }}>
              📧
            </div>
            <h2 style={{ fontFamily: "'Noto Serif', serif", fontSize: "26px", fontWeight: "700", color: "white", marginBottom: "12px" }}>Check Your Email</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: "1.7", marginBottom: "32px" }}>
              We sent a password reset link to<br />
              <span style={{ color: "#6C63FF", fontWeight: "600" }}>{email}</span>
            </p>
            <div style={{ background: "rgba(67,217,162,0.06)", border: "1px solid rgba(67,217,162,0.15)", borderRadius: "12px", padding: "14px", marginBottom: "28px" }}>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.6" }}>
                Didn't receive it? Check your spam folder or{" "}
                <span style={{ color: "#6C63FF", cursor: "pointer" }} onClick={() => { setSent(false); setEmail(""); }}>try again</span>.
              </p>
            </div>
            <button className="btn" onClick={() => router.push("/login")}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #6C63FF, #8E84FF)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              Back to Login <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="fade-up-2" style={{ textAlign: "center", marginBottom: "36px" }}>
              <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "10px" }}>Reset Password</h1>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: "1.7" }}>
                Enter your email address and we'll send you a link to regain access to your account.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "20px", color: "#FF6584", fontSize: "13px" }}>
                ⚠️ {error}
              </div>
            )}

            {/* Email field */}
            <div className="fade-up-3" style={{ marginBottom: "28px" }}>
              <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
                <input
                  className="inp"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && handleReset()}
                  style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "14px", color: "white" }}
                />
              </div>
            </div>

            {/* Send button */}
            <div className="fade-up-4">
              <button className="btn" onClick={handleReset} disabled={loading}
                style={{ width: "100%", padding: "15px", background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg, #6C63FF, #8E84FF)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(108,99,255,0.3)" }}>
                {loading ? "Sending..." : <><span>Send Reset Link</span><ArrowRight size={16} /></>}
              </button>

              {/* Back to login */}
              <div style={{ textAlign: "center" }}>
                <span className="back-btn" onClick={() => router.push("/login")}
                  style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", transition: "color 0.2s" }}>
                  <ArrowLeft size={14} /> Back to Login
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
