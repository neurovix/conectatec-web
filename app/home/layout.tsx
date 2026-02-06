"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Layout for /home/* routes.
 * Provides persistent bottom navigation across all home sub-pages.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: "Inicio",   path: "/home/start",   icon: "🏠" },
    { label: "Matches",  path: "/home/matches", icon: "💖" },
    { label: "Likes",    path: "/home/likes",   icon: "👍" },
    { label: "Perfil",   path: "/home/profile", icon: "👤" },
  ];

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      {/* Main content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {children}
      </div>

      {/* Bottom tab bar (fixed) */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)", flexShrink: 0 }} /> {/* safe area spacer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "#fff",
          borderTop: "1px solid var(--clr-grey-200)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--clr-red-900)" : "var(--clr-grey-500)",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
