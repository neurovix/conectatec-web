"use client";
import { useState, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ToastContext } from "@/app/layout";

interface CheckoutFormProps {
  plan: string;
}

export default function CheckoutForm({ plan }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const showToast = useContext(ToastContext);
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    try {
      // Confirmar el pago
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || "Error al procesar el pago");
        setProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/home/checkout/success?plan=${plan}`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Error al procesar el pago");
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Verificar el pago en el backend
        const verifyResponse = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.success) {
          showToast("¡Pago exitoso! Ahora eres Premium 🎉");
          setTimeout(() => router.replace("/home/start"), 1500);
        } else {
          setErrorMessage("Error al verificar el pago");
          setProcessing(false);
        }
      }
    } catch (err) {
      setErrorMessage("Error inesperado al procesar el pago");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 30,
          boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            marginBottom: 20,
            color: "var(--clr-grey-900)",
          }}
        >
          Información de pago
        </h2>

        <PaymentElement />

        {errorMessage && (
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: "#fee",
              border: "1px solid #fcc",
              borderRadius: 12,
              color: "#c00",
              fontSize: 14,
            }}
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            width: "100%",
            height: 56,
            marginTop: 20,
            borderRadius: 16,
            border: "none",
            background: processing
              ? "var(--clr-grey-400)"
              : "linear-gradient(135deg, var(--clr-pink-accent), var(--clr-purple-accent))",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: processing ? "not-allowed" : "pointer",
            boxShadow: processing
              ? "none"
              : "0 10px 20px rgba(255,107,107,0.4)",
            transition: "all 0.3s ease",
          }}
        >
          {processing ? "Procesando..." : "💳 Pagar ahora"}
        </button>

        <p
          style={{
            fontSize: 12,
            color: "var(--clr-grey-600)",
            textAlign: "center",
            marginTop: 15,
            lineHeight: 1.5,
          }}
        >
          Tu pago está protegido por Stripe. Al continuar, aceptas nuestros{" "}
          <a
            href="https://neurovix.com.mx/apps/conectatec/eula"
            style={{ color: "var(--clr-pink)" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Términos y Condiciones
          </a>
          .
        </p>
      </div>
    </form>
  );
}
