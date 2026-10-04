import { useState } from "react";
import { useTheme, THEMES } from "../lib/contexts";

export default function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme(); // wait, earlier it was setThemeName, now it's setTheme from context
  const [hoveredTheme, setHoveredTheme] = useState(null);

  const themeList = [
    { key: "dark",     color: "#6C63FF", label: "🌙 Dark",     dotColor: "#6C63FF" },
    { key: "white",    color: "#6C63FF", label: "☀️ Light",    dotColor: "#e0e0e0" },
    { key: "colorful", color: "#FF6B6B", label: "🌈 Colorful", dotColor: "#FF6B6B" },
  ];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
      {themeList.map(t => (
        <div key={t.key} style={{ position: "relative" }}>
          {/* Tooltip */}
          {hoveredTheme === t.key && (
            <div style={{
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', sans-serif",
              pointerEvents: "none",
              zIndex: 9999,
              border: `1px solid ${t.color}55`,
              boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
            }}>
              {t.label}
              <div style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0, height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid rgba(0,0,0,0.9)",
              }} />
            </div>
          )}

          {/* Dot */}
          <div
            onClick={() => setTheme(t.key)}
            onMouseEnter={() => setHoveredTheme(t.key)}
            onMouseLeave={() => setHoveredTheme(null)}
            style={{
              width: themeName === t.key ? "16px" : "11px",
              height: themeName === t.key ? "16px" : "11px",
              borderRadius: "50%",
              background: t.dotColor,
              cursor: "pointer",
              transition: "all 0.25s ease",
              border: themeName === t.key ? "2.5px solid white" : "2px solid transparent",
              boxShadow: hoveredTheme === t.key
                ? `0 0 12px ${t.color}99, 0 0 4px ${t.color}66`
                : themeName === t.key
                ? `0 0 8px ${t.color}77`
                : "none",
              transform: hoveredTheme === t.key && themeName !== t.key
                ? "scale(1.4)"
                : "scale(1)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
