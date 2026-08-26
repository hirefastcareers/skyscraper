"use client";

import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClaimFloorModal } from "@/components/ClaimFloorModal";
import { FloorInspector } from "@/components/FloorInspector";
import { SkyscraperTower } from "@/components/SkyscraperTower";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import {
  formatGbpFromPence,
  TOTAL_FLOORS,
  type Bid,
} from "@/lib/types";

async function fetchBids(): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from("bids")
      .select("*")
      .not("floor_rank", "is", null)
      .order("floor_rank", { ascending: false });

    if (error) {
      console.error("[bids] fetch failed", error);
      return [];
    }

    return (data ?? []) as Bid[];
  } catch (error) {
    console.error("[bids] unexpected fetch error", error);
    return [];
  }
}

export function Layer100App() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [shifting, setShifting] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [inspectFloor, setInspectFloor] = useState<number | null>(null);

  const reloadBids = useCallback(async (animate = false) => {
    if (animate) {
      setShifting(true);
      window.setTimeout(() => setShifting(false), 700);
    }
    const next = await fetchBids();
    setBids(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reloadBids(false);
  }, [reloadBids]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel("bids-change")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids" },
        () => {
          void reloadBids(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reloadBids]);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (searchParams.get("status") !== "success") return;

    confetti({
      particleCount: 140,
      spread: 76,
      origin: { y: 0.35 },
      colors: ["#22d3ee", "#fbbf24", "#f472b6", "#ffffff"],
    });

    const burst = window.setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#22d3ee", "#fbbf24"],
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#fbbf24", "#22d3ee"],
      });
    }, 250);

    router.replace("/", { scroll: false });

    return () => window.clearTimeout(burst);
  }, [searchParams, router]);

  useEffect(() => {
    if (inspectFloor === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInspectFloor(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectFloor]);

  const bidsByFloor = useMemo(() => {
    const map = new Map<number, Bid>();
    for (const bid of bids) {
      if (bid.floor_rank != null && bid.floor_rank >= 1 && bid.floor_rank <= TOTAL_FLOORS) {
        map.set(bid.floor_rank, bid);
      }
    }
    return map;
  }, [bids]);

  const penthouse = bidsByFloor.get(TOTAL_FLOORS) ?? null;
  const occupiedCount = bidsByFloor.size;
  const vacantCount = TOTAL_FLOORS - occupiedCount;

  const tickerText = penthouse
    ? `Floor 100 currently held by ${penthouse.display_name} for ${formatGbpFromPence(penthouse.bid_amount_pence)}`
    : "Floor 100 is vacant — claim the Penthouse and light up the skyline";

  const ctaClassName =
    "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] transition hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_28px_rgba(6,182,212,0.7)]";

  function renderTickerSegment(text: string, keyPrefix: string) {
    const parts = text.split(/([£$][\d,.]+)/g);
    return (
      <span key={keyPrefix} className="mx-8">
        {parts.map((part, index) =>
          /^[£$][\d,.]+$/.test(part) ? (
            <span
              key={`${keyPrefix}-${index}`}
              className="font-semibold text-amber-400"
            >
              {part}
            </span>
          ) : (
            <span key={`${keyPrefix}-${index}`}>{part}</span>
          )
        )}
      </span>
    );
  }

  const occupiedLabel = `${occupiedCount} / ${TOTAL_FLOORS} (${vacantCount} Vacant)`;
  const topBidLabel = penthouse
    ? formatGbpFromPence(penthouse.bid_amount_pence)
    : formatGbpFromPence(500);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05060f] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(251,191,36,0.08),transparent_50%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-[#05060f]/90 backdrop-blur-md">
        {!supabaseReady ? (
          <div className="border-b border-amber-400/30 bg-amber-400/10 px-4 py-2 text-center font-mono text-xs text-amber-200">
            Demo mode: add{" "}
            <span className="text-white">NEXT_PUBLIC_SUPABASE_URL</span> and{" "}
            <span className="text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> in
            Vercel → Settings → Environment Variables, then redeploy.
          </div>
        ) : null}
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="border border-amber-400/60 bg-amber-400/10 px-2 py-1 shadow-[0_0_16px_rgba(251,191,36,0.35)]">
              <p className="font-pixel text-[10px] leading-none text-amber-300">
                F100
              </p>
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wide text-white sm:text-2xl">
                Floor100
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                Real-time digital skyscraper
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setClaimOpen(true)}
            className={`shrink-0 px-4 py-2.5 font-pixel text-[9px] uppercase tracking-widest ${ctaClassName}`}
          >
            Dethrone Penthouse
          </button>
        </div>

        <div className="overflow-hidden border-t border-white/5 bg-black/50 py-2">
          <div className="animate-marquee flex whitespace-nowrap font-mono text-xs text-slate-200">
            {renderTickerSegment(tickerText, "a")}
            <span aria-hidden>{renderTickerSegment(tickerText, "b")}</span>
            <span aria-hidden>{renderTickerSegment(tickerText, "c")}</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-24 pt-6 text-slate-100 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
            {/* LEFT COLUMN: Headline & Stats */}
            <div className="flex flex-col justify-start space-y-6 text-center lg:col-span-3 lg:sticky lg:top-28 lg:text-left">
              <div>
                <p className="font-pixel text-[9px] uppercase tracking-[0.3em] text-cyan-400/70">
                  Hostile takeovers welcome
                </p>
                <h2 className="mt-2 font-display text-3xl leading-tight text-white xl:text-4xl">
                  100 Floors. One Crown.
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 lg:mx-0">
                  Highest bid seizes the Penthouse. Outbid anyone and the tower
                  reshuffles in real time – bumping every lower claim down a
                  floor.
                </p>
              </div>

              {/* Mobile compact horizontal stats */}
              <div className="mx-auto w-full max-w-lg overflow-x-auto border border-cyan-400/25 bg-black/40 px-3 py-3 shadow-[0_0_30px_rgba(34,211,238,0.08)] lg:hidden">
                <p className="mb-2 font-pixel text-[9px] uppercase tracking-widest text-cyan-400">
                  Live Stats
                </p>
                <dl className="flex min-w-max gap-5 font-mono text-xs">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-zinc-500">Claimed Territory</dt>
                    <dd className="whitespace-nowrap text-white">
                      {occupiedLabel}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-zinc-500">Penthouse King</dt>
                    <dd className="max-w-[8rem] truncate text-amber-300">
                      {penthouse?.display_name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-zinc-500">Penthouse Bounty</dt>
                    <dd className="text-cyan-300">{topBidLabel}</dd>
                  </div>
                </dl>
              </div>

              {/* Desktop stacked stats */}
              <div className="hidden border border-cyan-400/25 bg-black/40 p-4 shadow-[0_0_30px_rgba(34,211,238,0.08)] lg:block">
                <p className="font-pixel text-[9px] uppercase tracking-widest text-cyan-400">
                  Live Stats
                </p>
                <dl className="mt-4 space-y-3 font-mono text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">Claimed Territory</dt>
                    <dd className="text-right text-white">{occupiedLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">Penthouse King</dt>
                    <dd className="truncate text-amber-300">
                      {penthouse?.display_name ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-zinc-500">Penthouse Bounty</dt>
                    <dd className="text-cyan-300">{topBidLabel}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* CENTER COLUMN: Skyscraper */}
            <div className="flex w-full flex-col items-center lg:col-span-6">
              {loading ? (
                <div className="mx-auto flex h-64 w-full max-w-xl items-center justify-center border border-dashed border-white/15 bg-black/30 font-mono text-sm text-zinc-500">
                  Syncing tower state…
                </div>
              ) : (
                <SkyscraperTower
                  bidsByFloor={bidsByFloor}
                  shifting={shifting}
                  onFloorClick={setInspectFloor}
                />
              )}
            </div>

            {/* RIGHT COLUMN: Protocol & CTA */}
            <div className="flex flex-col justify-start space-y-6 lg:col-span-3 lg:sticky lg:top-28">
              <div className="border border-white/10 bg-black/30 p-4">
                <p className="font-pixel text-[9px] uppercase tracking-widest text-zinc-500">
                  System Protocol
                </p>
                <ol className="mt-3 list-none space-y-3 text-sm text-zinc-400">
                  <li>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                      Buy In:
                    </span>{" "}
                    Pay to secure your floor (min £5 entry). Drop your link & mark
                    your territory.
                  </li>
                  <li>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                      Ascend:
                    </span>{" "}
                    Raw capital dictates height. Highest bid seizes Floor 100.
                  </li>
                  <li>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                      Dethrone:
                    </span>{" "}
                    Higher bids trigger dynamic displacement. Get outbid, get
                    pushed down a level.
                  </li>
                  <li>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">
                      Flex:
                    </span>{" "}
                    Hold the Top 10 Penthouse Zone to project maximum signal &
                    dominate traffic.
                  </li>
                </ol>
              </div>

              <button
                type="button"
                onClick={() => setClaimOpen(true)}
                className={`hidden w-full px-4 py-3.5 font-pixel text-[9px] uppercase tracking-widest lg:block ${ctaClassName}`}
              >
                Seize a Floor
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile sticky Seize CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-400/20 bg-[#05060f]/95 p-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setClaimOpen(true)}
          className={`w-full px-4 py-3.5 font-pixel text-[9px] uppercase tracking-widest ${ctaClassName}`}
        >
          Seize a Floor
        </button>
      </div>

      <footer className="relative z-10 border-t border-white/5 py-6 pb-24 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600 lg:pb-6">
        Floor100 · Gamified skyline · GBP via Stripe
      </footer>

      <FloorInspector
        floor={inspectFloor ?? 0}
        bid={inspectFloor != null ? bidsByFloor.get(inspectFloor) ?? null : null}
        open={inspectFloor !== null}
        onClose={() => setInspectFloor(null)}
        onClaim={() => {
          setInspectFloor(null);
          setClaimOpen(true);
        }}
      />

      <ClaimFloorModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        penthouseBid={penthouse}
      />
    </div>
  );
}
