"use client";
import { useEffect, useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContext } from "@/app/layout";

export default function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useContext(ToastContext);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const paymentIntentId = searchParams.get("payment_intent");
    
    if (!paymentIntentId) {
      showToast("Error: No se encontró el pago");
      router.replace("/home/premium");
      return;
    }

    // Verificar el pago en el backend
    fetch("/api/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("¡Pago exitoso! Ahora eres Premium 🎉");
          setTimeout(() => router.replace("/home/start"), 2000);
        } else {
          showToast("Error al verificar el pago");
          router.replace("/home/premium");
        }
      })
      .catch(() => {
        showToast("Error al verificar el pago");
        router.replace("/home/premium");
      })
      .finally(() => {
        setVerifying(false);
      });
  }, [searchParams, router, showToast]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec, #fff, #f3e5f5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 60,
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
          textAlign: "center",
          maxWidth: 400,
        }}
      >
        {verifying ? (
          <>
            <div
              style={{
                width: 80,
                height: 80,
                margin: "0 auto",
                border: "8px solid var(--clr-grey-200)",
                borderTop: "8px solid var(--clr-pink-accent)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 30,
                color: "var(--clr-grey-900)",
              }}
            >
              Verificando pago...
            </h1>
            <p style={{ color: "var(--clr-grey-600)", marginTop: 10 }}>
              Por favor espera un momento
            </p>
          </>
        ) : (
          <>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 50,
              }}
            >
              ✓
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                marginTop: 30,
                color: "var(--clr-grey-900)",
              }}
            >
              ¡Pago exitoso!
            </h1>
            <p style={{ color: "var(--clr-grey-600)", marginTop: 10 }}>
              Redirigiendo...
            </p>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
