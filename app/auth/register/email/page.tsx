"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

export default function EmailPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [email, setEmail] = useState("");

  const ok = email.trim().length > 0;

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "30px 0 20px" }}>Ahora tu correo electrónico</h1>

        <input
          className="input-field"
          type="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <p style={{ fontSize: 13, marginTop: 20, color: "var(--clr-black)", lineHeight: 1.5 }}>
          Asegúrate de ingresar correctamente tu correo electrónico, ya que no podrá ser cambiado más adelante
        </p>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ok ? "btn-black" : "btn-grey"}`}
          disabled={!ok}
          onClick={() => { setData((p) => ({ ...p, email: email.trim() })); router.push("/auth/register/gender"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
