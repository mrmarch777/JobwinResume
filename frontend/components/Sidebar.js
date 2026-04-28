import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { useTheme, THEMES, usePlan, PLAN_LIMITS } from "../lib/contexts";

export default function Sidebar({ activeId, collapsed, setCollapsed, user }) {
  const router = useRouter();
  const { theme: t, themeName, setTheme } = useTheme();
  const { plan } = usePlan();
  const planLabel = PLAN_LIMITS[plan]?.label || "Free";

  const navItems = [
    { id: "home", icon: "⊞", label: "Home", href: "/dashboard" },
    { id: "resume", icon: "📄", label: "Resume Builder", href: "/resume" },
    { id: "tracker", icon: "📊", label: "Application Tracker", href: "/tracker" },
    { id: "cover", icon: "✉️", label: "Cover Letter Generator", href: "/apply" },
    { id: "interview", icon: "🎯", label: "Interview Prep", href: "/interview" },
    { id: "apply", icon: "📧", label: "One Click Apply", href: "/apply" },
    { id: "pricing", icon: "⚡", label: "Upgrade", href: "/pricing" },
  ];

  const handleNav = (item) => {
    router.push(item.href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const firstName = user?.email?.split("@")[0] || "";
  const initials = firstName.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="mobile-tab-bar">
        {navItems.slice(0, 5).map(item => (
          <div key={item.id} className={`mobile-tab-item ${activeId === item.id ? "active" : ""}`} onClick={() => handleNav(item)}>
            <span className="mobile-tab-icon" style={{ color: activeId === item.id ? t.accent : t.muted }}>{item.icon}</span>
            <span style={{ color: activeId === item.id ? t.accent : t.muted }}>{item.label.split(" ")[0]}</span>
          </div>
        ))}
      </nav>

      <aside className="mobile-hide no-print" style={{ 
        width: collapsed ? "72px" : "240px", 
        background: t.sidebar, 
        borderRight: `1px solid ${t.border}`, 
        display: "flex", 
        flexDirection: "column", 
        transition: "width 0.3s ease", 
        flexShrink: 0, 
        position: "fixed", 
        top: 0, 
        left: 0, 
        height: "100vh", 
        zIndex: 200, 
        overflow: "hidden" 
      }}>

        {/* Brand */}
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", minHeight: "68px" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>�</div>
              <span style={{ fontFamily: "'Noto Serif', serif", fontSize: "16px", fontWeight: "700", color: t.text }}>JobwinResume</span>
            </div>
          )}
          {collapsed && <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>📄</div>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.muted, cursor: "pointer", fontSize: "12px", padding: "6px 8px", borderRadius: "8px", flexShrink: 0, transition: "all 0.2s" }}>
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User profile */}
        {!collapsed && user && (
          <div style={{ padding: "16px 18px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "linear-gradient(135deg, #6C63FF, #FF6584)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", color: "white", flexShrink: 0 }}>{initials}</div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: t.text }}>{firstName}</div>
                <div style={{ fontSize: "11px", color: plan !== "free" ? "#43D9A2" : t.muted, fontWeight: plan !== "free" ? "600" : "400" }}>{planLabel} Plan</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {navItems.map((item) => (
            <div key={item.id} className="nav-item" onClick={() => handleNav(item)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px", 
                padding: collapsed ? "12px 16px" : "11px 14px", 
                borderRadius: "12px", 
                cursor: "pointer", 
                marginBottom: "3px", 
                transition: "all 0.2s", 
                background: activeId === item.id ? "rgba(108,99,255,0.12)" : "transparent", 
                color: activeId === item.id ? "#A29BFE" : t.muted, 
                borderLeft: activeId === item.id ? "3px solid #6C63FF" : "3px solid transparent", 
                justifyContent: collapsed ? "center" : "flex-start" 
              }}>
              <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ fontSize: "13px", fontWeight: activeId === item.id ? "600" : "400", whiteSpace: "nowrap" }}>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* Theme switcher */}
        {!collapsed && (
          <div style={{ padding: "12px 14px", borderTop: `1px solid ${t.border}` }}>
            <div style={{ fontSize: "10px", color: t.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Theme</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
              {Object.keys(THEMES).map(thm => (
                <button key={thm} className="theme-btn" onClick={() => setTheme(thm)}
                  style={{ 
                    padding: "6px 8px", 
                    background: themeName === thm ? "rgba(108,99,255,0.2)" : t.inputBg, 
                    border: `1px solid ${themeName === thm ? "rgba(108,99,255,0.4)" : t.border}`, 
                    borderRadius: "8px", 
                    color: themeName === thm ? "#A29BFE" : t.text, 
                    fontSize: "11px", 
                    cursor: "pointer", 
                    transition: "all 0.2s", 
                    fontFamily: "'DM Sans', sans-serif", 
                    textTransform: "capitalize" 
                  }}>
                  {thm}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <div style={{ padding: "8px 8px 16px", borderTop: `1px solid ${t.border}` }}>
          <div className="nav-item" onClick={handleLogout}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px", 
              padding: collapsed ? "12px 16px" : "11px 14px", 
              borderRadius: "12px", 
              cursor: "pointer", 
              color: t.muted, 
              transition: "all 0.2s", 
              justifyContent: collapsed ? "center" : "flex-start" 
            }}>
            <span style={{ fontSize: "16px" }}>🚪</span>
            {!collapsed && <span style={{ fontSize: "13px" }}>Logout</span>}
          </div>
        </div>
      </aside>
    </>
  );
}
