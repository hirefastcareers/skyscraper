import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const bidId =
      body && typeof body === "object" && "bid_id" in body
        ? String((body as { bid_id: unknown }).bid_id ?? "")
        : "";

    if (!UUID_RE.test(bidId)) {
      return NextResponse.json({ error: "Invalid bid_id" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.rpc("increment_bid_clicks", {
      p_bid_id: bidId,
    });

    if (error) {
      // Fallback if RPC not deployed yet: read + update
      console.warn("[click] RPC failed, using fallback", error.message);

      const { data: row, error: readError } = await supabaseAdmin
        .from("bids")
        .select("clicks")
        .eq("id", bidId)
        .maybeSingle();

      if (readError || !row) {
        return NextResponse.json({ error: "Bid not found" }, { status: 404 });
      }

      const nextClicks = (row.clicks ?? 0) + 1;
      const { error: updateError } = await supabaseAdmin
        .from("bids")
        .update({ clicks: nextClicks })
        .eq("id", bidId);

      if (updateError) {
        console.error("[click] Update failed", updateError);
        return NextResponse.json(
          { error: "Failed to record click" },
          { status: 500 }
        );
      }

      return NextResponse.json({ clicks: nextClicks });
    }

    return NextResponse.json({ clicks: data as number });
  } catch (error) {
    console.error("[click]", error);
    return NextResponse.json(
      { error: "Unable to record click" },
      { status: 500 }
    );
  }
}
