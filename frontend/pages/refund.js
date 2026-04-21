import Head from "next/head";
import { useRouter } from "next/router";

export default function Refund() {
  const router = useRouter();

  return (
    <div style={{ background: "#0a0a1a", color: "white", minHeight: "100vh", fontFamily: "'DM Sans', Arial, sans-serif" }}>
      <Head>
        <title>Refund & Cancellation Policy | JobwinResume</title>
      </Head>
      <nav style={{ padding: "20px 60px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", background: "rgba(10,10,26,0.92)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => router.push("/")}>
          <span style={{ fontSize: "22px" }}>🚀</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: "700", color: "white" }}>JobwinResume<span style={{ color: "#6C63FF" }}>.pro</span></span>
        </div>
      </nav>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "36px", fontWeight: "700", marginBottom: "20px" }}>Refund & Cancellation Policy</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>Effective Date: 30 March 2026</p>

        <div style={{ lineHeight: "1.8", color: "rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", gap: "32px" }}>
          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>1. Overview</h2>
            <p>This policy applies to all paid services on JobWinResume including job search plans, resume builder, and interview preparation content.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>2. Subscription / Plan Cancellation</h2>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>You may cancel your subscription at any time from your account settings</li>
              <li>After cancellation, you will continue to have access to paid features until the end of your current billing period</li>
              <li>We do not provide partial refunds for unused days in a billing cycle</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>3. Refund Eligibility</h2>
            
            <div style={{ overflowX: "auto", marginTop: "16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(255,255,255,0.03)", borderRadius: "8px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(108,99,255,0.15)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Situation</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>Refund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Service not delivered after payment</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#43D9A2" }}>✅ Full Refund</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Technical error / double charge</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#43D9A2" }}>✅ Full Refund</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Changed mind after purchase</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#FF6584" }}>❌ Not Eligible</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Partial use of subscription</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#FF6584" }}>❌ Not Eligible</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>Dissatisfied with job search results*</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#FF6584" }}>❌ Not Eligible</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p style={{ marginTop: "16px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
              *JobWinResume provides tools, not job guarantees. Refunds are not provided based on job search outcomes.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>4. How to Request a Refund</h2>
            <p>If you believe you are eligible for a refund:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Email us at <a href="mailto:support@jobwinresume.pro" style={{ color: "#6C63FF", textDecoration: "none" }}>support@jobwinresume.pro</a> within 7 days of the transaction</li>
              <li>Use subject line: <strong>"Refund Request - [Your Registered Email]"</strong></li>
              <li>Include your transaction ID and reason for the request</li>
            </ul>
            <p style={{ marginTop: "12px" }}>We will review and respond within 5–7 business days.</p>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>5. Refund Processing</h2>
            <ul style={{ marginLeft: "24px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Approved refunds will be credited back to your original payment method</li>
              <li>Processing time: 7–10 business days after approval</li>
              <li>Bank processing times may vary</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>6. Non-Refundable Items</h2>
            <p>The following are strictly non-refundable:</p>
            <ul style={{ marginLeft: "24px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Downloaded or generated resume files</li>
              <li>Accessed interview preparation content</li>
              <li>Any promotional or discounted plans</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>7. Dispute Resolution</h2>
            <p>If you are unsatisfied with our refund decision, you may raise a dispute with your bank or payment provider. We encourage you to contact us first — we are happy to resolve issues fairly.</p>
          </section>
          <section>
            <h2 style={{ fontSize: "20px", color: "#6C63FF", marginBottom: "12px" }}>8. Legal Entity &amp; Contact</h2>
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
