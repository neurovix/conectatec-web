import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.NEXT_STRIPE_SECRET_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Manejar el evento payment_intent.succeeded
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const userId = paymentIntent.metadata.userId;
      const days = parseInt(paymentIntent.metadata.days);

      if (!userId || !days) {
        console.error("Missing metadata in PaymentIntent:", paymentIntent.id);
        return NextResponse.json(
          { error: "Missing metadata" },
          { status: 400 }
        );
      }

      // Calcular fecha de expiración
      const now = new Date();
      const premiumUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      // Actualizar usuario en la base de datos
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_premium: true,
          premium_until: premiumUntil.toISOString(),
        })
        .eq("id_user", userId);

      if (updateError) {
        console.error("Error updating user from webhook:", updateError);
        return NextResponse.json(
          { error: "Database update failed" },
          { status: 500 }
        );
      }

      console.log(`User ${userId} upgraded to premium until ${premiumUntil.toISOString()}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
