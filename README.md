# Layer 100

Gamified real-time pixel skyscraper. Users bid in GBP via Stripe; the highest bid owns Floor 100 (Penthouse). Lower floors reshuffle automatically.

## Stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS (neon glow animations)
- Supabase (Postgres + Realtime)
- Stripe Checkout + webhooks

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run [`lib/schema.sql`](lib/schema.sql) in the SQL Editor.

3. Copy env vars:

```bash
cp .env.example .env.local
```

Fill in Supabase URL/keys, Stripe secret + webhook secret, and `NEXT_PUBLIC_APP_URL`.

4. Start the app:

```bash
npm run dev
```

5. Forward Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Paste the printed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Mechanics

- Minimum bid: **£5.00** (`500` pence)
- `floor_rank` is recalculated by a DB trigger: `bid_amount_pence DESC`, then `created_at ASC`
- Highest bid → Floor 100; next → 99; … Floor 1
- Bids beyond the top 100 fall off the tower (`floor_rank = NULL`)
- Floors 91–100 are the Penthouse Zone (neon gold/cyan treatment)
- Realtime channel `bids-change` refreshes the tower on insert/update/delete
- Successful Stripe return (`/?status=success`) fires confetti

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/checkout` | POST | Create Stripe Checkout session (GBP) |
| `/api/webhooks/stripe` | POST | Fulfill `checkout.session.completed` → insert bid |

Checkout body:

```json
{
  "display_name": "NEON_ACE",
  "tagline": "King of the skyline",
  "custom_color": "#00ffff",
  "target_url": "https://chambers.dev",
  "bid_amount_pence": 1500
}
```

# skyscraper
