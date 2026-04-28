import { createContext, useContext } from "react";

// ── SINGLE SOURCE OF TRUTH FOR ALL THEMES ────────────────────────────────────
export const THEMES = {
  nocturnal: {
    bg: "#09090f", sidebar: "#0d0d16", card: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)", text: "#f0f0ff", muted: "rgba(255,255,255,0.45)",
    accent: "#6C63FF", inputBg: "rgba(255,255,255,0.05)", sub: "#8888aa",
    accentB: "#ff6eb4",
  },
  pristine: {
    bg: "#f4f4ff", sidebar: "#ffffff", card: "rgba(0,0,0,0.02)",
    border: "rgba(0,0,0,0.08)", text: "#1a1a2e", muted: "rgba(0,0,0,0.45)",
    accent: "#6C63FF", inputBg: "rgba(0,0,0,0.03)", sub: "#5555aa",
    accentB: "#e8559a",
  },
  midnight: {
    bg: "#010108", sidebar: "#05050f", card: "rgba(255,255,255,0.02)",
    border: "rgba(108,99,255,0.15)", text: "#c8c8ff", muted: "rgba(200,200,255,0.4)",
    accent: "#8B83FF", inputBg: "rgba(108,99,255,0.06)", sub: "#7070a0",
    accentB: "#f558b0",
  },
  emerald: {
    bg: "#030f0a", sidebar: "#041208", card: "rgba(67,217,162,0.04)",
    border: "rgba(67,217,162,0.12)", text: "#e0fff4", muted: "rgba(200,255,230,0.4)",
    accent: "#43D9A2", inputBg: "rgba(67,217,162,0.05)", sub: "#60a080",
    accentB: "#cc2e8a",
  },
  ivory: {
    bg: "#fdfbf7", sidebar: "#ffffff", card: "rgba(0,0,0,0.02)",
    border: "rgba(0,0,0,0.06)", text: "#2c2c2c", muted: "rgba(0,0,0,0.45)",
    accent: "#6C63FF", inputBg: "rgba(0,0,0,0.03)", sub: "#5555aa",
    accentB: "#e8559a",
  },
  parchment: {
    bg: "#f4ecd8", sidebar: "#ede3c5", card: "rgba(0,0,0,0.03)",
    border: "rgba(139,121,94,0.15)", text: "#4a3728", muted: "rgba(74,55,40,0.5)",
    accent: "#8b4513", inputBg: "rgba(0,0,0,0.03)", sub: "#7b5e3a",
    accentB: "#a0522d",
  },
};

// ── PLAN LIMITS ───────────────────────────────────────────────────────────────
// 🚧 DEV MODE: All features unlocked — restore per-plan limits before launch
export const PLAN_LIMITS = {
  free:     { resumes: 1,        searches: 3,        templates: 5,   apply: false, interview: false, atsOptimise: false, hrFinder: false, label: "Free"     },
  basic:    { resumes: Infinity, searches: 10,       templates: 14,  apply: false, interview: false, atsOptimise: true,  hrFinder: false, label: "Basic"    },
  standard: { resumes: Infinity, searches: Infinity, templates: 999, apply: true,  interview: true,  atsOptimise: true,  hrFinder: true,  label: "Standard" },
  premium:  { resumes: Infinity, searches: Infinity, templates: 999, apply: true,  interview: true,  atsOptimise: true,  hrFinder: true,  label: "Premium"  },
};

// Feature keys users can check against
export const FEATURES = {
  interview:    p => PLAN_LIMITS[p]?.interview    ?? true,
  apply:        p => PLAN_LIMITS[p]?.apply        ?? true,
  atsOptimise:  p => PLAN_LIMITS[p]?.atsOptimise  ?? true,
  hrFinder:     p => PLAN_LIMITS[p]?.hrFinder     ?? true,
  resumeCount:  p => PLAN_LIMITS[p]?.resumes      ?? Infinity,
  searchCount:  p => PLAN_LIMITS[p]?.searches     ?? Infinity,
  templateCount:p => PLAN_LIMITS[p]?.templates    ?? Infinity,
};

// ── CONTEXTS ──────────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: THEMES.nocturnal, themeName: "nocturnal", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export const PlanContext = createContext({ plan: "free", limits: PLAN_LIMITS.free, canAccess: () => false, loadingPlan: true, refreshPlan: () => {} });
export const usePlan = () => useContext(PlanContext);
