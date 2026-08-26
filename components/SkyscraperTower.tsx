"use client";

import { useMemo } from "react";
import {
  formatGbpFromPence,
  PENTHOUSE_ZONE_MIN,
  TOTAL_FLOORS,
  type Bid,
} from "@/lib/types";

type SkyscraperTowerProps = {
  bidsByFloor: Map<number, Bid>;
  shifting: boolean;
  onFloorClick: (floor: number) => void;
};

function WindowGrid({
  lit,
  color,
  dense = false,
}: {
  lit: boolean;
  color: string;
  dense?: boolean;
}) {
  const count = dense ? 8 : 6;
  return (
    <div
      className={`grid flex-1 gap-0.5 ${dense ? "grid-cols-4" : "grid-cols-3"}`}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="aspect-square border border-black/60"
          style={{
            backgroundColor: lit ? color : "#1a1f2e",
            opacity: lit ? 0.55 + ((i * 17) % 40) / 100 : 0.35,
            boxShadow: lit ? `inset 0 0 4px ${color}` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function PenthouseParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 9) * 0.35}s`,
        duration: `${2.4 + (i % 5) * 0.4}s`,
        size: 2 + (i % 3),
        gold: i % 2 === 0,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 animate-float-up rounded-full opacity-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.gold ? "#fbbf24" : "#22d3ee",
            boxShadow: p.gold
              ? "0 0 6px #fbbf24"
              : "0 0 6px #22d3ee",
          }}
        />
      ))}
    </div>
  );
}

export function SkyscraperTower({
  bidsByFloor,
  shifting,
  onFloorClick,
}: SkyscraperTowerProps) {
  const floors = useMemo(
    () => Array.from({ length: TOTAL_FLOORS }, (_, i) => TOTAL_FLOORS - i),
    []
  );

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="pointer-events-none absolute -inset-x-8 -top-16 h-40 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.18),transparent_70%)]" />

      <div
        className={`relative border-x-4 border-t-4 border-[#1e2438] bg-[#0b1020] shadow-[0_0_60px_rgba(0,240,255,0.12)] transition duration-500 ${
          shifting ? "animate-tower-shift" : ""
        }`}
      >
        <div className="relative border-b border-amber-400/40 bg-gradient-to-b from-amber-400/25 via-[#12182c] to-[#0b1020] px-3 py-4 text-center">
          <PenthouseParticles />
          <p className="font-pixel text-[9px] uppercase tracking-[0.35em] text-amber-300 animate-pulse-fast">
            ▲ Penthouse Suite ▲
          </p>
          <p className="mt-1 font-display text-sm text-cyan-200/90">
            Floors {PENTHOUSE_ZONE_MIN}–{TOTAL_FLOORS}
          </p>
        </div>

        <ul className="divide-y divide-[#161c30]">
          {floors.map((floor) => {
            const bid = bidsByFloor.get(floor) ?? null;
            const occupied = Boolean(bid);
            const isTopTen = floor >= PENTHOUSE_ZONE_MIN;
            const isPenthouse = floor === TOTAL_FLOORS;
            const neon = bid?.custom_color ?? "#22d3ee";

            return (
              <li key={floor}>
                <button
                  type="button"
                  onClick={() => onFloorClick(floor)}
                  className={`group relative flex w-full items-stretch gap-2 px-2 py-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-400 ${
                    isTopTen
                      ? "bg-[#10182c] hover:bg-[#152038]"
                      : "bg-[#0b1020] hover:bg-[#121a30]"
                  } ${
                    isTopTen
                      ? "shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]"
                      : ""
                  }`}
                >
                  {isTopTen ? (
                    <span
                      className="pointer-events-none absolute inset-0 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.35)] group-hover:border-amber-400/50 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.4)]"
                      aria-hidden
                    />
                  ) : null}

                  {isPenthouse ? <PenthouseParticles /> : null}

                  <div className="relative z-10 flex w-14 shrink-0 flex-col justify-center">
                    <span
                      className={`font-pixel text-[9px] ${
                        isTopTen ? "text-amber-300" : "text-zinc-500"
                      }`}
                    >
                      F{floor}
                    </span>
                    {isTopTen ? (
                      <span className="mt-0.5 animate-pulse-fast font-mono text-[8px] uppercase tracking-wider text-cyan-400">
                        {isPenthouse ? "◆ TOP" : "NEON"}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
                    <WindowGrid
                      lit={occupied}
                      color={neon}
                      dense={isTopTen}
                    />

                    <div className="min-w-0 flex-1 py-0.5">
                      {occupied && bid ? (
                        <>
                          <p
                            className={`truncate font-display text-sm ${
                              isTopTen ? "text-amber-200" : "text-zinc-200"
                            }`}
                          >
                            {bid.display_name}
                          </p>
                          <p className="truncate font-mono text-[10px] text-zinc-500">
                            {formatGbpFromPence(bid.bid_amount_pence)}
                            {bid.tagline ? ` · ${bid.tagline}` : ""}
                          </p>
                        </>
                      ) : (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                          Vacant
                        </p>
                      )}
                    </div>

                    <span
                      className={`relative z-10 h-2.5 w-2.5 shrink-0 border border-black ${
                        occupied ? "animate-pulse-fast" : "opacity-40"
                      }`}
                      style={{
                        backgroundColor: occupied ? neon : "#334155",
                        boxShadow: occupied ? `0 0 10px ${neon}` : undefined,
                      }}
                      aria-hidden
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t-4 border-[#2a3348] bg-[#151b2e] px-3 py-5 text-center">
          <div className="mx-auto mb-2 h-2 w-24 bg-[#0b1020] shadow-[inset_0_0_8px_#000]" />
          <p className="font-pixel text-[9px] uppercase tracking-[0.3em] text-zinc-500">
            Lobby · Floor 1
          </p>
        </div>
      </div>

      <div className="mx-auto h-6 w-[70%] bg-gradient-to-b from-[#1a2238] to-transparent" />
    </div>
  );
}
