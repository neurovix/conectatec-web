"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

export default function NamePage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [name, setName] = useState("");

  const ok = name.trim().length > 0;

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "30px 0 20px" }}>Ahora tu nombre</h1>

        <input
          className="input-field"
          type="text"
          autoComplete="off"
          placeholder="Ingresa tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p style={{ fontSize: 13, marginTop: 10, color: "var(--clr-black)" }}>Así es como aparecerá en tu perfil</p>
        <p style={{ fontSize: 13, margin: "0", fontWeight: 700, color: "var(--clr-black)" }}>No lo podrás cambiar después (solo PREMIUM)</p>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => { setData((p) => ({ ...p, name: name.trim() })); router.push("/auth/register/email"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
