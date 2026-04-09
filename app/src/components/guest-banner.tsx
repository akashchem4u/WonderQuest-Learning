"use client";
import { useState } from "react";

interface Props {
  onConvert: () => void;
}

export function GuestBanner({ onConvert }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="w-full bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-3">
      <p className="text-sm text-amber-200">
        <span className="font-semibold">Guest mode</span> — progress resets in 24 hrs
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onConvert}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors"
        >
          Save progress →
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/60 hover:text-amber-300 text-sm"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
