"use client";

import type { Bid } from "@/lib/types";
import { formatGbpFromPence } from "@/lib/types";

type FloorInspectorProps = {
  floor: number;
  bid: Bid | null;
  open: boolean;
  onClose: () => void;
  onClaim: () => void;
};

export function FloorInspector({
  floor,
  bid,
  open,
  onClose,
  onClaim,
}: FloorInspectorProps) {
  if (!open) return null;

  const isPenthouse = floor === 100;
  const isTopTen = floor >= 91;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="floor-inspector-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close floor inspector"
        onClick={onClose}
      />

      <div className="relative z-10 m-0 w-full max-w-md overflow-hidden border border-cyan-400/40 bg-[#0a0e1a] shadow-[0_0_40px_rgba(0,240,255,0.25)] sm:m-4 sm:rounded-lg">
        <div
          className={`h-1 w-full ${
            isTopTen
              ? "bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 animate-neon-glow"
              : "bg-cyan-500/60"
          }`}
        />

        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="font-pixel text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
              {isPenthouse
                ? "Penthouse"
                : isTopTen
                  ? "Penthouse Zone"
                  : "Tower Floor"}
            </p>
            <h2
              id="floor-inspector-title"
              className="mt-1 font-display text-2xl text-white"
            >
              Floor {floor}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/20 px-2 py-1 font-mono text-xs text-zinc-400 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            ESC
          </button>
        </div>

        <div className="space-y-4 px-5 pb-6">
          {bid ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 shrink-0 border-2 border-black shadow-[4px_4px_0_#000]"
                  style={{
                    backgroundColor: bid.custom_color,
                    boxShadow: `0 0 16px ${bid.custom_color}`,
                  }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg text-amber-300">
                    {bid.display_name}
                  </p>
                  <p className="truncate text-sm text-zinc-400">
                    {bid.tagline || "No tagline"}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div className="border border-white/10 bg-black/40 p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Bid
                  </dt>
                  <dd className="mt-1 text-cyan-300">
                    {formatGbpFromPence(bid.bid_amount_pence)}
                  </dd>
                </div>
                <div className="border border-white/10 bg-black/40 p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Claimed
                  </dt>
                  <dd className="mt-1 text-zinc-200">
                    {new Date(bid.created_at).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="border border-dashed border-white/20 bg-black/30 p-4 text-center">
              <p className="font-pixel text-[10px] text-zinc-500">VACANT</p>
              <p className="mt-2 text-sm text-zinc-400">
                This floor has no owner yet. Bid high enough to climb here.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClaim}
            className="w-full border-2 border-amber-400 bg-amber-400/10 px-4 py-3 font-pixel text-[10px] uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/20 hover:shadow-[0_0_24px_rgba(251,191,36,0.45)]"
          >
            Outbid & Take Penthouse
          </button>
        </div>
      </div>
    </div>
  );
}
