import { Suspense } from "react";
import { Layer100App } from "@/components/Layer100App";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#05060f] font-mono text-sm text-cyan-400/70">
          Booting Floor100…
        </div>
      }
    >
      <Layer100App />
    </Suspense>
  );
}
