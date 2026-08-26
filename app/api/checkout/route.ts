import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { formatGbpFromPence } from "@/lib/types";
import { validateCheckoutPayload } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const validated = validateCheckoutPayload(body);

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { display_name, tagline, custom_color, target_url, bid_amount_pence } =
      validated.data;

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: bid_amount_pence,
            product_data: {
              name: "Floor100 — Floor Claim",
              description: `${display_name} bids ${formatGbpFromPence(bid_amount_pence)} for a tower floor`,
            },
          },
        },
      ],
      metadata: {
        display_name,
        tagline,
        custom_color,
        target_url,
        bid_amount_pence: String(bid_amount_pence),
      },
      success_url: `${appUrl}/?status=success`,
      cancel_url: `${appUrl}/?status=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
