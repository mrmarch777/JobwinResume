import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTheme, THEMES, usePlan } from "../lib/contexts";

export default function PaymentSuccess() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { refreshPlan } = usePlan();
  const [showConfetti, setShowConfetti] = useState(true);
  const [animate, setAnimate] = useState(false);

  const { plan, amount, payment_id, promo } = router.query;
  const planName = { free: "Free", basic: "Basic", standard: "Standard", pro: "Pro" }[plan] || plan || "—";
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setAnimate(true), 100);
    // Stop confetti after 6 seconds
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    // Refresh plan context
    refreshPlan();
    return () => clearTimeout(timer);
  }, []);

  // Generate confetti pieces
  const confettiColors = ["#6C63FF", "#FF6584", "#43D9A2", "#FFD93D", "#A29BFE", "#FF9FF3", "#54A0FF", "#00D2D3"];
  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2.5 + Math.random() * 2,
    color: confettiColors[i % confettiColors.length],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    shape: i % 3, // 0=square, 1=circle, 2=rectangle
  }));

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Manrope', Arial, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,600;0,700;1,600&family=Manrope:wght@300;400;500;600;700&display=swap');

        @keyframes confettiFall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(108,99,255,0.2), 0 0 60px rgba(108,99,255,0.1); }
          50% { box-shadow: 0 0 50px rgba(108,99,255,0.4), 0 0 100px rgba(108,99,255,0.15); }
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.15); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .success-card { animation: fadeSlideUp 0.8s ease-out forwards, pulseGlow 3s ease-in-out infinite; }
        .emoji-bounce { animation: bounceIn 0.6s ease-out forwards; }
        .float-anim { animation: float 3s ease-in-out infinite; }
        .cta-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(108,99,255,0.5) !important; }
        .instruction-card:hover { border-color: rgba(108,99,255,0.4) !important; transform: translateY(-2px); }
      `}</style>

      {/* ── CONFETTI ── */}
      {showConfetti && confettiPieces.map(p => (
        <div key={p.id} style={{
          position: "fixed", top: 0, left: `${p.left}%`, width: p.shape === 2 ? `${p.size * 0.5}px` : `${p.size}px`, height: `${p.size}px`,
          background: p.color, borderRadius: p.shape === 1 ? "50%" : "2px", zIndex: 1000, pointerEvents: "none",
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s both`, transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "580px", width: "100%", padding: "32px 20px", textAlign: "center", position: "relative", zIndex: 10,
        opacity: animate ? 1 : 0, transition: "opacity 0.5s ease" }}>

        {/* Big emoji celebration */}
        <div style={{ fontSize: "64px", marginBottom: "12px", lineHeight: 1 }} className="emoji-bounce">
          🎉
        </div>

        {/* Congrats heading */}
        <h1 className="success-card" style={{
          fontFamily: "'Noto Serif', serif", fontSize: "clamp(28px, 5vw, 42px)", fontWeight: "700",
          marginBottom: "8px", color: t.text, display: "inline-block",
          background: "linear-gradient(135deg, #6C63FF 0%, #FF6584 50%, #43D9A2 100%)",
          backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", animation: "shimmer 3s linear infinite, fadeSlideUp 0.8s ease-out forwards",
        }}>
          Congratulations! 🥳
        </h1>

        <p style={{ color: t.muted, fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
          Your payment was successful! 😄 Welcome to <strong style={{ color: t.accent }}>JobwinResume {planName}</strong>! 🚀
        </p>

        {/* ── Plan Details Card ── */}
        <div className="success-card" style={{
          background: t.card, border: `1px solid ${t.border}`, borderRadius: "20px",
          padding: "28px 24px", marginBottom: "24px", textAlign: "left",
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: "linear-gradient(135deg, #6C63FF, #FF6584)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: "22px",
            }}>✅</div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "17px", color: t.text }}>Payment Successful!</div>
              <div style={{ fontSize: "12px", color: t.muted }}>{today}</div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {[
              { label: "Plan Activated", value: `${planName} Plan ⚡`, highlight: true },
              { label: "Amount Paid", value: `₹${amount || "—"}`, color: "#43D9A2" },
              { label: "Payment ID", value: payment_id || "—", mono: true },
              ...(promo ? [{ label: "Promo Applied", value: `${promo} 🏷️`, color: "#FFD93D" }] : []),
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", background: `${t.accent}08`, borderRadius: "12px",
                border: `1px solid ${t.border}`,
              }}>
                <span style={{ fontSize: "13px", color: t.muted }}>{item.label}</span>
                <span style={{
                  fontSize: "14px", fontWeight: "600",
                  color: item.color || (item.highlight ? t.accent : t.text),
                  fontFamily: item.mono ? "'SF Mono', 'Fira Code', monospace" : "inherit",
                  fontSize: item.mono ? "12px" : "14px",
                }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Invoice Email Notice ── */}
        <div className="float-anim" style={{
          background: "rgba(67,217,162,0.08)", border: "1px solid rgba(67,217,162,0.2)",
          borderRadius: "14px", padding: "16px 20px", marginBottom: "24px",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "28px" }}>📧</span>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: "14px", fontWeight: "600", color: t.text, marginBottom: "2px" }}>
              Invoice sent to your email! 😊
            </p>
            <p style={{ fontSize: "12px", color: t.muted }}>
              Check your inbox for a detailed receipt with all transaction details.
            </p>
          </div>
        </div>

        {/* ── Instructions ── */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "600", color: t.text, marginBottom: "14px" }}>
            Quick Tips 💡
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { icon: "⏳", title: "Plan not showing yet?", desc: "Please wait up to 5 minutes and refresh the page. It usually activates instantly! 😊" },
              { icon: "🔄", title: "Still not updated?", desc: "Try logging out and logging back in — this refreshes your account status." },
              { icon: "📱", title: "On mobile?", desc: "Close the browser completely and reopen JobwinResume for a fresh start." },
              { icon: "💬", title: "Need help?", desc: "Email us at mrmarch777@gmail.com or call +91 7700969639. We're happy to help! 😄" },
            ].map((tip, i) => (
              <div key={i} className="instruction-card" style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "14px 18px", background: t.card, border: `1px solid ${t.border}`,
                borderRadius: "14px", textAlign: "left", cursor: "default",
                transition: "all 0.3s ease",
              }}>
                <span style={{ fontSize: "22px", flexShrink: 0, marginTop: "2px" }}>{tip.icon}</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: t.text, marginBottom: "3px" }}>{tip.title}</p>
                  <p style={{ fontSize: "12px", color: t.muted, lineHeight: 1.5 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Button ── */}
        <button className="cta-btn" onClick={() => router.push("/dashboard")}
          style={{
            padding: "16px 48px", background: "linear-gradient(135deg, #6C63FF, #FF6584)",
            color: "white", border: "none", borderRadius: "14px", fontSize: "16px",
            fontWeight: "700", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
            transition: "all 0.3s ease", boxShadow: "0 8px 28px rgba(108,99,255,0.35)",
            marginBottom: "16px", width: "100%", maxWidth: "320px",
          }}>
          Go to Dashboard 🚀
        </button>

        <p style={{ fontSize: "12px", color: t.muted, marginTop: "8px" }}>
          Thank you for choosing <span style={{ color: t.accent, fontWeight: "600" }}>JobwinResume</span> — India's Smartest Job Platform 🇮🇳
        </p>
      </div>
    </div>
  );
}
