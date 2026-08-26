import { MIN_BID_PENCE } from "@/lib/types";

export type CheckoutPayload = {
  display_name: string;
  tagline: string;
  custom_color: string;
  bid_amount_pence: number;
};

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function validateCheckoutPayload(
  body: unknown
): { ok: true; data: CheckoutPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const {
    display_name,
    tagline,
    custom_color,
    bid_amount_pence,
  } = body as Record<string, unknown>;

  if (typeof display_name !== "string" || display_name.trim().length < 2) {
    return { ok: false, error: "Display name must be at least 2 characters" };
  }

  if (display_name.trim().length > 32) {
    return { ok: false, error: "Display name must be 32 characters or fewer" };
  }

  if (typeof tagline !== "string") {
    return { ok: false, error: "Tagline is required" };
  }

  if (tagline.length > 80) {
    return { ok: false, error: "Tagline must be 80 characters or fewer" };
  }

  if (typeof custom_color !== "string" || !HEX_COLOR.test(custom_color)) {
    return { ok: false, error: "Custom colour must be a hex value like #00ffff" };
  }

  const amount =
    typeof bid_amount_pence === "number"
      ? bid_amount_pence
      : typeof bid_amount_pence === "string"
        ? Number.parseInt(bid_amount_pence, 10)
        : NaN;

  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    return { ok: false, error: "Bid amount must be a whole number of pence" };
  }

  if (amount < MIN_BID_PENCE) {
    return {
      ok: false,
      error: `Minimum bid is £${(MIN_BID_PENCE / 100).toFixed(2)}`,
    };
  }

  return {
    ok: true,
    data: {
      display_name: display_name.trim(),
      tagline: tagline.trim(),
      custom_color,
      bid_amount_pence: amount,
    },
  };
}
