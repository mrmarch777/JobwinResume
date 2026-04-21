import Head from "next/head";
import { useRouter } from "next/router";

export default function Privacy() {
  const router = useRouter();

  return (
    <div style={{ background: "#0a0a1a", color: "white", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <Head>
        <title>Privacy Policy | JobwinResume</title>
      </Head>
      <nav style={{ padding: "20px 60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", background: "rgba(10,10,26,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => router.push("/")}>
          <span style={{ fontSize: "22px" }}>🚀</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "white" }}>JobwinResume<span style={{ color: "#6C63FF" }}>.pro</span></span>
        </div>
      </nav>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "700", marginBottom: "20px" }}>Privacy Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>Effective Date: 30 March 2026</p>

        <div style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "32px" }}>
          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>1. Introduction</h2>
            <p>JobWinResume ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>2. Information We Collect</h2>
            <p style={{ fontWeight: "600", marginBottom: "8px", color: "white" }}>a) Information you provide:</p>
            <ul style={{ marginLeft: "24px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>Name, email address, phone number</li>
              <li>Resume content (education, work experience, skills)</li>
              <li>Payment information (processed securely, not stored by us)</li>
            </ul>

            <p style={{ fontWeight: "600", marginBottom: "8px", color: "white" }}>b) Information collected automatically:</p>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li>Device type, browser, IP address</li>
              <li>Pages visited, time spent on platform</li>
              <li>Job search keywords and preferences</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>3. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Provide and improve our services (job search, resume builder, interview prep)</li>
              <li>Process payments securely</li>
              <li>Send service-related emails and notifications</li>
              <li>Personalize your job search experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>4. We Do NOT:</h2>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Sell your personal data to third parties</li>
              <li>Share your resume without your consent</li>
              <li>Store your payment card details</li>
              <li>Send unsolicited spam</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>5. Data Sharing</h2>
            <p>We may share your data only with:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Payment Gateway Partners</strong> — for secure transaction processing</li>
              <li><strong>Job Platforms</strong> — only search queries, not your personal profile</li>
              <li><strong>Legal Authorities</strong> — if required by Indian law</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>6. Data Security</h2>
            <p>We use industry-standard SSL encryption and secure servers to protect your data. However, no system is 100% secure — please use a strong password and keep it confidential.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>7. Cookies</h2>
            <p>JobWinResume uses cookies to:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Improve website performance</li>
            </ul>
            <p style={{ marginTop: "12px" }}>You can disable cookies in your browser settings, but some features may not work properly.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p style={{ marginTop: "12px" }}>To exercise these rights, email us at <a href="mailto:support@jobwinresume.pro" style={{ color: "#6C63FF", textDecoration: "none" }}>support@jobwinresume.pro</a></p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>9. Data Retention</h2>
            <p>We retain your data for as long as your account is active, or as required by law. You may request deletion at any time.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>10. Children's Privacy</h2>
            <p>JobWinResume is not intended for users under 18. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you via email or a website notice.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>12. Data Controller &amp; Contact</h2>
            <p>This platform is legally owned and operated by <strong style={{ color: "white" }}>Mr. Amar Maruti Khot</strong> as a sole proprietorship.</p>
            <ul style={{ marginLeft: "0", marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px", listStyle: "none" }}>
              <li style={{ color: "rgba(255,255,255,0.6)" }}>📍 Address: H967 Room 303, Sec 19 Koparkhairane, Navi Mumbai 400709</li>
              <li style={{ color: "rgba(255,255,255,0.6)" }}>📧 Email: <a href="mailto:support@jobwinresume.pro" style={{ color: "#6C63FF", textDecoration: "none" }}>support@jobwinresume.pro</a></li>
              <li style={{ color: "rgba(255,255,255,0.6)" }}>📞 Phone: <a href="tel:+917700969639" style={{ color: "#6C63FF", textDecoration: "none" }}>+91 7700969639</a></li>
              <li style={{ color: "rgba(255,255,255,0.6)" }}>🌐 Website: <a href="https://www.jobwinresume.pro" style={{ color: "#6C63FF", textDecoration: "none" }}>www.jobwinresume.pro</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
