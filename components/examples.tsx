"use client";

import { EXAMPLES_SIMPLE, EXAMPLES_ADVANCED } from "@/lib/examples";
import { useState } from "react";

const tabs = [
  { key: "simple", label: "Simple", data: EXAMPLES_SIMPLE },
  { key: "advanced", label: "Advanced", data: EXAMPLES_ADVANCED },
] as const;

export default function Examples({ onPick }: { onPick: (s: string) => void }) {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("simple");

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Example prompts</h3>
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`px-2.5 py-1 rounded-lg text-sm border ${
                active === t.key
                  ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-200"
                  : "border-slate-700/60 hover:bg-slate-800/70 text-slate-300"
              }`}
              onClick={() => setActive(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {tabs
          .find((t) => t.key === active)!
          .data.map((s) => (
            <button
              key={s}
              className="text-left px-3 py-2 rounded-lg border border-slate-700/60 hover:bg-slate-800/70 text-sm"
              title="Click to use this prompt"
              onClick={() => onPick(s)}
            >
              {s}
            </button>
          ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Prompts support filters like dates (e.g. “September 2025”), categories,
        vendors, country, carrier, and region.
      </p>
    </div>
  );
}
