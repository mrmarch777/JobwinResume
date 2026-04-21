import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

export default function About() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("team");

  return (
    <div style={{ background: "#0a0a1a", color: "white", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <Head>
        <title>About Us | JobwinResume</title>
        <meta name="description" content="Learn about JobwinResume's team and the legal owner behind India's smartest job search platform." />
      </Head>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tab-btn { cursor: pointer; padding: 12px 32px; border-radius: 10px; font-size: 15px; font-weight: 600; transition: all 0.25s; border: 1px solid transparent; }
        .tab-btn.active { background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; box-shadow: 0 4px 20px rgba(108,99,255,0.4); }
        .tab-btn.inactive { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.55); border-color: rgba(255,255,255,0.1); }
        .tab-btn.inactive:hover { background: rgba(255,255,255,0.1); color: white; }
        .info-row { display: flex; align-items: flex-start; gap: 14px; color: rgba(255,255,255,0.65); font-size: 14px; line-height: 1.6; }
        .team-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; transition: all 0.3s; }
        .team-card:hover { border-color: rgba(108,99,255,0.3); background: rgba(108,99,255,0.05); transform: translateY(-4px); }
      `}</style>

      {/* Navigation */}
      <nav style={{ padding: "20px 60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", background: "rgba(10,10,26,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => router.push("/")}>
          <span style={{ fontSize: "22px" }}>🚀</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "white" }}>JobwinResume</span>
        </div>
      </nav>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ color: "#6C63FF", fontSize: "12px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "16px" }}>ABOUT US</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 5vw, 60px)", fontWeight: "800", marginBottom: "20px", lineHeight: "1.1" }}>
            Reimagining the<br /><span style={{ color: "#6C63FF", fontStyle: "italic" }}>Job Search Experience</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "17px", lineHeight: "1.7", maxWidth: "580px", margin: "0 auto" }}>
            JobwinResume was born out of a simple frustration: the job search process in India is broken. We use AI to level the playing field for every job seeker.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "56px" }}>
          <button
            className={`tab-btn ${activeTab === "team" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("team")}
          >
            👥 Our Team
          </button>
          <button
            className={`tab-btn ${activeTab === "legal" ? "active" : "inactive"}`}
            onClick={() => setActiveTab("legal")}
          >
            ⚖️ Legal Owner
          </button>
        </div>

        {/* ── TAB: OUR TEAM ── */}
        {activeTab === "team" && (
          <div>
            {/* Mission cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "60px" }}>
              {[
                { icon: "🎯", title: "Our Mission", desc: "To bridge the gap between talent and opportunity by providing the most advanced job search technology to everyone, regardless of their background." },
                { icon: "⚡", title: "AI First", desc: "We believe AI is a force for good. Our platform uses the latest LLMs to analyze job descriptions and optimize resumes in real-time." },
                { icon: "🇮🇳", title: "Made in India", desc: "Proudly built in Navi Mumbai for the ambitious workforce of India. We understand the nuances of the local market better than anyone else." },
              ].map((item) => (
                <div key={item.title} className="team-card">
                  <div style={{ fontSize: "36px", marginBottom: "16px" }}>{item.icon}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", marginBottom: "12px" }}>{item.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: "1.75", fontSize: "14px" }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div style={{ background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "20px", padding: "40px 48px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "32px", marginBottom: "60px", textAlign: "center" }}>
              {[["50K+", "Jobs Listed"], ["10K+", "Active Users"], ["85%", "Success Rate"], ["3×", "Faster Hiring"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: "700", color: "#6C63FF" }}>{n}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginTop: "6px" }}>{l}</div>
                </div>
              ))}
            </div>

            {/* About blurb */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "40px 48px", marginBottom: "60px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", marginBottom: "20px" }}>
                We built JobwinResume for <span style={{ color: "#6C63FF", fontStyle: "italic" }}>job seekers</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: "1.85", marginBottom: "16px" }}>
                JobwinResume was built by engineers and job seekers who were frustrated with how broken the job search experience was in India.
              </p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "15px", lineHeight: "1.85", marginBottom: "28px" }}>
                We combined real-time job data with the power of Claude AI to create a platform that truly helps — not just lists jobs.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {[["🚀", "Founded 2026"], ["🇮🇳", "Made in India"], ["🤖", "Powered by Claude AI"], ["💼", "50,000+ Jobs"]].map(([icon, text]) => (
                  <div key={text} style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "18px" }}>{icon}</span>
                    <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "48px", textAlign: "center" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: "700", marginBottom: "14px" }}>Have Questions?</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: "28px" }}>We're here to help you accelerate your career.</p>
              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={() => router.push("/pricing")} style={{ padding: "14px 40px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s" }}>
                  View Our Plans
                </button>
                <a href="mailto:support@jobwinresume.pro" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "14px 40px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>
                    Contact Support
                  </button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: LEGAL OWNER ── */}
        {activeTab === "legal" && (
          <div>
            {/* Owner card */}
            <div style={{ background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.18)", borderRadius: "28px", padding: "52px 48px", position: "relative", overflow: "hidden", marginBottom: "48px" }}>
              {/* Decorative glow */}
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "380px", height: "380px", background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

              <div style={{ display: "flex", gap: "52px", alignItems: "flex-start", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0, width: "140px", height: "140px", borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <div style={{ fontSize: "56px", opacity: 0.5 }}>👤</div>
                  <div style={{ position: "absolute", bottom: "-12px", right: "-12px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", color: "white", padding: "6px 14px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>Legal Owner</div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "30px", fontWeight: "700", marginBottom: "6px" }}>Amar Khot</h2>
                  <p style={{ color: "#6C63FF", fontWeight: "600", fontSize: "13px", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "1px" }}>Legal Owner — JobwinResume</p>

                  <p style={{ color: "rgba(255,255,255,0.65)", lineHeight: "1.85", marginBottom: "28px", fontSize: "15px" }}>
                    "As the legal owner of JobwinResume, I stand behind every resume tool and customer interaction on this platform. Please use our official support team first, and contact me directly only when it is absolutely necessary."
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div className="info-row">
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>📍</span>
                      <span>Sec 19 Koparkhairane, Plot 967, Room 303, Navi Mumbai 400709</span>
                    </div>
                    <div className="info-row">
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>📧</span>
                      <a href="mailto:amarkhot11111@gmail.com" style={{ color: "#6C63FF", textDecoration: "none" }}>amarkhot11111@gmail.com</a>
                    </div>
                    <div className="info-row">
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>📞</span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: "600" }}>+91 7700969639</span>
                    </div>
                    <div className="info-row">
                      <span style={{ fontSize: "18px", flexShrink: 0 }}>🌐</span>
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>Same address as above</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal notice banner */}
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "28px 32px", marginBottom: "40px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>⚖️</span>
                <div>
                  <p style={{ fontWeight: "600", color: "white", marginBottom: "8px", fontSize: "15px" }}>Legal Ownership Notice</p>
                  <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: "1.8", fontSize: "14px" }}>
                    This platform (<strong style={{ color: "white" }}>JobwinResume</strong>) is legally owned and operated by <strong style={{ color: "white" }}>Mr. Amar Maruti Khot</strong> as a sole proprietorship. All services, content, and intellectual property on this platform are the exclusive property of the owner.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact options */}
            <div style={{ background: "rgba(108,99,255,0.05)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "16px", padding: "28px 32px", marginBottom: "40px" }}>
              <p style={{ color: "#6C63FF", fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "20px" }}>Official Contact Channels</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { icon: "📧", label: "Official Support Email", value: "support@jobwinresume.pro", href: "mailto:support@jobwinresume.pro" },
                  { icon: "📞", label: "Official Support Phone", value: "+91 7700969639", href: "tel:+917700969639" },
                  { icon: "📸", label: "Instagram", value: "@JobwinResume", href: "https://www.instagram.com/JobwinResume" },
                ].map((c) => (
                  <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ textDecoration: "none", display: "block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "18px 20px", transition: "all 0.25s" }}>
                    <div style={{ fontSize: "22px", marginBottom: "8px" }}>{c.icon}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginBottom: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>{c.label}</div>
                    <div style={{ color: "#6C63FF", fontSize: "14px", fontWeight: "600" }}>{c.value}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Legal policies links */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "36px", textAlign: "center" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginBottom: "20px" }}>Legal Documents</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                {[["Privacy Policy", "/privacy"], ["Terms & Conditions", "/terms"], ["Refund Policy", "/refund"]].map(([label, href]) => (
                  <button key={label} onClick={() => router.push(href)} style={{ padding: "10px 24px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ padding: "48px 40px", background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>© 2026 JobwinResume. All rights reserved. Registered Office: Plot 967, Room 303, Sec 19, Koparkhairane, Navi Mumbai 400709.</p>
      </footer>
    </div>
  );
}
