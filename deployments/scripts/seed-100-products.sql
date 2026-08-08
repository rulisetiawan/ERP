-- SQL Seeder: Populate 100 Realistic Retail Products into inventory_db

\connect inventory_db;

INSERT INTO products (id, sku, barcode, name, description, unit, buy_price, sell_price, min_stock_alert, image_minio_url, created_at)
VALUES
  (gen_random_uuid(), 'SKU-001', '899100100001', 'Susu UHT Full Cream 1L', 'Susu segar UHT rasa original 1 Liter', 'Pcs', 15000, 19500, 10, '', NOW()),
  (gen_random_uuid(), 'SKU-002', '899100100002', 'Roti Tawar Premium 500g', 'Roti tawar gandum lembut', 'Pcs', 11000, 15000, 5, '', NOW()),
  (gen_random_uuid(), 'SKU-003', '899100100003', 'Kopi Gula Aren 250ml', 'Kopi susu gula aren kekinian', 'Botol', 8500, 12000, 15, '', NOW()),
  (gen_random_uuid(), 'SKU-004', '899100100004', 'Air Mineral Botol 600ml', 'Air mineral murni pegunungan', 'Botol', 2500, 4000, 20, '', NOW()),
  (gen_random_uuid(), 'SKU-005', '899100100005', 'Keripik Kentang BBQ 68g', 'Snack keripik kentang renyah rasa BBQ', 'Pcs', 9000, 13500, 10, '', NOW()),
  (gen_random_uuid(), 'SKU-006', '899100100006', 'Teh Hijau Jasmine 350ml', 'Teh hijau melati tanpa gula', 'Botol', 5000, 7500, 15, '', NOW()),
  (gen_random_uuid(), 'SKU-007', '899100100007', 'Cokelat Batangan Milk 65g', 'Cokelat manis dengan susu', 'Pcs', 12000, 17500, 8, '', NOW()),
  (gen_random_uuid(), 'SKU-008', '899100100008', 'Mie Instant Goreng Spesial 85g', 'Mie goreng rasa original', 'Pcs', 2800, 3800, 30, '', NOW()),
  (gen_random_uuid(), 'SKU-009', '899100100009', 'Biskuit Sandwich Cokelat 133g', 'Biskuit renyah krim cokelat', 'Pcs', 7500, 11000, 12, '', NOW()),
  (gen_random_uuid(), 'SKU-010', '899100100010', 'Jus Jeruk Fresh 300ml', 'Jus jeruk murni dingin', 'Botol', 10000, 15000, 10, '', NOW())
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  sell_price = EXCLUDED.sell_price,
  buy_price = EXCLUDED.buy_price;

-- Insert remaining 90 products dynamically
INSERT INTO products (id, sku, barcode, name, description, unit, buy_price, sell_price, min_stock_alert, image_minio_url, created_at)
SELECT
  gen_random_uuid(),
  'SKU-' || LPAD(i::text, 3, '0'),
  '899100100' || LPAD(i::text, 3, '0'),
  CASE 
    WHEN i % 10 = 1 THEN 'Kopi Cold Brew Bottled ' || i || '00ml'
    WHEN i % 10 = 2 THEN 'Susu Kedelai Organik ' || i || '00ml'
    WHEN i % 10 = 3 THEN 'Roti Croissant Butter Premium ' || i
    WHEN i % 10 = 4 THEN 'Minuman Isotonik Lemon ' || i || '0ml'
    WHEN i % 10 = 5 THEN 'Permen Mint Segar Pack ' || i
    WHEN i % 10 = 6 THEN 'Sabun Mandi Cair Refill ' || i || '00ml'
    WHEN i % 10 = 7 THEN 'Shampoo Anti Dandruff ' || i || '0ml'
    WHEN i % 10 = 8 THEN 'Pasta Gigi Herbal ' || i || '0g'
    WHEN i % 10 = 9 THEN 'Tisu Wajah 2-Ply ' || i || '00s'
    ELSE 'Snack Popcorn Karamel ' || i || '0g'
  END,
  'Deskripsi produk retail inventaris toko #' || i,
  CASE WHEN i % 4 = 0 THEN 'Botol' WHEN i % 4 = 1 THEN 'Pcs' WHEN i % 4 = 2 THEN 'Pack' ELSE 'Kotak' END,
  (3000 + (i % 30) * 1500)::numeric(15,2),
  (4500 + (i % 30) * 2200)::numeric(15,2),
  (5 + (i % 10)),
  '',
  NOW()
FROM generate_series(11, 100) AS i
ON CONFLICT (sku) DO NOTHING;

