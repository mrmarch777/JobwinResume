import { useState } from "react";
import { useTheme, ACTIVE_THEMES } from "../lib/contexts";

export default function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      {ACTIVE_THEMES.map(t => (
        <div key={t.key} style={{ position: "relative" }}>
          {hovered === t.key && (
            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.88)", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 9999 }}>
              {t.label}
              <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid rgba(0,0,0,0.88)" }} />
            </div>
          )}
          <div
            onClick={() => setTheme(t.key)}
            onMouseEnter={() => setHovered(t.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: themeName === t.key ? "16px" : "11px",
              height: themeName === t.key ? "16px" : "11px",
              borderRadius: "50%",
              background: t.key === "white" ? "#c0c0cc" : t.dot,
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: themeName === t.key ? "2.5px solid white" : "2px solid transparent",
              boxShadow: themeName === t.key ? `0 0 8px ${t.dot}77` : hovered === t.key ? `0 0 10px ${t.dot}88` : "none",
              transform: hovered === t.key && themeName !== t.key ? "scale(1.45)" : "scale(1)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
