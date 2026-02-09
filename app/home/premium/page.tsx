"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  function handleSubscribe(plan: "Semanal" | "Mensual" | "Semestral", price: string) {
    setProcessing(true);
    // Redirigir a la página de checkout con los parámetros del plan
    router.push(`/home/checkout?plan=${plan}&price=${price}`);
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "linear-gradient(135deg, #fce4ec, #fff, #f3e5f5)", paddingBottom: 100 }}>
      <div style={{ padding: 20 }}>
        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          ←
        </button>

        <div style={{ textAlign: "center", marginTop: 30 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 50,
              boxShadow: "0 10px 20px rgba(255,107,107,0.3)",
            }}
          >
            👑
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: "20px 0 0" }}>Beneficios de volverte</h1>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: "0", background: "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>
            PREMIUM
          </h2>
        </div>

        {/* Benefits table */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", marginTop: 40, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ padding: "16px 20px", background: "linear-gradient(135deg, #fce4ec, #f3e5f5)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 15, fontWeight: 700 }}>
            <span>Beneficio</span>
            <span style={{ textAlign: "center" }}>Normal</span>
            <span style={{ textAlign: "center", color: "var(--clr-pink-accent)" }}>Premium</span>
          </div>
          {[
            { label: "🔥 Likes diarios", normal: "30", premium: "Ilimitados" },
            { label: "💖 Ver a quién le gustas", normal: "❌", premium: "✅" },
            { label: "✏️ Editar perfil", normal: "❌", premium: "✅" },
            { label: "🙈 Alerta de match", normal: "❌", premium: "✅" },
          ].map((b, i) => (
            <div key={i}>
              <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 15 }}>
                <span style={{ fontWeight: 500 }}>{b.label}</span>
                <span style={{ textAlign: "center", color: "var(--clr-grey-700)" }}>{b.normal}</span>
                <span style={{ textAlign: "center", fontWeight: 700, color: "var(--clr-pink-accent)" }}>{b.premium}</span>
              </div>
              {i < 3 && <div style={{ height: 1, background: "var(--clr-grey-200)", margin: "0 20px" }} />}
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 20, marginTop: 30, boxShadow: "0 10px 20px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { title: "Semanal", days: "7 dias", price: "19.99 MXN" },
            { title: "Mensual", days: "30 dias", price: "59.99 MXN" },
            { title: "Semestral", days: "180 dias", price: "99.99 MXN" },
          ].map((p) => (
            <div key={p.title} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{p.title}</p>
              <p style={{ fontSize: 12, color: "var(--clr-grey-600)", margin: "4px 0 8px" }}>{p.days}</p>
              <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>{p.price}</p>
              <button
                onClick={() => handleSubscribe(p.title as any, p.price)}
                disabled={processing}
                style={{
                  width: "100%",
                  height: 60,
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: processing ? "not-allowed" : "pointer",
                  boxShadow: "0 10px 20px rgba(255,107,107,0.4)",
                }}
              >
                💳 Pagar
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: "var(--clr-grey-600)", textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          Al suscribirte, aceptas nuestros <a href="https://neurovix.com.mx/apps/conectatec/eula" style={{ color: "var(--clr-pink)" }}>Términos y Condiciones (EULA)</a> y{" "}
          <a href="https://neurovix.com.mx/apps/conectatec/privacy_policy" style={{ color: "var(--clr-pink)" }}>Política de Privacidad</a>.
        </p>
      </div>
    </div>
  );
}
