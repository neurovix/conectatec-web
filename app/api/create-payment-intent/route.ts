import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();

    // Verificar usuario autenticado
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Definir precios y duración según el plan
    const plans: Record<string, { amount: number; days: number }> = {
      Semanal: { amount: 1999, days: 7 },    // 19.99 MXN en centavos
      Mensual: { amount: 5999, days: 30 },   // 59.99 MXN en centavos
      Semestral: { amount: 9999, days: 180 }, // 99.99 MXN en centavos
    };

    if (!plans[plan]) {
      return NextResponse.json(
        { error: "Plan inválido" },
        { status: 400 }
      );
    }

    const { amount, days } = plans[plan];

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "mxn",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        plan,
        days: days.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Error al crear el pago" },
      { status: 500 }
    );
  }
}
