"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

const OPTIONS = [
  { label: "Relacion seria",          emoji: "💑" },
  { label: "Diversion/Corto plazo",   emoji: "🎉" },
  { label: "Hacer tarea juntos",      emoji: "📚" },
  { label: "Contactos/Negocios",      emoji: "🤝" },
  { label: "Amigos",                  emoji: "👋" },
  { label: "Lo sigo pensando",        emoji: "🤔" },
];

export default function LookingForPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "30px 0 10px" }}>¿Qué estás buscando?</h1>
        <p style={{ fontSize: 14, color: "var(--clr-black-54)", margin: "0 0 30px", lineHeight: 1.4 }}>
          Todo está bien, si cambia hay para todos.
        </p>

        <div className="interest-grid">
          {OPTIONS.map((o) => (
            <button key={o.label} className={`interest-card ${selected === o.label ? "selected" : ""}`} onClick={() => setSelected(o.label)}>
              <span className="ic-emoji">{o.emoji}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${selected ? "btn-black" : "btn-grey"}`}
          disabled={!selected}
          onClick={() => { setData((p) => ({ ...p, lookingFor: selected! })); router.push("/auth/register/habits"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
