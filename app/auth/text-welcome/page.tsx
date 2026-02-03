"use client";
import { useRouter } from "next/navigation";

const rules = [
  { title: "No finjas ser alguien más",  body: "Asegúrate de que tus fotos, edad y biografía correspondan con quien eres actualmente." },
  { title: "Cuídate",                    body: "No des tu información personal demasiado pronto." },
  { title: "Tómalo con calma",           body: "Respeta a las demás personas y trátala como te gustaría que te trataran." },
  { title: "Toma la iniciativa",         body: "Siempre denuncia el mal comportamiento." },
];

export default function TextWelcomePage() {
  const router = useRouter();

  return (
    <div className="mobile-shell" style={{ background: "#fff" }}>

      {/* Scrollable body */}
      <div className="scroll-body">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <h1 style={{ textAlign: "center", fontSize: 20, fontWeight: 600, margin: "30px 0" }}>
          Te damos la bienvenida a ConectaTec
        </h1>

        <p style={{ fontSize: 12, color: "var(--clr-black)", marginBottom: 20 }}>Por favor, sigue estas normas</p>

        {rules.map((r) => (
          <div key={r.title} style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>{r.title}</p>
            <p style={{ fontSize: 13, margin: 0, color: "var(--clr-black)", lineHeight: 1.5 }}>{r.body}</p>
          </div>
        ))}
      </div>

      {/* Fixed bottom CTA */}
      <div className="bottom-bar">
        <button className="btn-primary btn-black" onClick={() => router.push("/auth/register/name")}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
