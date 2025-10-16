export const CATALOG = `
Tables (PostgreSQL). Use exact names. SELECT-only.

users(id, country, signup_date)
vendors(id, name, rating)
categories(id, name, parent_id)
products(id, vendor_id, category_id, price, created_at)
orders(id, user_id, order_date, status, total_amount)
order_items(order_id, product_id, qty, unit_price)
warehouses(id, city, region)
shipments(id, order_id, warehouse_id, carrier, shipped_at, delivered_at)
countries(code CHAR(2), name TEXT)

Business notes:
- Revenue = SUM(order_items.qty * order_items.unit_price).
- Time series: use date_trunc('month', orders.order_date) as month.
- Orders DO NOT have vendor_id. To reach vendor: orders -> order_items -> products -> vendors.
- Delivery time = delivered_at - shipped_at (use shipments + warehouses).
- To display country names, join users.country (code) to countries.code.
`;
