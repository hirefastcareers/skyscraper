"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  formatGbpFromPence,
  MIN_BID_PENCE,
  type Bid,
} from "@/lib/types";

type ClaimFloorModalProps = {
  open: boolean;
  onClose: () => void;
  penthouseBid: Bid | null;
};

const DEFAULT_COLOR = "#00ffff";

export function ClaimFloorModal({
  open,
  onClose,
  penthouseBid,
}: ClaimFloorModalProps) {
  const minBid = useMemo(() => {
    if (!penthouseBid) return MIN_BID_PENCE;
    return Math.max(MIN_BID_PENCE, penthouseBid.bid_amount_pence + 100);
  }, [penthouseBid]);

  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [customColor, setCustomColor] = useState(DEFAULT_COLOR);
  const [bidAmountPence, setBidAmountPence] = useState(minBid);
  const [bidPoundsInput, setBidPoundsInput] = useState(
    (minBid / 100).toFixed(2)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBidAmountPence(minBid);
    setBidPoundsInput((minBid / 100).toFixed(2));
    setError(null);
  }, [open, minBid]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const syncPoundsToPence = (raw: string) => {
    setBidPoundsInput(raw);
    const pounds = Number.parseFloat(raw);
    if (!Number.isFinite(pounds)) return;
    setBidAmountPence(Math.round(pounds * 100));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }

    if (bidAmountPence < minBid) {
      setError(
        `Bid must be at least ${formatGbpFromPence(minBid)} to challenge Floor 100.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName.trim(),
          tagline: tagline.trim(),
          custom_color: customColor,
          bid_amount_pence: bidAmountPence,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setSubmitting(false);
    }
  };

  const maxSlider = Math.max(minBid * 4, 50000);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-floor-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Close claim modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg border border-amber-400/50 bg-[#080c18] shadow-[0_0_50px_rgba(251,191,36,0.2)] sm:m-4 sm:rounded-lg">
        <div className="h-1 w-full animate-neon-glow bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400" />

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-pixel text-[9px] uppercase tracking-[0.25em] text-amber-400/90">
                Claim Protocol
              </p>
              <h2
                id="claim-floor-title"
                className="mt-1 font-display text-2xl text-white"
              >
                Outbid & Take Penthouse
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Current Floor 100:{" "}
                <span className="text-cyan-300">
                  {penthouseBid
                    ? `${penthouseBid.display_name} · ${formatGbpFromPence(penthouseBid.bid_amount_pence)}`
                    : "Vacant"}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-white/20 px-2 py-1 font-mono text-xs text-zinc-400 hover:border-amber-400 hover:text-amber-300"
            >
              Close
            </button>
          </div>

          <label className="block space-y-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Display Name
            </span>
            <input
              required
              maxLength={32}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="NEON_ACE"
              className="w-full border border-white/15 bg-black/50 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Tagline
            </span>
            <input
              maxLength={80}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="King of the skyline"
              className="w-full border border-white/15 bg-black/50 px-3 py-2.5 font-mono text-sm text-white outline-none transition focus:border-cyan-400 focus:shadow-[0_0_12px_rgba(0,240,255,0.25)]"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
              Window Neon Colour
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-11 w-14 cursor-pointer border border-white/20 bg-transparent p-1"
              />
              <input
                type="text"
                pattern="^#[0-9A-Fa-f]{6}$"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 border border-white/15 bg-black/50 px-3 py-2.5 font-mono text-sm uppercase text-white outline-none focus:border-cyan-400"
              />
              <div
                className="h-11 w-11 border border-black"
                style={{
                  backgroundColor: customColor,
                  boxShadow: `0 0 18px ${customColor}`,
                }}
                aria-hidden
              />
            </div>
          </label>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <label className="block flex-1 space-y-1.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                  Bid Amount (GBP)
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-zinc-500">
                    £
                  </span>
                  <input
                    type="number"
                    min={(minBid / 100).toFixed(2)}
                    step="0.01"
                    value={bidPoundsInput}
                    onChange={(e) => syncPoundsToPence(e.target.value)}
                    className="w-full border border-white/15 bg-black/50 py-2.5 pl-7 pr-3 font-mono text-sm text-amber-300 outline-none focus:border-amber-400"
                  />
                </div>
              </label>
              <p className="pb-2 font-mono text-xs text-zinc-500">
                min {formatGbpFromPence(minBid)}
              </p>
            </div>

            <input
              type="range"
              min={minBid}
              max={maxSlider}
              step={100}
              value={Math.min(Math.max(bidAmountPence, minBid), maxSlider)}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10);
                setBidAmountPence(next);
                setBidPoundsInput((next / 100).toFixed(2));
              }}
              className="w-full accent-amber-400"
            />
          </div>

          {error ? (
            <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full border-2 border-cyan-400 bg-cyan-400/15 px-4 py-3.5 font-pixel text-[10px] uppercase tracking-widest text-cyan-200 transition hover:bg-cyan-400/25 hover:shadow-[0_0_28px_rgba(0,240,255,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Routing to Stripe…"
              : `Pay ${formatGbpFromPence(bidAmountPence)} · Claim Floor`}
          </button>
        </form>
      </div>
    </div>
  );
}
