import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/contexts";

// Pages that should show the global footer
const PUBLIC_PAGES = ["/", "/login", "/signup", "/about", "/terms", "/privacy", "/refund", "/jobs", "/find-job"];
// Pages where we add footer inside the page flow (dashboard pages already have their own sidebar/layout)
const DASHBOARD_PAGES = ["/dashboard", "/tracker", "/resume", "/apply", "/interview", "/pricing", "/payment-success", "/find-job", "/resume-ai", "/resume-create", "/resume-tailor"];

export default function Layout({ children }) {
  const { theme } = useTheme();
  const router = useRouter();
  const isPublicPage = PUBLIC_PAGES.includes(router.pathname);
  const isDashboardPage = DASHBOARD_PAGES.includes(router.pathname);

  const globalFooter = (
    <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${theme.border || "rgba(255,255,255,0.06)"}`, background: "transparent", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap", fontSize: "12px", color: theme.muted || "rgba(255,255,255,0.4)" }}>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }} onClick={() => router.push('/about')}>About Us</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }} onClick={() => router.push('/terms')}>Terms & Conditions</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }} onClick={() => router.push('/privacy')}>Privacy Policy</span>
      <span style={{ cursor: "pointer", transition: "color 0.2s" }} onClick={() => router.push('/refund')}>Refund & Cancellation Policy</span>
      <span>© 2026 JobWinResume • Amar Maruti Khot</span>
    </div>
  );

  // Public pages — wrap with footer
  if (isPublicPage) {
    return (
      <div style={{ background: theme.bg, color: theme.text, minHeight: "100vh", transition: "all 0.3s", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>{children}</div>
        {globalFooter}
      </div>
    );
  }

  // Dashboard pages — each page has its own Sidebar, just render children
  // (no duplicate sidebar/topbar from Layout)
  return (
    <>
      {children}
    </>
  );
}

