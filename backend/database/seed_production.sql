-- ==============================================================================
-- LocalCommerce Production Catalog Seed Data
-- Safe catalog & configuration seed data for PostgreSQL 18 on Render.
-- Excludes all transactional data (orders, items, payments, deliveries, reviews, test users).
-- ==============================================================================

-- 1. Subscription Plans (4 tiers)
INSERT INTO public.subscription_plans ("id", "name", "description", "monthly_price", "annual_price", "max_products", "max_staff", "analytics_enabled", "custom_domain_enabled", "status", "created_at", "updated_at")
VALUES
('90000000-0000-0000-0000-000000000001', 'Free', 'Basic plan for getting started.', '0.00', '0.00', 50, 1, FALSE, FALSE, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('90000000-0000-0000-0000-000000000002', 'Starter', 'For small local businesses.', '499.00', '4990.00', 250, 3, TRUE, FALSE, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('90000000-0000-0000-0000-000000000003', 'Business', 'For growing local businesses.', '999.00', '9990.00', 1000, 10, TRUE, TRUE, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('90000000-0000-0000-0000-000000000004', 'Pro', 'Advanced features for established businesses.', '1999.00', '19990.00', NULL, NULL, TRUE, TRUE, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 2. Platform Settings (Global Defaults)
INSERT INTO public.platform_settings ("id", "setting_key", "setting_value", "description", "updated_at")
VALUES
('952784a0-2512-4dac-b181-1260c6108cdb', 'default_delivery_radius', '10'::jsonb, 'Default delivery radius in kilometres.', CURRENT_TIMESTAMP),
('eaf86020-a48d-4e8e-bdb8-fae73f6f371b', 'maintenance_mode', 'false'::jsonb, 'Controls whether the LocalCommerce platform is in maintenance mode.', CURRENT_TIMESTAMP),
('80db5374-3bf7-49c5-8644-de34fbf1e4e4', 'platform_commission', '0'::jsonb, 'Platform commission percentage.', CURRENT_TIMESTAMP),
('f67aafb7-82df-4be7-a146-6ca9982cfb67', 'support_email', '"support@localcommerce.example"'::jsonb, 'Platform support email.', CURRENT_TIMESTAMP)
ON CONFLICT ("setting_key") DO NOTHING;

-- 3. Core Administrative & Store Accounts (Valid Bcrypt Passwords)
INSERT INTO public.users ("id", "name", "email", "password_hash", "role", "phone", "status", "created_at", "updated_at")
VALUES
('00000000-0000-0000-0000-000000000005', 'Platform Admin', 'admin@example.com', '$2b$10$LeKhE/sWJOepyLzXUbKOZOPQC9X9DiyJjYuWsCuKECkhBR8qfjnBG', 'admin', '9876543214', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000002', 'Demo Owner', 'owner@example.com', '$2b$10$LeKhE/sWJOepyLzXUbKOZOPQC9X9DiyJjYuWsCuKECkhBR8qfjnBG', 'business_owner', '9876543211', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000003', 'Demo Staff', 'staff@example.com', '$2b$10$LeKhE/sWJOepyLzXUbKOZOPQC9X9DiyJjYuWsCuKECkhBR8qfjnBG', 'staff', '9876543212', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000004', 'Demo Delivery Staff', 'delivery@example.com', '$2b$10$LeKhE/sWJOepyLzXUbKOZOPQC9X9DiyJjYuWsCuKECkhBR8qfjnBG', 'delivery_staff', '9876543213', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d1741bd1-692c-46c7-b168-b14d0f767a28', 'Raj Gawad', 'raj@gmail.com', '$2b$10$x2e4b5/PSABCDLsJXPNqTeuSTfa841r7HbD4yNNqeHiJsjD8pwhHu', 'business_owner', '1234567890', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0448d9c2-29c1-4c01-b4ef-e52c087369f0', 'Deliveryman1', 'deliveryman1@gmail.com', '$2b$10$sXI1r7vm1ASUHJQJBDuiau3kEC.VFeizZa/6Hkk7GBjNXDidIz7za', 'delivery_staff', '1234567890', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 4. Initial Stores
INSERT INTO public.stores ("id", "name", "slug", "description", "phone", "email", "address", "city", "state", "postal_code", "latitude", "longitude", "status", "created_at", "updated_at")
VALUES
('10000000-0000-0000-0000-000000000001', 'Sharma Supermarket', 'sharma-supermarket', 'Your neighbourhood supermarket for everyday essentials.', '9876500001', 'sharma@example.com', 'Main Market Road', 'Thane', 'Maharashtra', '400601', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('10000000-0000-0000-0000-000000000002', 'Shree Kirana', 'shree-kirana', 'Local grocery store serving everyday household needs.', '9876500002', 'shree@example.com', 'Station Road', 'Thane', 'Maharashtra', '400602', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33ab78b0-cfd3-43de-92d3-41e0cd61bd3d', 'Raj Store', 'raj-store', 'Quality provisions and daily groceries.', '1234567890', 'raj@gmail.com', 'shop No. 4, Palghar', 'Mumbai', 'Maharashtra', '40001', NULL, NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 5. Store Staff & Ownership Assignments
INSERT INTO public.store_users ("id", "store_id", "user_id", "role", "created_at")
VALUES
('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'owner', CURRENT_TIMESTAMP),
('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'staff', CURRENT_TIMESTAMP),
('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'delivery_staff', CURRENT_TIMESTAMP),
('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'delivery_staff', CURRENT_TIMESTAMP),
('0c7bf830-6b2c-4a9d-b4d9-07b7b471d0b9', '33ab78b0-cfd3-43de-92d3-41e0cd61bd3d', 'd1741bd1-692c-46c7-b168-b14d0f767a28', 'owner', CURRENT_TIMESTAMP),
('791eb300-754a-42e0-9650-0cbd06e759cb', '33ab78b0-cfd3-43de-92d3-41e0cd61bd3d', '0448d9c2-29c1-4c01-b4ef-e52c087369f0', 'delivery_staff', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 6. Store Settings (Operational parameters)
INSERT INTO public.store_settings ("id", "store_id", "is_online", "accepting_orders", "pickup_enabled", "delivery_enabled", "shipping_enabled", "delivery_base_fee", "free_delivery_threshold", "minimum_order_amount", "maximum_delivery_radius", "tax_enabled", "tax_percentage", "business_hours", "payment_settings", "notification_settings", "created_at", "updated_at")
VALUES
('b37d2c87-5b84-4d4c-b11a-af9a4d2c8f5d', '10000000-0000-0000-0000-000000000001', TRUE, TRUE, TRUE, TRUE, FALSE, '30.00', '500.00', '100.00', '8.00', TRUE, '5.00', '{"friday":"08:00-22:00","monday":"08:00-22:00","sunday":"09:00-21:00","tuesday":"08:00-22:00","saturday":"08:00-22:00","thursday":"08:00-22:00","wednesday":"08:00-22:00"}'::jsonb, '{"cod":true,"upi":true,"card":true,"net_banking":true}'::jsonb, '{"low_stock":true,"new_orders":true,"delivery_updates":true}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('46f214f0-39a2-48f5-9f41-cc535869b565', '10000000-0000-0000-0000-000000000002', TRUE, TRUE, TRUE, TRUE, FALSE, '25.00', '400.00', '100.00', '6.00', FALSE, '0.00', '{"friday":"08:00-21:00","monday":"08:00-21:00","sunday":"09:00-20:00","tuesday":"08:00-21:00","saturday":"08:00-21:00","thursday":"08:00-21:00","wednesday":"08:00-21:00"}'::jsonb, '{"cod":true,"upi":true,"card":false,"net_banking":false}'::jsonb, '{"low_stock":true,"new_orders":true,"delivery_updates":true}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a1677376-e8f1-4ff8-aecc-14bd7adcdb44', '33ab78b0-cfd3-43de-92d3-41e0cd61bd3d', TRUE, TRUE, TRUE, TRUE, FALSE, '20.00', '350.00', '50.00', '10.00', FALSE, '0.00', '{"friday":"09:00-21:00","monday":"09:00-21:00","sunday":"09:00-21:00","tuesday":"09:00-21:00","saturday":"09:00-21:00","thursday":"09:00-21:00","wednesday":"09:00-21:00"}'::jsonb, '{"cod":true,"upi":true}'::jsonb, '{"low_stock":true,"new_orders":true,"delivery_updates":true}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 7. Store Subscriptions
INSERT INTO public.store_subscriptions ("id", "store_id", "plan_id", "status", "billing_cycle", "starts_at", "ends_at", "created_at", "updated_at")
VALUES
('91000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000003', 'active', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('91000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000002', 'trial', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 8. Categories
INSERT INTO public.categories ("id", "store_id", "name", "description", "image_url", "status", "created_at", "updated_at")
VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Dairy', 'Milk, butter, and dairy products', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Staples', 'Everyday cooking essentials and grains', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Bakery', 'Fresh bread and bakery goods', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Grocery', 'Daily packaged grocery items', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Snacks', 'Tea-time snacks and packaged biscuits', NULL, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 9. Global Products (Standard Brand Catalog)
INSERT INTO public.global_products ("id", "name", "brand", "description", "barcode", "unit", "mrp", "image_url", "status", "created_at", "updated_at")
VALUES
('20000000-0000-0000-0000-000000000001', 'Amul Taaza Milk 1L', 'Amul', 'Fresh pasteurized toned milk.', '8901262150011', 'litre', '72.00', 'https://placehold.co/600x600?text=Amul+Milk', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000002', 'Tata Salt 1kg', 'Tata', 'Vacuum evaporated iodized salt.', '8901030310010', 'kg', '30.00', 'https://placehold.co/600x600?text=Tata+Salt', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000003', 'Britannia Milk Bread', 'Britannia', 'Soft, wholesome white milk bread.', '8901063010012', 'piece', '45.00', 'https://placehold.co/600x600?text=Britannia+Bread', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20000000-0000-0000-0000-000000000004', 'Parle-G Biscuits 800g', 'Parle', 'Original glucose biscuits.', '8901719110015', 'pack', '80.00', 'https://placehold.co/600x600?text=Parle-G', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 10. Store Products (Store Catalog & Inventory)
INSERT INTO public.store_products ("id", "store_id", "global_product_id", "category_id", "name", "description", "sku", "price", "cost_price", "stock_quantity", "low_stock_threshold", "unit", "image_url", "status", "created_at", "updated_at")
VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Amul Taaza Milk 1L', 'Fresh toned milk.', 'SH-MILK-001', '68.00', '61.00', 50.000, 10.000, 'litre', 'https://placehold.co/600x600?text=Amul+Milk', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'Tata Salt 1kg', 'Iodized salt.', 'SH-SALT-001', '28.00', '23.00', 100.000, 15.000, 'kg', 'https://placehold.co/600x600?text=Tata+Salt', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Britannia Milk Bread', 'Soft white milk bread.', 'SH-BREAD-001', '42.00', '35.00', 40.000, 8.000, 'piece', 'https://placehold.co/600x600?text=Britannia+Bread', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', NULL, '30000000-0000-0000-0000-000000000002', 'Sharma Special Masala 100g', 'Store-created spice blend.', 'SH-MASALA-001', '55.00', '40.00', 30.000, 5.000, 'pack', 'https://placehold.co/600x600?text=Special+Masala', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'Amul Taaza Milk 1L', 'Fresh toned milk.', 'SK-MILK-001', '70.00', '62.00', 35.000, 8.000, 'litre', 'https://placehold.co/600x600?text=Amul+Milk', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000004', 'Tata Salt 1kg', 'Iodized salt.', 'SK-SALT-001', '30.00', '24.00', 60.000, 10.000, 'kg', 'https://placehold.co/600x600?text=Tata+Salt', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', 'Parle-G Biscuits 800g', 'Classic glucose biscuits.', 'SK-PARLEG-001', '76.00', '65.00', 50.000, 10.000, 'pack', 'https://placehold.co/600x600?text=Parle-G', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('40000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', NULL, '30000000-0000-0000-0000-000000000005', 'Shree Homemade Chivda 250g', 'Store-created savoury snack.', 'SK-CHIVDA-001', '90.00', '65.00', 25.000, 5.000, 'pack', 'https://placehold.co/600x600?text=Chivda', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e48843cd-c625-4905-a981-a8d9d337ce01', '33ab78b0-cfd3-43de-92d3-41e0cd61bd3d', NULL, NULL, 'Kolam Rice 50kg', 'Premium aged kolam rice bag.', 'RAJ-RICE-001', '55.00', '46.00', 20.000, 5.000, 'kg', 'https://placehold.co/400x400?text=Rice', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 11. Store Discounts / Promotional Coupons
INSERT INTO public.discounts ("id", "store_id", "name", "code", "discount_type", "discount_value", "minimum_order_amount", "maximum_discount_amount", "usage_limit", "used_count", "starts_at", "ends_at", "status", "created_at", "updated_at")
VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Welcome Discount', 'WELCOME10', 'percentage', '10.00', '300.00', '100.00', 500, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Flat ₹50 Off', 'SAVE50', 'fixed', '50.00', '300.00', NULL, 200, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
