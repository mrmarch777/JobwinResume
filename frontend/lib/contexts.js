import { createContext, useContext } from "react";

// ── ACTIVE THEMES (3 only — shown in UI) ─────────────────────────────────────
export const THEMES = {
  dark: {
    bg: "#09090f",    sidebar: "#0d0d16",              card: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)", text: "#f0f0ff", muted: "rgba(255,255,255,0.45)",
    accent: "#6C63FF", accentB: "#ff6eb4",             inputBg: "rgba(255,255,255,0.05)",
    sub: "#8888aa",
  },
  white: {
    bg: "#f4f6fb",    sidebar: "#ffffff",              card: "rgba(0,0,0,0.025)",
    border: "rgba(0,0,0,0.09)",       text: "#1a1a2e", muted: "rgba(0,0,0,0.45)",
    accent: "#6C63FF", accentB: "#e8559a",             inputBg: "rgba(0,0,0,0.04)",
    sub: "#5555aa",
  },
  colorful: {
    bg: "#0f0c29",    sidebar: "#1a1744",              card: "rgba(255,107,107,0.07)",
    border: "rgba(255,120,80,0.18)",  text: "#fff8f0", muted: "rgba(255,220,200,0.5)",
    accent: "#FF6B6B", accentB: "#4ecdc4",             inputBg: "rgba(255,107,107,0.07)",
    sub: "#cc7060",
  },
  // ── LEGACY — kept in code for backward compatibility, NOT shown in UI ─────
  nocturnal: { bg: "#09090f", sidebar: "#0d0d16", card: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.08)", text: "#f0f0ff", muted: "rgba(255,255,255,0.45)", accent: "#6C63FF", accentB: "#ff6eb4", inputBg: "rgba(255,255,255,0.05)", sub: "#8888aa" },
  pristine:  { bg: "#f4f6fb", sidebar: "#ffffff",  card: "rgba(0,0,0,0.02)",       border: "rgba(0,0,0,0.08)",       text: "#1a1a2e", muted: "rgba(0,0,0,0.45)",       accent: "#6C63FF", accentB: "#e8559a",  inputBg: "rgba(0,0,0,0.03)",       sub: "#5555aa" },
  vivid:     { bg: "#0f0c29", sidebar: "#1a1744",  card: "rgba(255,107,107,0.07)", border: "rgba(255,120,80,0.18)", text: "#fff8f0", muted: "rgba(255,220,200,0.5)",   accent: "#FF6B6B", accentB: "#4ecdc4",  inputBg: "rgba(255,107,107,0.07)", sub: "#cc7060" },
  midnight:  { bg: "#010108", sidebar: "#05050f",  card: "rgba(255,255,255,0.02)", border: "rgba(108,99,255,0.15)", text: "#c8c8ff", muted: "rgba(200,200,255,0.4)",   accent: "#8B83FF", accentB: "#f558b0",  inputBg: "rgba(108,99,255,0.06)", sub: "#7070a0" },
  emerald:   { bg: "#030f0a", sidebar: "#041208",  card: "rgba(67,217,162,0.04)",  border: "rgba(67,217,162,0.12)", text: "#e0fff4", muted: "rgba(200,255,230,0.4)",   accent: "#43D9A2", accentB: "#cc2e8a",  inputBg: "rgba(67,217,162,0.05)", sub: "#60a080" },
  ivory:     { bg: "#fdfbf7", sidebar: "#ffffff",  card: "rgba(0,0,0,0.02)",       border: "rgba(0,0,0,0.06)",       text: "#2c2c2c", muted: "rgba(0,0,0,0.45)",       accent: "#6C63FF", accentB: "#e8559a",  inputBg: "rgba(0,0,0,0.03)",       sub: "#5555aa" },
  parchment: { bg: "#f4ecd8", sidebar: "#ede3c5",  card: "rgba(0,0,0,0.03)",       border: "rgba(139,121,94,0.15)", text: "#4a3728", muted: "rgba(74,55,40,0.5)",     accent: "#8b4513", accentB: "#a0522d",  inputBg: "rgba(0,0,0,0.03)",       sub: "#7b5e3a" },
};

// Migrate old localStorage key names to new names
export const THEME_MIGRATION = { nocturnal: "dark", pristine: "white", vivid: "colorful", midnight: "dark", emerald: "colorful", ivory: "white", parchment: "white" };

// The 3 themes shown in the UI
export const ACTIVE_THEMES = [
  { key: "dark",     label: "🌙 Dark",     dot: "#6C63FF" },
  { key: "white",    label: "☀️ Light",    dot: "#6C63FF" },
  { key: "colorful", label: "🌈 Colorful", dot: "#FF6B6B" },
];

// ── PLAN LIMITS ───────────────────────────────────────────────────────────────
const isDevMode = true;
export const PLAN_LIMITS = {
  free:     { resumes: 1,        searches: 3,        templates: 5,   apply: false, interview: false, atsOptimise: false, hrFinder: false, label: "Free"     },
  basic:    { resumes: Infinity, searches: 10,       templates: 14,  apply: false, interview: false, atsOptimise: true,  hrFinder: false, label: "Basic"    },
  standard: { resumes: Infinity, searches: Infinity, templates: 999, apply: true,  interview: true,  atsOptimise: true,  hrFinder: true,  label: "Standard" },
  premium:  { resumes: Infinity, searches: Infinity, templates: 999, apply: true,  interview: true,  atsOptimise: true,  hrFinder: true,  label: "Premium"  },
};

export const FEATURES = {
  interview:    p => isDevMode || (PLAN_LIMITS[p]?.interview    ?? true),
  apply:        p => isDevMode || (PLAN_LIMITS[p]?.apply        ?? true),
  atsOptimise:  p => isDevMode || (PLAN_LIMITS[p]?.atsOptimise  ?? true),
  hrFinder:     p => isDevMode || (PLAN_LIMITS[p]?.hrFinder     ?? true),
  resumeCount:  p => isDevMode ? Infinity : (PLAN_LIMITS[p]?.resumes      ?? Infinity),
  searchCount:  p => isDevMode ? Infinity : (PLAN_LIMITS[p]?.searches     ?? Infinity),
  templateCount:p => isDevMode ? Infinity : (PLAN_LIMITS[p]?.templates    ?? Infinity),
};

export const ThemeContext = createContext({ theme: THEMES.dark, themeName: "dark", setTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

export const PlanContext = createContext({ plan: "free", limits: PLAN_LIMITS.free, canAccess: () => false, loadingPlan: true, refreshPlan: () => {} });
export const usePlan = () => useContext(PlanContext);
