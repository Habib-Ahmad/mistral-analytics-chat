import { Pool } from "pg";
import countries from "world-countries";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS countries (
      code CHAR(2) PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  const rows = countries
    .map((c: any) => ({
      code: String(c.cca2 || "")
        .toUpperCase()
        .trim(),
      name: String(c.name?.common || "").trim(),
    }))
    .filter((r) => r.code.length === 2 && r.name.length > 0);

  console.log(`→ Upserting ${rows.length} countries…`);
  for (const r of rows) {
    await pool.query(
      `INSERT INTO countries(code, name)
       VALUES ($1, $2)
       ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name`,
      [r.code, r.name]
    );
  }

  console.log("✅ Countries seeded");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
