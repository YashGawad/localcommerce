-- ==============================================================================
-- LocalCommerce PostgreSQL 18 Production Schema
-- Defines all 19 application tables, primary keys, check constraints, foreign keys, and indexes.
-- Idempotent: safe to run against new or existing PostgreSQL databases.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. INDEPENDENT / ROOT TABLES
-- ==============================================================================

-- 1.1 Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id uuid DEFAULT uuidv4() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    monthly_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    annual_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    max_products integer,
    max_staff integer,
    analytics_enabled boolean DEFAULT false NOT NULL,
    custom_domain_enabled boolean DEFAULT false NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
    CONSTRAINT subscription_plans_name_key UNIQUE (name),
    CONSTRAINT subscription_plans_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);

-- 1.2 Platform Settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id uuid DEFAULT uuidv4() NOT NULL,
    setting_key character varying(100) NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT platform_settings_pkey PRIMARY KEY (id),
    CONSTRAINT platform_settings_setting_key_key UNIQUE (setting_key)
);

-- 1.3 Users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT uuidv4() NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(30) DEFAULT 'customer'::character varying NOT NULL,
    phone character varying(20),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'business_owner'::character varying, 'staff'::character varying, 'delivery_staff'::character varying, 'admin'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'inactive'::character varying])::text[])))
);

-- 1.4 Stores
CREATE TABLE IF NOT EXISTS public.stores (
    id uuid DEFAULT uuidv4() NOT NULL,
    name character varying(150) NOT NULL,
    slug character varying(160) NOT NULL,
    description text,
    phone character varying(20),
    email character varying(255),
    address character varying(255),
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    latitude numeric(10,7),
    longitude numeric(10,7),
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT stores_pkey PRIMARY KEY (id),
    CONSTRAINT stores_slug_key UNIQUE (slug),
    CONSTRAINT stores_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'suspended'::character varying])::text[])))
);

-- 1.5 Global Products (Canonical Platform Catalog)
CREATE TABLE IF NOT EXISTS public.global_products (
    id uuid DEFAULT uuidv4() NOT NULL,
    name character varying(200) NOT NULL,
    brand character varying(100),
    description text,
    barcode character varying(50),
    unit character varying(50) DEFAULT 'piece'::character varying NOT NULL,
    mrp numeric(10,2) NOT NULL,
    image_url text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT global_products_pkey PRIMARY KEY (id),
    CONSTRAINT global_products_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);

-- ==============================================================================
-- 2. FIRST-TIER DEPENDENT TABLES
-- ==============================================================================

-- 2.1 Customers
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid DEFAULT uuidv4() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT customers_pkey PRIMARY KEY (id),
    CONSTRAINT customers_user_id_key UNIQUE (user_id),
    CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2.2 Store Users (Staff and Owner association)
CREATE TABLE IF NOT EXISTS public.store_users (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(30) DEFAULT 'staff'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT store_users_pkey PRIMARY KEY (id),
    CONSTRAINT store_users_store_id_user_id_key UNIQUE (store_id, user_id),
    CONSTRAINT store_users_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'manager'::character varying, 'staff'::character varying, 'delivery_staff'::character varying])::text[]))),
    CONSTRAINT store_users_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT store_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- 2.3 Store Settings
CREATE TABLE IF NOT EXISTS public.store_settings (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    is_online boolean DEFAULT true NOT NULL,
    accepting_orders boolean DEFAULT true NOT NULL,
    pickup_enabled boolean DEFAULT true NOT NULL,
    delivery_enabled boolean DEFAULT true NOT NULL,
    shipping_enabled boolean DEFAULT false NOT NULL,
    delivery_base_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    free_delivery_threshold numeric(10,2),
    minimum_order_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    maximum_delivery_radius numeric(6,2),
    tax_enabled boolean DEFAULT false NOT NULL,
    tax_percentage numeric(5,2) DEFAULT 0.00 NOT NULL,
    business_hours jsonb DEFAULT '{}'::jsonb NOT NULL,
    payment_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    notification_settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT store_settings_pkey PRIMARY KEY (id),
    CONSTRAINT store_settings_store_id_key UNIQUE (store_id),
    CONSTRAINT store_settings_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 2.4 Store Subscriptions
CREATE TABLE IF NOT EXISTS public.store_subscriptions (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    billing_cycle character varying(20) DEFAULT 'monthly'::character varying NOT NULL,
    starts_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT store_subscriptions_pkey PRIMARY KEY (id),
    CONSTRAINT store_subscriptions_billing_cycle_check CHECK (((billing_cycle)::text = ANY ((ARRAY['monthly'::character varying, 'annual'::character varying])::text[]))),
    CONSTRAINT store_subscriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'expired'::character varying, 'cancelled'::character varying, 'trial'::character varying])::text[]))),
    CONSTRAINT store_subscriptions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT store_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id)
);

-- 2.5 Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    image_url text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_store_id_name_key UNIQUE (store_id, name),
    CONSTRAINT categories_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))),
    CONSTRAINT categories_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 2.6 Discounts
CREATE TABLE IF NOT EXISTS public.discounts (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    name character varying(120) NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    minimum_order_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    maximum_discount_amount numeric(10,2),
    usage_limit integer,
    used_count integer DEFAULT 0 NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT discounts_pkey PRIMARY KEY (id),
    CONSTRAINT discounts_store_id_code_key UNIQUE (store_id, code),
    CONSTRAINT discounts_discount_type_check CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[]))),
    CONSTRAINT discounts_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'expired'::character varying])::text[]))),
    CONSTRAINT discounts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 2.7 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid,
    user_id uuid,
    type character varying(50) NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 3. SECOND-TIER DEPENDENT TABLES
-- ==============================================================================

-- 3.1 Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id uuid DEFAULT uuidv4() NOT NULL,
    customer_id uuid NOT NULL,
    label character varying(50) NOT NULL,
    recipient_name character varying(120) NOT NULL,
    phone character varying(20),
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    latitude numeric(10,7),
    longitude numeric(10,7),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT customer_addresses_pkey PRIMARY KEY (id),
    CONSTRAINT customer_addresses_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);

-- 3.2 Store Products
CREATE TABLE IF NOT EXISTS public.store_products (
    id uuid DEFAULT uuidv4() NOT NULL,
    store_id uuid NOT NULL,
    global_product_id uuid,
    category_id uuid,
    name character varying(200) NOT NULL,
    description text,
    sku character varying(100),
    price numeric(10,2) NOT NULL,
    cost_price numeric(10,2),
    stock_quantity numeric(10,3) DEFAULT 0 NOT NULL,
    low_stock_threshold numeric(10,3) DEFAULT 5 NOT NULL,
    unit character varying(50) DEFAULT 'piece'::character varying NOT NULL,
    image_url text,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT store_products_pkey PRIMARY KEY (id),
    CONSTRAINT store_products_store_id_sku_key UNIQUE (store_id, sku),
    CONSTRAINT store_products_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'archived'::character varying])::text[]))),
    CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT store_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL,
    CONSTRAINT store_products_global_product_id_fkey FOREIGN KEY (global_product_id) REFERENCES public.global_products(id) ON DELETE SET NULL
);

-- 3.3 Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT uuidv4() NOT NULL,
    order_number character varying(50) NOT NULL,
    store_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    status character varying(30) DEFAULT 'PLACED'::character varying NOT NULL,
    fulfillment_type character varying(30) DEFAULT 'delivery'::character varying NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    discount_id uuid,
    payment_method character varying(30) DEFAULT 'cod'::character varying NOT NULL,
    payment_status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    delivery_address_line1 character varying(255),
    delivery_address_line2 character varying(255),
    delivery_address_city character varying(100),
    delivery_address_state character varying(100),
    delivery_address_postal_code character varying(20),
    delivery_recipient_name character varying(120),
    delivery_recipient_phone character varying(20),
    customer_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_order_number_key UNIQUE (order_number),
    CONSTRAINT orders_fulfillment_type_check CHECK (((fulfillment_type)::text = ANY ((ARRAY['pickup'::character varying, 'delivery'::character varying])::text[]))),
    CONSTRAINT orders_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PLACED'::character varying, 'CONFIRMED'::character varying, 'PREPARING'::character varying, 'READY'::character varying, 'OUT_FOR_DELIVERY'::character varying, 'DELIVERED'::character varying, 'READY_FOR_PICKUP'::character varying, 'PICKED_UP'::character varying, 'CANCELLED'::character varying])::text[]))),
    CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id),
    CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
    CONSTRAINT orders_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id) ON DELETE SET NULL
);

-- ==============================================================================
-- 4. THIRD-TIER DEPENDENT TABLES (Order Transactions)
-- ==============================================================================

-- 4.1 Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT uuidv4() NOT NULL,
    order_id uuid NOT NULL,
    store_product_id uuid,
    product_name character varying(200) NOT NULL,
    sku character varying(100),
    unit_price numeric(10,2) NOT NULL,
    quantity numeric(10,3) NOT NULL,
    line_total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT order_items_store_product_id_fkey FOREIGN KEY (store_product_id) REFERENCES public.store_products(id) ON DELETE SET NULL
);

-- 4.2 Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT uuidv4() NOT NULL,
    order_id uuid NOT NULL,
    payment_method character varying(30) NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    transaction_reference character varying(100),
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_order_id_key UNIQUE (order_id),
    CONSTRAINT payments_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'FAILED'::character varying, 'REFUNDED'::character varying])::text[]))),
    CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- 4.3 Delivery Assignments
CREATE TABLE IF NOT EXISTS public.delivery_assignments (
    id uuid DEFAULT uuidv4() NOT NULL,
    order_id uuid NOT NULL,
    store_id uuid NOT NULL,
    delivery_staff_user_id uuid NOT NULL,
    status character varying(30) DEFAULT 'assigned'::character varying NOT NULL,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    started_at timestamp with time zone,
    delivered_at timestamp with time zone,
    failure_reason text,
    otp_verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT delivery_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT delivery_assignments_order_id_key UNIQUE (order_id),
    CONSTRAINT delivery_assignments_status_check CHECK (((status)::text = ANY ((ARRAY['assigned'::character varying, 'out_for_delivery'::character varying, 'delivered'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT delivery_assignments_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT delivery_assignments_delivery_staff_user_id_fkey FOREIGN KEY (delivery_staff_user_id) REFERENCES public.users(id)
);

-- 4.4 Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT uuidv4() NOT NULL,
    customer_id uuid NOT NULL,
    order_id uuid,
    store_id uuid,
    global_product_id uuid,
    rating integer NOT NULL,
    comment text,
    status character varying(20) DEFAULT 'published'::character varying NOT NULL,
    moderator_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT reviews_pkey PRIMARY KEY (id),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT reviews_status_check CHECK (((status)::text = ANY ((ARRAY['published'::character varying, 'flagged'::character varying, 'archived'::character varying])::text[]))),
    CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE,
    CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
    CONSTRAINT reviews_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
    CONSTRAINT reviews_global_product_id_fkey FOREIGN KEY (global_product_id) REFERENCES public.global_products(id) ON DELETE CASCADE
);

-- ==============================================================================
-- 5. INDEXES
-- ==============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON public.users USING btree (lower((email)::text));
CREATE UNIQUE INDEX IF NOT EXISTS global_products_barcode_unique_idx ON public.global_products USING btree (barcode) WHERE (barcode IS NOT NULL);

CREATE INDEX IF NOT EXISTS store_users_store_id_idx ON public.store_users USING btree (store_id);
CREATE INDEX IF NOT EXISTS store_users_user_id_idx ON public.store_users USING btree (user_id);

CREATE INDEX IF NOT EXISTS store_subscriptions_store_id_idx ON public.store_subscriptions USING btree (store_id);

CREATE INDEX IF NOT EXISTS categories_store_id_idx ON public.categories USING btree (store_id);

CREATE INDEX IF NOT EXISTS store_products_store_id_idx ON public.store_products USING btree (store_id);
CREATE INDEX IF NOT EXISTS store_products_category_id_idx ON public.store_products USING btree (category_id);
CREATE INDEX IF NOT EXISTS store_products_global_product_id_idx ON public.store_products USING btree (global_product_id);

CREATE INDEX IF NOT EXISTS orders_store_id_idx ON public.orders USING btree (store_id);
CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON public.orders USING btree (customer_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders USING btree (status);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items USING btree (order_id);

CREATE INDEX IF NOT EXISTS delivery_assignments_store_id_idx ON public.delivery_assignments USING btree (store_id);
CREATE INDEX IF NOT EXISTS delivery_assignments_staff_idx ON public.delivery_assignments USING btree (delivery_staff_user_id);

CREATE INDEX IF NOT EXISTS reviews_store_id_idx ON public.reviews USING btree (store_id);
CREATE INDEX IF NOT EXISTS reviews_global_product_id_idx ON public.reviews USING btree (global_product_id);

CREATE INDEX IF NOT EXISTS notifications_store_id_idx ON public.notifications USING btree (store_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications USING btree (user_id);
