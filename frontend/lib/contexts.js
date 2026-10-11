import { createContext, useContext } from "react";

const DARK = {
  bg: "#09090f",    sidebar: "#0d0d16",              card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)", text: "#f0f0ff", muted: "rgba(255,255,255,0.45)",
  accent: "#6C63FF", accentB: "#ff6eb4",             inputBg: "rgba(255,255,255,0.05)",
  sub: "#8888aa",
};

const WHITE = {
  bg: "#f4f6fb",    sidebar: "#ffffff",              card: "rgba(0,0,0,0.025)",
  border: "rgba(0,0,0,0.09)",       text: "#1a1a2e", muted: "rgba(0,0,0,0.45)",
  accent: "#6C63FF", accentB: "#e8559a",             inputBg: "rgba(0,0,0,0.04)",
  sub: "#5555aa",
};

const COLORFUL = {
  bg: "#0f0c29",    sidebar: "#1a1744",              card: "rgba(255,107,107,0.07)",
  border: "rgba(255,120,80,0.18)",  text: "#fff8f0", muted: "rgba(255,220,200,0.5)",
  accent: "#FF6B6B", accentB: "#4ecdc4",             inputBg: "rgba(255,107,107,0.07)",
  sub: "#cc7060",
};

// ── ACTIVE THEMES (3 only — shown in UI) ─────────────────────────────────────
export const THEMES = {
  dark: DARK,
  white: WHITE,
  colorful: COLORFUL,
  // ── LEGACY — alias to active 3 themes ─────
  nocturnal: DARK,
  midnight:  DARK,
  ocean:     DARK,
  pristine:  WHITE,
  ivory:     WHITE,
  parchment: WHITE,
  vivid:     COLORFUL,
  emerald:   COLORFUL,
};

// Migrate old localStorage key names to new names
export const THEME_MIGRATION = { nocturnal: "dark", pristine: "white", vivid: "colorful", midnight: "dark", emerald: "colorful", ivory: "white", parchment: "white", ocean: "dark" };

// The 3 themes shown in the UI
export const ACTIVE_THEMES = [
  { key: "dark",     label: "Dark",     dot: "#6C63FF" },
  { key: "white",    label: "Light",    dot: "#e0e0e0" },
  { key: "colorful", label: "Colorful", dot: "#FF6B6B" },
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
