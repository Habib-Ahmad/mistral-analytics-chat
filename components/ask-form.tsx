"use client";

import { useState } from "react";

type Props = {
  defaultModel?: string;
  busy?: boolean;
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: (q: string) => Promise<void>;
};

export default function AskForm({
  defaultModel = "mistral-small-latest",
  busy,
  question,
  setQuestion,
  onSubmit,
}: Props) {
  const [model, setModel] = useState(defaultModel);

  const handleClick = async () => {
    await onSubmit(question);
  };

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

        <button className="btn" onClick={handleClick} disabled={busy}>
          {busy ? "Running…" : "Generate"}
        </button>
      </div>
    </div>
  );
}
