import { Pool } from "pg";
import { faker } from "@faker-js/faker";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const carriers = ["DHL", "UPS", "FedEx", "La Poste"];
const regions = ["North", "South", "East", "West", "Central"];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      country CHAR(2) NOT NULL,
      signup_date DATE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      rating NUMERIC(2,1) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INT REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      vendor_id INT NOT NULL REFERENCES vendors(id),
      category_id INT NOT NULL REFERENCES categories(id),
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id),
      order_date TIMESTAMP NOT NULL,
      status TEXT NOT NULL,
      total_amount NUMERIC(12,2) DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS order_items (
      order_id INT NOT NULL REFERENCES orders(id),
      product_id INT NOT NULL REFERENCES products(id),
      qty INT NOT NULL,
      unit_price NUMERIC(10,2) NOT NULL,
      PRIMARY KEY (order_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id SERIAL PRIMARY KEY,
      city TEXT NOT NULL,
      region TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      order_id INT NOT NULL REFERENCES orders(id),
      warehouse_id INT NOT NULL REFERENCES warehouses(id),
      carrier TEXT NOT NULL,
      shipped_at TIMESTAMP,
      delivered_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS countries (
      code CHAR(2) PRIMARY KEY,
      name TEXT NOT NULL
    );

    -- light indexes (optional but handy)
    CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_shipments_carrier ON shipments(carrier);
  `);
}

async function seedUsers(target = 500) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM users`);
  if (rows[0].c > 0) return;

  console.log("→ Seeding users…");
  for (let i = 0; i < target; i++) {
    await pool.query(`INSERT INTO users(country, signup_date) VALUES ($1,$2)`, [
      faker.location.countryCode(),
      faker.date.past({ years: 2 }),
    ]);
  }
}

async function seedVendors(target = 50) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM vendors`);
  if (rows[0].c > 0) return;

  console.log("→ Seeding vendors…");
  for (let i = 0; i < target; i++) {
    await pool.query(`INSERT INTO vendors(name, rating) VALUES ($1,$2)`, [
      faker.company.name(),
      faker.number.float({ min: 2, max: 5, fractionDigits: 1 }),
    ]);
  }
}

async function seedCategories() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM categories`
  );
  if (rows[0].c > 0) return;

  console.log("→ Seeding categories…");
  const cats = ["Electronics", "Fashion", "Home", "Toys", "Books"];
  for (const name of cats) {
    await pool.query(`INSERT INTO categories(name) VALUES ($1)`, [name]);
  }
}

async function ids(query: string): Promise<number[]> {
  const { rows } = await pool.query(query);
  return rows.map((r: any) => Number(r.id));
}

async function seedProducts(target = 200) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM products`);
  if (rows[0].c > 0) return;

  console.log("→ Seeding products…");
  const vendorIds = await ids(`SELECT id FROM vendors`);
  const categoryIds = await ids(`SELECT id FROM categories`);

  for (let i = 0; i < target; i++) {
    await pool.query(
      `INSERT INTO products(vendor_id, category_id, price, created_at)
       VALUES ($1,$2,$3,$4)`,
      [
        pick(vendorIds),
        pick(categoryIds),
        faker.number.int({ min: 10, max: 500 }),
        faker.date.past({ years: 1 }),
      ]
    );
  }
}

async function seedOrders(target = 1000) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM orders`);
  if (rows[0].c > 0) return;

  console.log("→ Seeding orders…");
  const userIds = await ids(`SELECT id FROM users`);

  for (let i = 0; i < target; i++) {
    await pool.query(
      `INSERT INTO orders(user_id, order_date, status, total_amount)
       VALUES ($1,$2,$3,$4)`,
      [
        pick(userIds),
        faker.date.between({ from: "2024-01-01", to: "2025-10-01" }),
        faker.helpers.arrayElement([
          "created",
          "paid",
          "shipped",
          "delivered",
          "returned",
        ]),
        0,
      ]
    );
  }
}

async function seedOrderItems() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM order_items`
  );
  if (rows[0].c > 0) return;

  console.log("→ Seeding order_items…");
  const prodRows = await pool.query(`SELECT id, price FROM products`);
  const prods = prodRows.rows as { id: number; price: string }[];

  const orderRows = await pool.query(`SELECT id FROM orders`);
  for (const { id: orderId } of orderRows.rows as { id: number }[]) {
    const lines = faker.number.int({ min: 1, max: 5 });
    const used = new Set<number>();
    for (let i = 0; i < lines; i++) {
      const p = pick(prods);
      if (used.has(p.id)) continue;
      used.add(p.id);
      const qty = faker.number.int({ min: 1, max: 4 });
      await pool.query(
        `INSERT INTO order_items(order_id, product_id, qty, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [orderId, p.id, qty, p.price]
      );
    }
  }

  // backfill orders.total_amount
  await pool.query(`
    UPDATE orders o
    SET total_amount = sub.total
    FROM (
      SELECT order_id, SUM(qty * unit_price) AS total
      FROM order_items
      GROUP BY order_id
    ) sub
    WHERE o.id = sub.order_id
  `);
}

async function seedWarehouses(target = 10) {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS c FROM warehouses`
  );
  if (rows[0].c > 0) return;

  console.log("→ Seeding warehouses…");
  for (let i = 0; i < target; i++) {
    await pool.query(`INSERT INTO warehouses(city, region) VALUES ($1,$2)`, [
      faker.location.city(),
      pick(regions),
    ]);
  }
}

async function seedShipments() {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM shipments`);
  if (rows[0].c > 0) return;

  console.log("→ Seeding shipments…");
  const whIds = await ids(`SELECT id FROM warehouses`);
  const orderRows = await pool.query(`SELECT id, order_date FROM orders`);
  for (const o of orderRows.rows as { id: number; order_date: Date }[]) {
    const shipped = new Date(o.order_date);
    shipped.setHours(
      shipped.getHours() + faker.number.int({ min: 6, max: 48 })
    );
    const delivered = new Date(shipped);
    delivered.setHours(
      delivered.getHours() + faker.number.int({ min: 12, max: 168 })
    );
    await pool.query(
      `INSERT INTO shipments(order_id, warehouse_id, carrier, shipped_at, delivered_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [o.id, pick(whIds), pick(carriers), shipped, delivered]
    );
  }
}

async function main() {
  console.log("Seeding database…");
  await createTables();

  await seedUsers(500);
  await seedVendors(50);
  await seedCategories();
  await seedProducts(200);
  await seedOrders(1000);
  await seedOrderItems();
  await seedWarehouses(10);
  await seedShipments();

  console.log("✅ Done seeding");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
