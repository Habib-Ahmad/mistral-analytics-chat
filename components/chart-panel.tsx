"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { ChartSpec } from "@/lib/types";
import { colorFor, pivotLongToWide } from "@/lib/ui";

const MAX_TICK = 12;
function truncateLabel(v: unknown, max = MAX_TICK) {
  const s = String(v ?? "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

const PALETTE = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
  "#e11d48",
  "#14b8a6",
  "#f97316",
  "#3b82f6",
  "#84cc16",
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
  "#0ea5e9",
];

export default function ChartPanel({
  rows,
  chart,
}: {
  rows: any[];
  chart: ChartSpec;
}) {
  const { type, xField, yField, seriesField, title } = chart;

  const normalized = useMemo(
    () =>
      rows.map((r) => {
        const out: any = { ...r };
        if (typeof out[yField] === "string")
          out[yField] = Number(out[yField]) || 0;
        return out;
      }),
    [rows, yField]
  );

  const { data: wide, series } = useMemo(
    () => pivotLongToWide(normalized, xField, yField, seriesField),
    [normalized, xField, yField, seriesField]
  );

  const seriesSorted = useMemo(
    () =>
      (series ?? []).slice().sort((a, b) => String(a).localeCompare(String(b))),
    [series]
  );

  if (!rows.length)
    return <p className="text-sm text-slate-400">No data for this query.</p>;
  const Title = () =>
    title ? <h3 className="font-semibold mb-2">{title}</h3> : null;

  if (type === "pie") {
    return (
      <div className="card">
        <Title />
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Pie data={normalized} dataKey={yField} nameKey={xField} label>
              {normalized.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="card">
        <Title />
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={wide}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xField}
              tickFormatter={(v) => truncateLabel(v)}
              interval={0}
              tickMargin={8}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            {seriesField && seriesSorted.length ? (
              seriesSorted.map((s, i) => (
                <Line
                  key={s}
                  dataKey={s}
                  name={s}
                  stroke={PALETTE[i % PALETTE.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))
            ) : (
              <Line
                dataKey={yField}
                stroke={PALETTE[0]}
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="card">
      <Title />
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={wide}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xField}
            tickFormatter={(v) => truncateLabel(v)}
            interval={0}
            tickMargin={8}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {seriesField && seriesSorted.length ? (
            seriesSorted.map((s, i) => (
              <Bar
                key={s}
                dataKey={s}
                name={s}
                fill={PALETTE[i % PALETTE.length]}
              />
            ))
          ) : (
            <Bar dataKey={yField} name={yField}>
              {wide.map((d: any, i: number) => (
                <Cell key={i} fill={colorFor(String(d[xField]))} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
