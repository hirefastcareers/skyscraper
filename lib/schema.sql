-- Floor100 — Supabase schema
-- Run this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  display_name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  custom_color text NOT NULL DEFAULT '#00ffff',
  target_url text NOT NULL DEFAULT '',
  bid_amount_pence integer NOT NULL DEFAULT 500
    CHECK (bid_amount_pence >= 500),
  floor_rank integer,
  stripe_session_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Existing deployments: add target_url if the table already exists
ALTER TABLE public.bids
  ADD COLUMN IF NOT EXISTS target_url text NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS bids_floor_rank_idx
  ON public.bids (floor_rank DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS bids_amount_created_idx
  ON public.bids (bid_amount_pence DESC, created_at ASC);

-- Recalculate floor ranks: highest bid = Floor 100, next = 99, ... Floor 1.
-- Bids beyond the Top 100 fall off the tower (floor_rank = NULL).
CREATE OR REPLACE FUNCTION public.recalculate_floor_ranks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY bid_amount_pence DESC, created_at ASC
      ) AS rn
    FROM public.bids
  )
  UPDATE public.bids AS b
  SET floor_rank = CASE
    WHEN r.rn <= 100 THEN 101 - r.rn
    ELSE NULL
  END
  FROM ranked AS r
  WHERE b.id = r.id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS bids_recalculate_floor_ranks ON public.bids;

CREATE TRIGGER bids_recalculate_floor_ranks
AFTER INSERT OR UPDATE OF bid_amount_pence OR DELETE
ON public.bids
FOR EACH STATEMENT
EXECUTE FUNCTION public.recalculate_floor_ranks();

-- Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read bids" ON public.bids;
CREATE POLICY "Public read bids"
  ON public.bids
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role inserts bids" ON public.bids;
CREATE POLICY "Service role inserts bids"
  ON public.bids
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Enable Realtime for live floor shifts (idempotent)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
