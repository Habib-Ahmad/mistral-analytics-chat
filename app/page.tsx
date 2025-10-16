"use client";

import { useState } from "react";
import Hero from "@/components/hero";
import AskForm from "@/components/ask-form";
import Examples from "@/components/examples";
import Explainer from "@/components/explainer";
import ChartPanel from "@/components/chart-panel";
import ResultDetails from "@/components/result-details";
import type { AskResponse } from "@/lib/types";

export default function Home() {
  const [question, setQuestion] = useState(
    "Show me the monthly revenue by category for 2025"
  );
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runWith(q: string) {
    setBusy(true);
    setError(null);
    setResponse(null);
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, model: "mistral-small-latest" }),
      });
      const j: AskResponse = await r.json();
      if (!r.ok) throw new Error(j.error || "API error");
      setResponse(j);
    } catch (e: any) {
      setError(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4">
      <Hero />

      {/* Search / Controls */}
      <section className="card">
        <AskForm
          busy={busy}
          question={question}
          setQuestion={setQuestion}
          onSubmit={runWith}
        />
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </section>

      {/* Info row */}
      <section className="grid md:grid-cols-2 gap-4 mt-4">
        <Explainer />
        <Examples
          onPick={(s) => {
            setQuestion(s);
            runWith(s);
          }}
        />
      </section>

      {/* Results */}
      {response && (
        <section className="mt-4 space-y-4">
          {response.chart && (
            <ChartPanel rows={response.rows ?? []} chart={response.chart} />
          )}
          <ResultDetails
            sql={response.sql}
            explanation={response.explanation}
            meta={`Model: ${response.model ?? "?"} • ${
              response.latencyMs ?? "—"
            } ms`}
          />
          {response.rows?.length ? (
            <div className="card overflow-x-auto">
              <h4 className="font-semibold mb-2 text-sm">Sample rows</h4>
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    {Object.keys(response.rows[0]).map((k) => (
                      <th
                        key={k}
                        className="px-2 py-1 text-left border-b border-slate-800/60 text-slate-300"
                      >
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {response.rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="odd:bg-slate-900/30">
                      {Object.keys(response.rows[0]).map((k) => (
                        <td
                          key={k}
                          className="px-2 py-1 align-top text-slate-200"
                        >
                          {String((r as any)[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      )}

      <footer className="py-10 text-center text-xs text-slate-500">
        Built with Mistral • Postgres (Neon) • Next.js • Recharts
      </footer>
    </main>
  );
}
