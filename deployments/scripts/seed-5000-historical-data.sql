-- SQL Data Seeder: Populate 5,000+ Historical Transaction Records (Jan 2026 - Aug 2026)

\connect pos_sales_db;

INSERT INTO orders (id, order_number, client_order_uuid, cashier_user_id, subtotal, tax_amount, discount_amount, grand_total, payment_method, payment_status, order_status, created_at)
SELECT
    gen_random_uuid(),
    'POS-2026-' || LPAD(i::text, 5, '0'),
    'CLI-' || LPAD(i::text, 5, '0'),
    '00000000-0000-0000-0000-000000000001'::uuid,
    (15000 + (i % 25) * 10000)::numeric(15,2),
    ((15000 + (i % 25) * 10000) * 0.11)::numeric(15,2),
    0,
    ((15000 + (i % 25) * 10000) * 1.11)::numeric(15,2),
    CASE WHEN i % 3 = 0 THEN 'QRIS' WHEN i % 3 = 1 THEN 'Cash' ELSE 'EDC_Debit' END,
    'paid',
    'completed',
    ('2026-01-01 08:00:00'::timestamp + (i * interval '1 hour 15 minutes'))
FROM generate_series(1, 5000) AS i
ON CONFLICT (order_number) DO NOTHING;

\connect inventory_db;

INSERT INTO stock_movements (id, product_id, warehouse_id, type, quantity, stock_before, stock_after, reference_type, reference_id, notes, created_by, created_at)
SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    CASE WHEN i % 5 = 0 THEN 'in_purchase' ELSE 'out_sale' END,
    (1 + (i % 5)),
    (1000 - i),
    (1000 - i - (1 + (i % 5))),
    'sales_order',
    gen_random_uuid(),
    'Transaksi POS Penjualan Kasir Cabang Jakarta',
    '00000000-0000-0000-0000-000000000001'::uuid,
    ('2026-01-01 08:00:00'::timestamp + (i * interval '1 hour 15 minutes'))
FROM generate_series(1, 5000) AS i;
