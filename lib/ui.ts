export const PALETTE = [
  "#22d3ee",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ef4444",
  "#6366f1",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
];

export function colorFor(label: string) {
  let h = 0;
  for (let i = 0; i < label.length; i++)
    h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function pivotLongToWide(
  rows: any[],
  xField: string,
  yField: string,
  seriesField?: string | null
) {
  if (!seriesField) {
    const data = rows
      .map((r) => ({ ...r, [yField]: Number(r[yField]) || 0 }))
      .sort((a, b) => String(a[xField]).localeCompare(String(b[xField])));
    return { data, series: [] as string[] };
  }

  const series = Array.from(new Set(rows.map((r) => String(r[seriesField]))));
  const byX = new Map<string, any>();

  for (const r of rows) {
    const x = String(r[xField]);
    const s = String(r[seriesField]);
    const y = Number(r[yField]) || 0;
    if (!byX.has(x)) byX.set(x, { [xField]: x });
    const obj = byX.get(x)!;
    obj[s] = (obj[s] || 0) + y;
  }

  const data = Array.from(byX.values()).sort((a, b) =>
    String(a[xField]).localeCompare(String(b[xField]))
  );

  return { data, series };
}
