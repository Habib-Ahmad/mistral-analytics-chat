"use client";

import { useState } from "react";
import type { AskResponse } from "@/lib/types";

type Props = {
  defaultModel?: string;
  onResult: (r: AskResponse) => void;
  onError: (msg: string) => void;
  busy?: boolean;
  question: string;
  setQuestion: (q: string) => void;
};

export default function AskForm({
  defaultModel = "mistral-small-latest",
  onResult,
  onError,
  busy,
  question,
  setQuestion,
}: Props) {
  const [model, setModel] = useState(defaultModel);

  async function run() {
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, model }),
      });
      const data: AskResponse = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      onResult(data);
    } catch (e: any) {
      onError(e?.message || "Request failed");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        className="input"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Monthly revenue by category for 2025"
        aria-label="Ask a question"
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          className="input !w-auto"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          aria-label="Model"
        >
          <option value="mistral-small-latest">mistral-small-latest</option>
          <option value="mistral-medium-latest">mistral-medium-latest</option>
        </select>

        <button className="btn" onClick={run} disabled={busy}>
          {busy ? "Running…" : "Generate"}
        </button>
      </div>
    </div>
  );
}
