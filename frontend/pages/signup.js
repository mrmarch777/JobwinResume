import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push("/dashboard");
    });
  }, []);

  const handleSignUp = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!agreed) { setError("Please agree to the Terms of Service."); return; }
    setLoading(true); setError(""); setSuccess("");
    try {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) throw error;
      setSuccess("Account created! Check your email to verify, then log in.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    setError("");
    try {
      // Get the OAuth URL from Supabase without auto-redirecting
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: true, // Don't auto-redirect so we can modify the URL
        }
      });
      if (error) throw error;
      if (data?.url) {
        let authUrl = data.url;
        // Force Google account picker every time
        if (provider === 'google') {
          authUrl += (authUrl.includes('?') ? '&' : '?') + 'prompt=select_account';
        }
        window.location.href = authUrl;
      }
    } catch (err) {
      setError(err.message || `Error logging in with ${provider}`);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#09090b", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden", padding: "20px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.6s ease 0.1s forwards; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease 0.2s forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease 0.3s forwards; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.6s ease 0.4s forwards; opacity: 0; }
        .fade-up-5 { animation: fadeUp 0.6s ease 0.5s forwards; opacity: 0; }
        .inp:focus { border-color: rgba(108,99,255,0.5) !important; box-shadow: 0 0 0 3px rgba(108,99,255,0.1); outline: none; }
        .inp { transition: all 0.3s; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        .btn-signup:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(108,99,255,0.45) !important; }
        .social-btn:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; transform: translateY(-1px); }
        .link:hover { color: #8E84FF !important; }
        .eye-btn:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* Background glows */}
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)", borderRadius: "50%", animation: "glow 6s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 65%)", borderRadius: "50%", animation: "glow 6s ease-in-out infinite 3s", pointerEvents: "none" }} />

      {/* Card */}
      <div className="fade-up" style={{ width: "100%", maxWidth: "440px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 40px", backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div className="fade-up-1" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "22px", marginBottom: "8px" }}>🚀</div>
          <span style={{ fontFamily: "'Noto Serif', serif", fontSize: "22px", fontWeight: "700", color: "white", borderBottom: "1px solid rgba(108,99,255,0.4)", paddingBottom: "2px" }}>
            JobwinResume<span style={{ color: "#6C63FF" }}>.pro</span>
          </span>
        </div>

        {/* Title */}
        <div className="fade-up-2" style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Noto Serif', serif", fontSize: "28px", fontWeight: "700", color: "white", marginBottom: "8px" }}>Create Account</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", lineHeight: "1.6" }}>Join the elite network of career masters.</p>
        </div>

        {/* Error/Success */}
        {error && <div style={{ background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "#FF6584", fontSize: "13px" }}>⚠️ {error}</div>}
        {success && <div style={{ background: "rgba(67,217,162,0.08)", border: "1px solid rgba(67,217,162,0.25)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", color: "#43D9A2", fontSize: "13px" }}>✅ {success}</div>}

        {/* Fields */}
        <div className="fade-up-3">
          {/* Name */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
              <input className="inp" type="text" placeholder="Harry Green" value={name} onChange={e => setName(e.target.value)}
                style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "14px", color: "white" }} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
              <input className="inp" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: "100%", padding: "14px 16px 14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "14px", color: "white" }} />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)" }} />
              <input className="inp" type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                onKeyPress={e => e.key === "Enter" && handleSignUp()}
                style={{ width: "100%", padding: "14px 44px 14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "14px", color: "white" }} />
              <button className="eye-btn" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: 0, transition: "color 0.2s" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px" }}>
            <div onClick={() => setAgreed(!agreed)} style={{ width: "18px", height: "18px", borderRadius: "5px", border: `1px solid ${agreed ? "#6C63FF" : "rgba(255,255,255,0.2)"}`, background: agreed ? "#6C63FF" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginTop: "1px", transition: "all 0.2s" }}>
              {agreed && <span style={{ color: "white", fontSize: "11px", fontWeight: "700" }}>✓</span>}
            </div>
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.5" }}>
              I agree to the <a href="/terms" target="_blank" style={{ color: "#6C63FF", textDecoration: "none" }}>Terms & Conditions</a>, <a href="/privacy" target="_blank" style={{ color: "#6C63FF", textDecoration: "none" }}>Privacy Policy</a>, and <a href="/refund" target="_blank" style={{ color: "#6C63FF", textDecoration: "none" }}>Refund Policy</a>
            </span>
          </div>
        </div>

        {/* Sign up button */}
        <div className="fade-up-4">
          <button className="btn-signup" onClick={handleSignUp} disabled={loading}
            style={{ width: "100%", padding: "15px", background: loading ? "rgba(108,99,255,0.4)" : "linear-gradient(135deg, #6C63FF, #8E84FF)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px", boxShadow: "0 4px 20px rgba(108,99,255,0.3)" }}>
            {loading ? "Creating account..." : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>Or join with</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <button className="social-btn" onClick={() => handleOAuthLogin('google')} style={{ padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
              <span style={{ fontSize: "16px" }}>🌐</span> Google
            </button>
            <button className="social-btn" disabled title="Coming soon!" onClick={() => setError("Coming soon! Please use Google to log in for now.")} style={{ padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "600", cursor: "not-allowed", opacity: 0.5, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }}>
              <span style={{ fontSize: "16px" }}>💼</span> LinkedIn
            </button>
          </div>
        </div>

        {/* Login link */}
        <div className="fade-up-5" style={{ textAlign: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Already have an account? </span>
          <span className="link" onClick={() => router.push("/login")}
            style={{ color: "#6C63FF", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "color 0.2s" }}>
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}
