"use client";

import { Crown } from "lucide-react";
import { useMemo } from "react";
import {
  formatGbpFromPence,
  PENTHOUSE_ZONE_MIN,
  TOTAL_FLOORS,
  urlDisplayDomain,
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
  vacant = false,
}: {
  lit: boolean;
  color: string;
  dense?: boolean;
  vacant?: boolean;
}) {
  const count = dense ? 8 : 6;
  return (
    <div
      className={`grid flex-1 gap-0.5 ${dense ? "grid-cols-4" : "grid-cols-3"} ${
        vacant
          ? "rounded-sm border border-slate-800/60 bg-slate-900/30 p-0.5"
          : ""
      }`}
      aria-hidden
      style={
        vacant
          ? {
              backgroundImage:
                "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }
          : undefined
      }
    >
      {Array.from({ length: count }, (_, i) => {
        const vacantGlow = vacant && !lit;
        const dimColor =
          i % 3 === 0 ? "rgba(34,211,238,0.12)" : "rgba(148,163,184,0.08)";

        return (
          <span
            key={i}
            className="aspect-square border border-black/60"
            style={{
              backgroundColor: lit
                ? color
                : vacantGlow
                  ? dimColor
                  : "#1a1f2e",
              opacity: lit ? 0.55 + ((i * 17) % 40) / 100 : vacantGlow ? 0.7 : 0.35,
              boxShadow: lit
                ? `inset 0 0 4px ${color}`
                : vacantGlow
                  ? "inset 0 0 3px rgba(34,211,238,0.15)"
                  : undefined,
            }}
          />
        );
      })}
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
      <div className="pointer-events-none absolute -inset-x-8 -top-16 h-40 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.28),transparent_70%)]" />

      <div
        className={`relative overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/80 p-2 shadow-[0_0_40px_rgba(6,182,212,0.15)] backdrop-blur-md transition duration-500 sm:p-3 ${
          shifting ? "animate-tower-shift" : ""
        }`}
      >
        <div className="relative border-x-4 border-t-4 border-[#1e2438] bg-[#0b1020]">
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
              const domain =
                bid?.target_url ? urlDisplayDomain(bid.target_url) : null;

              return (
                <li key={floor}>
                  <button
                    type="button"
                    onClick={() => onFloorClick(floor)}
                    title={
                      occupied && bid
                        ? domain
                          ? `${bid.display_name} · ${domain}`
                          : bid.display_name
                        : undefined
                    }
                    className={`group relative flex w-full items-stretch gap-2 px-2 py-1.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cyan-400 ${
                      occupied ? "cursor-pointer" : ""
                    } ${
                      isPenthouse
                        ? "z-10 border-2 border-amber-400 bg-[#14120a] shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:bg-[#1a170c]"
                        : occupied
                          ? isTopTen
                            ? "bg-[#10182c] hover:bg-[#152038]"
                            : "bg-[#0b1020] hover:bg-[#121a30]"
                          : "border border-slate-800/60 bg-slate-900/30 hover:bg-slate-900/50"
                    } ${
                      isTopTen && !isPenthouse
                        ? "shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]"
                        : ""
                    }`}
                  >
                    {isPenthouse ? (
                      <span
                        className="pointer-events-none absolute inset-0 animate-pulse border-2 border-amber-400/80 shadow-[0_0_25px_rgba(251,191,36,0.4)]"
                        aria-hidden
                      />
                    ) : null}

                    {isTopTen && !isPenthouse ? (
                      <span
                        className="pointer-events-none absolute inset-0 border border-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.35)] group-hover:border-amber-400/50 group-hover:shadow-[0_0_24px_rgba(251,191,36,0.4)]"
                        aria-hidden
                      />
                    ) : null}

                    {isPenthouse ? <PenthouseParticles /> : null}

                    {occupied && bid ? (
                      <span
                        className="pointer-events-none absolute inset-y-0 right-2 z-30 flex max-w-[55%] items-center opacity-0 transition duration-150 group-hover:opacity-100"
                        role="tooltip"
                      >
                        <span className="truncate rounded border border-cyan-400/40 bg-[#0a0e1a]/95 px-2 py-1 shadow-[0_0_16px_rgba(34,211,238,0.25)]">
                          <span className="block truncate font-display text-xs text-amber-300">
                            {bid.display_name}
                          </span>
                          {domain ? (
                            <span className="mt-0.5 block truncate font-mono text-[10px] text-cyan-400/90">
                              {domain}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    ) : null}

                    <div className="relative z-10 flex w-[4.5rem] shrink-0 flex-col justify-center">
                      {isPenthouse ? (
                        <>
                          <span className="flex items-center gap-1 font-pixel text-[9px] text-amber-300">
                            <Crown
                              className="h-3 w-3 shrink-0 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                              aria-hidden
                            />
                            F{floor}
                          </span>
                          <span className="mt-0.5 animate-pulse-fast font-mono text-[8px] uppercase tracking-wider text-amber-400">
                            ★ PENTHOUSE KING
                          </span>
                        </>
                      ) : (
                        <>
                          <span
                            className={`font-pixel text-[9px] ${
                              isTopTen ? "text-amber-300" : "text-zinc-500"
                            }`}
                          >
                            F{floor}
                          </span>
                          {isTopTen ? (
                            <span className="mt-0.5 animate-pulse-fast font-mono text-[8px] uppercase tracking-wider text-cyan-400">
                              NEON
                            </span>
                          ) : null}
                        </>
                      )}
                    </div>

                    <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
                      <WindowGrid
                        lit={occupied}
                        color={neon}
                        dense={isTopTen}
                        vacant={!occupied}
                      />

                      <div className="min-w-0 flex-1 py-0.5">
                        {occupied && bid ? (
                          <>
                            <p
                              className={`truncate font-display text-sm ${
                                isPenthouse
                                  ? "text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                                  : isTopTen
                                    ? "text-amber-200"
                                    : "text-zinc-200"
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
                          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                            Vacant · Claim ready
                          </p>
                        )}
                      </div>

                      <span
                        className={`relative z-10 h-2.5 w-2.5 shrink-0 border border-black ${
                          occupied
                            ? "animate-pulse-fast"
                            : "opacity-60 shadow-[0_0_6px_rgba(34,211,238,0.25)]"
                        }`}
                        style={{
                          backgroundColor: occupied ? neon : "#1e293b",
                          boxShadow: occupied
                            ? `0 0 10px ${neon}`
                            : "inset 0 0 4px rgba(34,211,238,0.2)",
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
      </div>

      <div className="mx-auto h-6 w-[70%] bg-gradient-to-b from-[#1a2238] to-transparent" />
    </div>
  );
}
