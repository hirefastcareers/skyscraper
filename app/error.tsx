"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#05060f] px-6 text-center">
      <p className="font-pixel text-[10px] uppercase tracking-[0.3em] text-amber-400">
        Layer 100
      </p>
      <h1 className="font-display text-2xl text-white">Something went wrong</h1>
      <p className="max-w-md font-mono text-sm text-zinc-400">
        {error.message || "The tower failed to render."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 font-pixel text-[9px] uppercase tracking-widest text-cyan-200"
      >
        Try again
      </button>
    </div>
  );
}
