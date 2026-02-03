"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/utils/registerContext";

export default function InstagramPage() {
  const router  = useRouter();
  const { setData } = useRegister();
  const [ig, setIg] = useState("");

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "30px 0 20px" }}>
          ¿Puedes darnos tu usuario de Instagram?
        </h1>

        <input
          className="input-field"
          type="text"
          autoComplete="off"
          placeholder="Ingresa tu usuario de Instagram"
          value={ig}
          onChange={(e) => setIg(e.target.value)}
        />

        <p style={{ fontSize: 13, marginTop: 40, color: "var(--clr-black)", lineHeight: 1.5 }}>
          Tu usuario de Instagram se mostrará solamente cuando tú y la otra persona hagan match, para que puedan
          continuar con la conversación desde fuera. Si alguien te da like y tú no respondes con la misma acción,
          tu Instagram no será visible para la otra persona.
        </p>
      </div>

      <div className="bottom-bar">
        <button
          className={`btn-primary ${ig.trim() ? "btn-black" : "btn-grey"}`}
          disabled={!ig.trim()}
          onClick={() => { setData((p) => ({ ...p, instagramUser: ig.trim() })); router.push("/auth/register/password"); }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
