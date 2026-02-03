"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

const DEGREES = [
  "Ingenieria en Sistemas Computacionales",
  "Ingenieria Electrica",
  "Ingenieria Electronica",
  "Ingenieria Industrial",
  "Ingenieria Mecanica",
  "Ingenieria Mecatronica",
  "Ingenieria Materiales",
  "Ingenieria en Gestion Empresarial",
  "Otra",
];

export default function DegreePage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom]     = useState("");

  const ok = selected !== null && !(selected === "Otra" && custom.trim() === "");

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "30px 0 10px" }}>¿En qué carrera estás?</h1>
        <p style={{ fontSize: 14, color: "var(--clr-black-54)", margin: "0 0 30px", lineHeight: 1.4 }}>
          Ayúdanos diciendo en qué carrera estás, así será más fácil recomendarte a otras personas.
        </p>

        <div className="degree-list">
          {DEGREES.map((d) => (
            <button key={d} className={`option-pill ${selected === d ? "selected" : ""}`} onClick={() => setSelected(d)}>
              {d}
            </button>
          ))}
        </div>

        {selected === "Otra" && (
          <input
            className="input-outlined"
            type="text"
            placeholder="Escribe el nombre de tu carrera"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            style={{ marginTop: 15 }}
          />
        )}
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => {
            setData((p) => ({
              ...p,
              degree: selected!,
              customDegree: selected === "Otra" ? custom.trim() : undefined,
            }));
            router.push("/auth/register/interests");
          }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
