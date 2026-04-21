import Head from "next/head";
import { useRouter } from "next/router";

export default function Terms() {
  const router = useRouter();

  return (
    <div style={{ background: "#0a0a1a", color: "white", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <Head>
        <title>Terms &amp; Conditions | JobWinResume</title>
      </Head>
      <nav style={{ padding: "20px 60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", background: "rgba(10,10,26,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => router.push("/")}>
          <span style={{ fontSize: "22px" }}>🚀</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "white" }}>JobWinResume<span style={{ color: "#6C63FF" }}>.pro</span></span>
        </div>
      </nav>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "700", marginBottom: "20px" }}>Terms &amp; Conditions</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>Effective Date: 30 March 2026</p>

        <div style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "32px" }}>
          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>1. Acceptance of Terms</h2>
            <p>By accessing or using JobWinResume ("we", "our", "the platform"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>2. About JobWinResume</h2>
            <p>JobWinResume is a career services platform that provides:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li><strong>Job Search Aggregation</strong> — Search jobs across multiple platforms in one click</li>
              <li><strong>Resume Builder</strong> — Create professional resumes</li>
              <li><strong>Interview Preparation</strong> — Access commonly asked interview questions and tips</li>
            </ul>
            <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,100,100,0.1)", borderLeft: "4px solid #FF6584", borderRadius: "4px" }}>
              <strong>⚠️ IMPORTANT DISCLAIMER:</strong> JobWinResume is a tools and services platform only. We do NOT guarantee job placement, employment, or interviews. We do NOT act as a recruiter or employer.
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>3. User Eligibility</h2>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>You must be at least 18 years old to use JobWinResume</li>
              <li>You must provide accurate, truthful information when creating an account</li>
              <li>One account per user is allowed</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>4. Paid Services</h2>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Some features on JobWinResume require payment (resume builder, premium job search, interview prep content)</li>
              <li>All prices are displayed in Indian Rupees (INR) and include applicable taxes</li>
              <li>Payment is processed securely through our payment gateway partner</li>
              <li>Access to paid features begins immediately after successful payment</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>5. User Responsibilities</h2>
            <p>You agree NOT to:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Use JobWinResume for any fraudulent or illegal purpose</li>
              <li>Share your account credentials with others</li>
              <li>Misrepresent your identity or qualifications</li>
              <li>Attempt to reverse-engineer or copy our platform</li>
              <li>Use automated bots or scrapers on our platform</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>6. Intellectual Property</h2>
            <p>All content on JobWinResume — including text, design, logos, and code — is the property of JobWinResume and protected under Indian copyright law. You may not copy or redistribute our content without written permission.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>7. Third-Party Job Platforms</h2>
            <p>JobWinResume aggregates job listings from third-party platforms. We are not responsible for:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>The accuracy or availability of third-party job listings</li>
              <li>Actions taken by third-party employers or platforms</li>
              <li>Any transactions you enter into with third parties</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>8. Limitation of Liability</h2>
            <p>JobWinResume shall not be liable for:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Any direct or indirect loss arising from use of our platform</li>
              <li>Loss of employment opportunity</li>
              <li>Technical errors, downtime, or data loss</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>9. Account Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these Terms, without prior notice.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>10. Governing Law</h2>
            <p>These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Maharashtra.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>11. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of JobWinResume after changes means you accept the updated Terms.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>12. Legal Entity &amp; Contact Information</h2>
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
