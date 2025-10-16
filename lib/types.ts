export type ChartSpec = {
  type: "bar" | "line" | "pie";
  xField: string;
  yField: string;
  seriesField?: string | null;
  title?: string;
};

export type AskResponse = {
  rows: Record<string, unknown>[];
  chart: ChartSpec | null;
  explanation?: string;
  sql?: string;
  model?: string;
  latencyMs?: number;
  error?: string;
};
