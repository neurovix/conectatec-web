"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

export default function DescriptionPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [desc, setDesc] = useState("");

  const ok = desc.trim().length > 0;

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "30px 0 20px" }}>Ahora tu descripción</h1>

        <textarea
          className="input-outlined"
          rows={4}
          placeholder="Ingresa tu descripción"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={{ resize: "vertical", minHeight: 120 }}
        />

        <p style={{ fontSize: 13, marginTop: 10, color: "var(--clr-black)" }}>Así es como aparecerá en tu perfil</p>
        <p style={{ fontSize: 13, margin: "0", fontWeight: 700, color: "var(--clr-black)" }}>
          No lo podrás cambiar después (Solamente si eres PREMIUM)
        </p>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => { setData((p) => ({ ...p, description: desc.trim() })); router.push("/auth/register/photos"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
