import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeClient) return stripeClient;

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: "2026-07-29.dahlia",
    typescript: true,
  });

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getStripe(), prop, receiver);
    return typeof value === "function" ? value.bind(getStripe()) : value;
  },
});
