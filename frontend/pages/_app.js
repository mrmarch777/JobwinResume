import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabase";

import { 
  THEMES, 
  PLAN_LIMITS, 
  FEATURES, 
  ThemeContext, 
  PlanContext 
} from "../lib/contexts";

export default function App({ Component, pageProps }) {
  const [themeName, setThemeName] = useState("nocturnal");
  const [plan, setPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("jobwin_theme");
    if (saved && THEMES[saved]) setThemeName(saved);
  }, []);


  // Load user plan — Supabase is the AUTHORITATIVE source.
  const loadPlan = async () => {
    setLoadingPlan(true);
    const cached = localStorage.getItem("jobwin_plan");

    // Show cached plan instantly while Supabase loads
    if (cached && PLAN_LIMITS[cached]) setPlan(cached);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { 
        setLoadingPlan(false);
        // If no session, reset plan to free
        setPlan("free");
        localStorage.setItem("jobwin_plan", "free");
        return; 
      }
      
      const email = session.user.email;
      const { data, error } = await supabase
        .from("user_plans")
        .select("plan")
        .eq("email", email)
        .maybeSingle();
      
      if (data?.plan && PLAN_LIMITS[data.plan]) {
        setPlan(data.plan);
        localStorage.setItem("jobwin_plan", data.plan);
      } else {
        // NO PLAN FOUND in Supabase -> Force to FREE
        setPlan("free");
        localStorage.setItem("jobwin_plan", "free");
        
        // Optionally: Insert a "free" row if it's a first-time user
        // This ensures they are registered in the plan system
        if (!error && !data) {
          try { await supabase.from("user_plans").insert({ email, plan: "free" }); } catch (_) {}
        }
      }
    } catch (e) {
      console.warn("Supabase plan load failed:", e);
    }
    setLoadingPlan(false);
  };

  useEffect(() => {
    loadPlan();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        loadPlan();
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const setTheme = (name) => {
    if (!THEMES[name]) return;
    setThemeName(name);
    localStorage.setItem("jobwin_theme", name);
  };

  const theme = THEMES[themeName];
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const canAccess = (feature) => typeof FEATURES[feature] === "function" ? FEATURES[feature](plan) : false;

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme }}>
      <PlanContext.Provider value={{ plan, limits, canAccess, loadingPlan, refreshPlan: loadPlan }}>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,600&family=Noto+Serif:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
        </Head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Sans', Arial, sans-serif; transition: background 0.3s, color 0.3s; }
          input, textarea, select { color: ${theme.text} !important; }
          input::placeholder, textarea::placeholder { color: ${theme.muted} !important; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 4px; }
          select option { background: ${theme.sidebar}; color: ${theme.text}; }

          /* ── ANIMATIONS ── */
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(calc(-50% - 20px)); } }
          @keyframes textShine { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
          @keyframes scrollDown { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(12px); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes ctaPulse { 0% { box-shadow: 0 0 0 0 rgba(108,99,255,0.7); } 70% { box-shadow: 0 0 0 10px rgba(108,99,255,0); } 100% { box-shadow: 0 0 0 0 rgba(108,99,255,0); } }

          /* ── MOBILE RESPONSIVENESS OVERRIDES ── */
          .desktop-hide { display: none !important; }
          @media (max-width: 768px) {
            .desktop-hide { display: flex !important; }
            .mobile-hide { display: none !important; }
            .mobile-flex { display: flex !important; }
            .mobile-main { margin-left: 0 !important; width: 100% !important; padding-bottom: 70px !important; }
            .mobile-stack { flex-direction: column !important; }
            .mobile-grid-1 { grid-template-columns: 1fr !important; }
            .mobile-grid-2 { grid-template-columns: 1fr 1fr !important; }
            .mobile-grid-4 { grid-template-columns: repeat(4, 1fr) !important; }
            .mobile-card { padding: 18px 14px !important; border-radius: 18px !important; }
            .mobile-pad { padding: 16px !important; }
            .mobile-header { height: auto !important; padding: 12px 16px !important; flex-wrap: wrap !important; gap: 8px !important; }
            .mobile-text-sm { font-size: 13px !important; }
            .mobile-text-lg { font-size: 24px !important; line-height: 1.2 !important; }
            .mobile-actions { overflow-x: auto; padding-bottom: 8px; justify-content: flex-start !important; flex-wrap: nowrap !important; }
            
            /* Bottom Tab Bar */
            .mobile-tab-bar {
              position: fixed; bottom: 0; left: 0; right: 0; height: 64px;
              background: ${theme.sidebar}; border-top: 1px solid ${theme.border};
              display: flex !important; justify-content: space-around; alignItems: center;
              z-index: 9999; padding: 0 8px; backdrop-filter: blur(10px);
            }
            .mobile-tab-item {
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              flex: 1; height: 100%; color: ${theme.muted}; text-decoration: none; font-size: 10px; gap: 4px;
            }
            .mobile-tab-item.active { color: ${theme.accent}; font-weight: 600; }
            .mobile-tab-icon { font-size: 20px; }
          }
          @media (min-width: 769px) {
            .mobile-tab-bar { display: none !important; }
          }
        `}</style>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PlanContext.Provider>
    </ThemeContext.Provider>
  );
}

