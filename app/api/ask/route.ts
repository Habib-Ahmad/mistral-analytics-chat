import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CATALOG } from "@/lib/catalog";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

function guardSql(sql: string) {
  if (!/^\s*select/i.test(sql)) return "Query must start with SELECT";
  if (
    /(insert|update|delete|drop|alter|create|grant|revoke|copy|call|do|truncate|comment)\b/i.test(
      sql
    )
  )
    return "Only SELECT is allowed";
  if (/;[\s\S]*;/.test(sql)) return "Multiple statements not allowed";
  return null;
}

function ensureLimit(sql: string) {
  return /\blimit\b/i.test(sql)
    ? sql
    : `${sql.trim().replace(/;?$/, "")} LIMIT 200;`;
}

type ChartSpec = {
  type: "bar" | "line" | "pie";
  xField: string;
  yField: string;
  seriesField?: string | null;
  title?: string;
};

type Plan = {
  sql: string;
  chart?: ChartSpec | null;
  explanation?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question: string = String(body?.question ?? "").trim();
    const model: string = String(body?.model || "mistral-small-latest");

    if (!question) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const messages = [
      {
        role: "system" as const,
        content: `${SYSTEM_PROMPT}\n\nCatalog:\n${CATALOG}`,
      },
      {
        role: "user" as const,
        content: `Question: ${question}\nReturn JSON only.`,
      },
    ];

    const start = Date.now();
    let plan: Plan;
    try {
      const res = await mistral.chat.complete({
        model,
        messages,
        responseFormat: { type: "json_object" },
      });

      const content = res.choices[0]?.message?.content || "";
      const text =
        typeof content === "string" ? content : JSON.stringify(content);
      plan = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Model did not return valid JSON" },
        { status: 400 }
      );
    }
    const latencyMs = Date.now() - start;

    let sql = String(plan.sql || "");
    const guardErr = guardSql(sql);
    if (guardErr)
      return NextResponse.json({ error: guardErr, plan }, { status: 400 });
    sql = ensureLimit(sql);

    const { rows } = await db.query(sql);

    let normalized = rows.map((row: any) => {
      if (typeof row.revenue === "string")
        row.revenue = parseFloat(row.revenue);
      if (typeof row.order_count === "string")
        row.order_count = parseInt(row.order_count, 10);
      if (typeof row.avg_hours === "string")
        row.avg_hours = parseFloat(row.avg_hours);

      if ("month" in row) {
        if (row.month instanceof Date)
          row.month = row.month.toISOString().slice(0, 7); // YYYY-MM
        else if (typeof row.month !== "string") delete row.month;
      }

      return row;
    });

    return NextResponse.json({
      rows: normalized,
      chart: plan.chart ?? null,
      explanation: plan.explanation ?? "",
      sql,
      model,
      latencyMs,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
