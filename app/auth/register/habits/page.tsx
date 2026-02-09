"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

const HABITS = [
  "Siempre escuchando musica", "Gym", "Amigable", "Coffe lover",
  "Extrovertido", "Procrastinador", "Organizado", "Team nocturno",
  "Introvertido", "Fan del descanso", "Team madrugador", "Foraneo",
  "Todo el dia en el tec", "Me quedo a actividades", "Ingeniero",
  "Busco ride", "Recursando", "Sin dinero", "Entro a todas las clases",
];

export default function HabitsPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (h: string) =>
    setSelected((prev) => (prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]));

  const ok = selected.length >= 4;

  return (
    <div className="mobile-shell" style={{ background: "#fff", paddingBottom: 50 }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "30px 0 10px", lineHeight: 1.2 }}>
          Hablemos sobre hábitos<br/>de tu estilo de vida
        </h1>
        <p style={{ fontSize: 14, color: "var(--clr-black-54)", margin: "0 0 25px" }}>Selecciona mínimo 4</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {HABITS.map((h) => (
            <button key={h} className={`habit-tag ${selected.includes(h) ? "selected" : ""}`} onClick={() => toggle(h)}>
              {h}
            </button>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => { setData((p) => ({ ...p, habits: selected })); router.push("/auth/register/description"); }}
        >
          Siguiente {selected.length}/4
        </button>
      </div>
    </div>
  );
}
