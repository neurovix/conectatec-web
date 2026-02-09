import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID requerido" },
        { status: 400 }
      );
    }

    // Verificar usuario autenticado
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el PaymentIntent de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Verificar que el pago fue exitoso
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: "Pago no completado", status: paymentIntent.status },
        { status: 400 }
      );
    }

    // Verificar que el userId coincide
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json(
        { error: "Usuario no autorizado" },
        { status: 403 }
      );
    }

    // Calcular fecha de expiración
    const now = new Date();
    const days = parseInt(paymentIntent.metadata.days);
    const premiumUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Actualizar usuario en la base de datos
    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        premium_until: premiumUntil.toISOString(),
      })
      .eq("id_user", user.id);

    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar usuario" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      premium_until: premiumUntil.toISOString(),
      plan: paymentIntent.metadata.plan,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error al verificar el pago" },
      { status: 500 }
    );
  }
}
