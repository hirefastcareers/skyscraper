import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { MIN_BID_PENCE } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[webhook] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[webhook] Signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const metadata = session.metadata ?? {};
    const displayName = metadata.display_name?.trim();
    const tagline = metadata.tagline?.trim() ?? "";
    const customColor = metadata.custom_color?.trim() || "#00ffff";
    const bidAmountPence = Number.parseInt(
      metadata.bid_amount_pence ?? "",
      10
    );

    if (!displayName || !Number.isFinite(bidAmountPence)) {
      console.error("[webhook] Incomplete metadata", metadata);
      return NextResponse.json(
        { error: "Incomplete session metadata" },
        { status: 400 }
      );
    }

    if (bidAmountPence < MIN_BID_PENCE) {
      console.error("[webhook] Bid below minimum", bidAmountPence);
      return NextResponse.json({ error: "Bid too low" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("bids").insert({
      display_name: displayName,
      tagline,
      custom_color: customColor,
      bid_amount_pence: bidAmountPence,
      avatar_url: "",
      stripe_session_id: session.id,
      user_id: null,
    });

    if (error) {
      if (error.code === "23505") {
        // Duplicate stripe_session_id — already fulfilled
        return NextResponse.json({ received: true, duplicate: true });
      }

      console.error("[webhook] Insert failed", error);
      return NextResponse.json(
        { error: "Failed to insert bid" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
