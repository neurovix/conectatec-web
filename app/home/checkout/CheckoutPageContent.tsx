"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";
import { ToastContext } from "@/app/layout";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useContext(ToastContext);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  const plan = searchParams.get("plan") || "Mensual";
  const price = searchParams.get("price") || "59.99 MXN";

  useEffect(() => {
    // Crear el PaymentIntent
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          showToast("Error al iniciar el pago");
          router.back();
        }
      })
      .catch(() => {
        showToast("Error al conectar con Stripe");
        router.back();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [plan, router, showToast]);

  const appearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#ff6b9d",
      colorBackground: "#ffffff",
      colorText: "#1a1a1a",
      colorDanger: "#df1b41",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "12px",
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec, #fff, #f3e5f5)",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Back button */}
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
            marginBottom: 20,
          }}
        >
          ←
        </button>

        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 30,
            boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
            marginBottom: 20,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                marginBottom: 20,
              }}
            >
              👑
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                background:
                  "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {plan}
            </h1>
            <p style={{ fontSize: 18, color: "var(--clr-grey-700)", margin: "10px 0 0" }}>
              {price}
            </p>
          </div>
        </div>

        {/* Stripe Elements */}
        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 60,
              boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                margin: "0 auto",
                border: "4px solid var(--clr-grey-200)",
                borderTop: "4px solid var(--clr-pink-accent)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ marginTop: 20, color: "var(--clr-grey-600)" }}>
              Cargando...
            </p>
          </div>
        ) : clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance }}
          >
            <CheckoutForm plan={plan} />
          </Elements>
        ) : null}

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
