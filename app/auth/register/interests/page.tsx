"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

const OPTIONS = ["Hombres", "Mujeres", "Todxs"];

export default function InterestsPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "30px 0 10px" }}>¿A quién te interesaría ver?</h1>
        <p style={{ fontSize: 14, color: "var(--clr-black-54)", margin: "0 0 30px", lineHeight: 1.4 }}>
          Selecciona todas las que apliquen para ayudarnos a recomendarte a las personas correctas.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {OPTIONS.map((o) => (
            <button key={o} className={`option-pill ${selected === o ? "selected" : ""}`} onClick={() => setSelected(o)}>
              {o}
            </button>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${selected ? "btn-black" : "btn-grey"}`}
          disabled={!selected}
          onClick={() => { setData((p) => ({ ...p, interest: selected! })); router.push("/auth/register/looking-for"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
