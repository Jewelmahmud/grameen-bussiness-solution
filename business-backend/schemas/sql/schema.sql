-- ============================================
-- INVENTORY MANAGEMENT SYSTEM - MODULAR MONOLITH
-- Architecture: Proper Modular Monolith with PostgreSQL Schemas
-- Target: Local Businesses in Bangladesh
-- ============================================

-- ============================================
-- MODULAR MONOLITH PRINCIPLES APPLIED:
-- ============================================
/*
1. SCHEMA SEPARATION: Each module has its own PostgreSQL schema
2. DATA OWNERSHIP: Each module owns its tables exclusively
3. MODULE INTERFACES: Cross-module access via views and functions
4. LOOSE COUPLING: No direct FK across module boundaries
5. EVENT-DRIVEN: Integration events table for async communication
6. DOMAIN EVENTS: Each module publishes domain events
7. SHARED KERNEL: Common types and utilities in shared schema

MODULE BOUNDARIES:
- Core: Tenant management (Auth handled by external auth server)
- Business: Business types, businesses, locations
- Catalog: Products, categories, brands, units
- Inventory: Stock, warehouses, movements
- Sales: Orders, POS, customers
- Purchasing: Purchase orders, suppliers
- Warranty: Warranty tracking and claims
- Finance: Payments, expenses
- Notification: Alerts and notifications
- Reporting: Analytics and reports

AUTHENTICATION:
- User authentication, registration, and authorization are handled by external auth server
- This system stores only tenant-specific business data
- User references use external user UUIDs from auth server
- Roles and permissions come from auth server response
*/

-- ============================================
-- SCHEMA CREATION FOR EACH MODULE
-- ============================================

-- Clean start: drop existing module schemas to avoid partial/duplicate objects
-- This allows rerunning this script to fully rebuild the schema.
DROP SCHEMA IF EXISTS marketplace CASCADE;
DROP SCHEMA IF EXISTS integration CASCADE;
DROP SCHEMA IF EXISTS reporting CASCADE;
DROP SCHEMA IF EXISTS notification CASCADE;
DROP SCHEMA IF EXISTS reports CASCADE;
DROP SCHEMA IF EXISTS payroll CASCADE;
DROP SCHEMA IF EXISTS hr CASCADE;
DROP SCHEMA IF EXISTS finance CASCADE;
DROP SCHEMA IF EXISTS warranty CASCADE;
DROP SCHEMA IF EXISTS purchasing CASCADE;
DROP SCHEMA IF EXISTS sales CASCADE;
DROP SCHEMA IF EXISTS inventory CASCADE;
DROP SCHEMA IF EXISTS catalog CASCADE;
DROP SCHEMA IF EXISTS business CASCADE;
DROP SCHEMA IF EXISTS core CASCADE;

-- Foundation modules
CREATE SCHEMA IF NOT EXISTS core;           -- Tenant, User, Auth
CREATE SCHEMA IF NOT EXISTS business;       -- Business management
CREATE SCHEMA IF NOT EXISTS catalog;        -- Product catalog
CREATE SCHEMA IF NOT EXISTS inventory;      -- Stock management
CREATE SCHEMA IF NOT EXISTS sales;          -- Sales & POS
CREATE SCHEMA IF NOT EXISTS purchasing;     -- Purchase orders
CREATE SCHEMA IF NOT EXISTS warranty;       -- Warranty management
CREATE SCHEMA IF NOT EXISTS finance;        -- Payments, expenses, accounting, general ledger, halkhata (traditional customer debt collection)
CREATE SCHEMA IF NOT EXISTS hr;             -- Human Resources
CREATE SCHEMA IF NOT EXISTS payroll;        -- Payroll management
CREATE SCHEMA IF NOT EXISTS reports;        -- Reports & analytics
CREATE SCHEMA IF NOT EXISTS notification;   -- Notifications
CREATE SCHEMA IF NOT EXISTS reporting;      -- Reports & analytics (legacy)
CREATE SCHEMA IF NOT EXISTS integration;    -- Cross-module communication
CREATE SCHEMA IF NOT EXISTS marketplace;    -- Grameen Bazaar marketplace (public-facing)

-- ============================================
-- SHARED KERNEL (Common types and utilities)
-- ============================================

-- Enum types used across modules
/*
SUBSCRIPTION PLANS:
1. trial            - Trial Plan for 1 month (50 products allowed)
2. small_business   - Small Business Plan (200 products allowed)
3. medium_business- Mid-Size Business Plan (500 products allowed)
4. big_business     - Big Business Plan (unlimited products, max_products = NULL)
5. marketplace - Marketplace-only sellers (no ERP/POS subscription, commission-based)
*/
CREATE TYPE core.subscription_plan AS ENUM ('small_business', 'medium_business', 'big_business', 'marketplace');
CREATE TYPE core.subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'trial', 'expired');
CREATE TYPE core.currency_code AS ENUM ('BDT', 'USD', 'EUR');

CREATE TYPE catalog.product_type AS ENUM ('standard', 'variant', 'service', 'digital');
CREATE TYPE catalog.unit_type AS ENUM (
    'weight', 'volume', 'count', 'length', 'area',
    'packaging', 'gold_jewellery', 'pharmacy_medical', 'time'
);

CREATE TYPE sales.order_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE sales.payment_status AS ENUM ('unpaid', 'partial', 'paid', 'refunded');

CREATE TYPE purchasing.po_status AS ENUM ('pending', 'approved', 'received', 'partial', 'cancelled');

CREATE TYPE finance.payment_method_type AS ENUM ('cash', 'card', 'mobile_banking', 'bank_transfer', 'cheque');

-- ============================================
-- MODULE 1: CORE (Foundation)
-- ============================================

-- ============================================
-- LOCATION INTEGRATION (EXTERNAL SERVICE)
-- ============================================
-- We do NOT store the full Bangladeshi administrative hierarchy locally.
-- Instead:
-- - Countries and locations are fetched from the Auth/Location API:
--   * GET {{auth_server}}/api/v1/locations/countries
--   * GET {{auth_server}}/api/v1/locations
-- - This database only stores lightweight references on tenant/business
--   records (country_code plus hierarchical location_level_*_id values)
--   so that location remains a single source of truth in the auth server.

-- ============================================
-- TENANTS TABLE
-- ============================================

-- Tenants table (owned by core module)
-- Note: company_id links to auth server's company/tenant concept.
-- One tenant per user (user_id UNIQUE). email and phone are not unique (multiple tenants may share contact details).
CREATE TABLE core.tenants (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(), -- Used for cross-module refs
    company_id UUID, -- External company ID from auth server (links to role assignment.companyId). Multiple tenants per company are allowed.
    user_id UUID UNIQUE, -- Owner user from auth server; one tenant per user (FK added after core.user_cache is created)
    phone VARCHAR(20), -- Not unique
    email VARCHAR(255), -- Not unique
    subscription_plan core.subscription_plan NOT NULL DEFAULT 'marketplace',
    subscription_amount DECIMAL(15,2) DEFAULT 0,
    subscription_currency_code core.currency_code DEFAULT 'BDT',
    subscription_status core.subscription_status DEFAULT 'active',
    subscription_start_date DATE,
    subscription_end_date DATE,
    max_users INT DEFAULT 5,
    max_products INT, -- NULL means unlimited (for big_business plan). Auto-set by trigger based on subscription_plan
    max_businesses INT DEFAULT 1, -- Renamed from max_stores
    max_warehouses INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tenants
CREATE INDEX idx_tenants_company_id ON core.tenants(company_id);

CREATE TABLE core.tenant_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID REFERENCES core.tenants(tenant_uuid) ON DELETE CASCADE,
    user_uuid UUID UNIQUE NOT NULL, -- External user UUID from auth server
    currency_code core.currency_code DEFAULT 'BDT',
    currency_symbol VARCHAR(10) DEFAULT '৳',
    timezone VARCHAR(50) DEFAULT 'Asia/Dhaka',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    financial_year_start VARCHAR(5) DEFAULT '01-07',
    enable_vat BOOLEAN DEFAULT true,
    vat_percentage DECIMAL(5,2) DEFAULT 15.00,
    enable_discount BOOLEAN DEFAULT true,
    enable_barcode BOOLEAN DEFAULT true,
    enable_warranty BOOLEAN DEFAULT true,
    low_stock_threshold INT DEFAULT 10,
    receipt_header TEXT,
    receipt_footer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid)
);

-- User Cache (Optional - for faster lookups, synced from auth server)
-- This table stores minimal user info cached from auth server
-- Can be refreshed periodically or on-demand
CREATE TABLE core.user_cache (
    id BIGSERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL, -- External user UUID from auth server
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20),
    avatar VARCHAR(512), -- Profile image URL from auth server
    is_staff BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    company_id UUID, -- From role assignment
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uuid)
);

-- Index for faster lookups
CREATE INDEX idx_user_cache_email ON core.user_cache(email);
CREATE INDEX idx_user_cache_company ON core.user_cache(company_id);

-- Add FK from core.tenants.user_id to core.user_cache after both tables exist
ALTER TABLE core.tenants
    ADD CONSTRAINT fk_tenants_user_id_user_cache
    FOREIGN KEY (user_id)
    REFERENCES core.user_cache(user_uuid)
    ON DELETE SET NULL;

-- Subscription plans (admin-managed; core.tenants.subscription_plan enum mirrors code for now)
CREATE TABLE core.subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    plan_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    features JSONB, -- Feature list e.g. ["inventory", "pos", "reports"]
    max_products INT, -- NULL means unlimited
    max_users INT DEFAULT 5,
    max_businesses INT DEFAULT 1,
    max_warehouses INT DEFAULT 1,
    subscription_amount DECIMAL(15,2) DEFAULT 0,
    subscription_currency_code core.currency_code DEFAULT 'BDT',
    is_marketplace BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_subscription_plans_code ON core.subscription_plans(code);
CREATE INDEX idx_subscription_plans_is_active ON core.subscription_plans(is_active);

INSERT INTO core.subscription_plans (
  code, name, name_en, description, features,
  max_products, max_users, max_businesses, max_warehouses,
  subscription_amount, subscription_currency_code,
  is_marketplace, display_order
) VALUES
  ('marketplace', 'গ্রামীণ মার্কেটপ্লেস','Grameen Marketplace', 'Marketplace-only sellers (free, commission-based)', NULL, NULL, 5, 1, 1, 0, 'BDT', true, 1 ),
  ('small_business', 'ছোট ব্যাবসা','Small Business', 'Small business plan', NULL, 200, 5, 1, 1, 500, 'BDT', false, 2),
  ('medium_business','মধ্যম ব্যাবসা','Medium Business', 'Mid-size business plan',NULL, 500, 10, 2, 2, 1000, 'BDT',false, 3),
  ('big_business', 'বড় ব্যাবসা','Big Business', 'Big business plan, unlimited products', NULL, NULL, 50, 10, 10,1500, 'BDT',false, 4 )
ON CONFLICT (code) DO NOTHING;

-- Activity Logs (owned by core for audit)
-- user_uuid references external auth server user UUID
CREATE TABLE core.activity_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID REFERENCES core.tenants(tenant_uuid) ON DELETE CASCADE,
    user_uuid UUID, -- External user UUID from auth server (no FK, loosely coupled)
    company_id UUID, -- Company/tenant context from auth server
    module VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    record_type VARCHAR(100),
    record_id BIGINT,
    record_uuid UUID, -- UUID reference if available
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for activity logs
CREATE INDEX idx_activity_logs_user ON core.activity_logs(user_uuid);
CREATE INDEX idx_activity_logs_tenant ON core.activity_logs(tenant_uuid);
CREATE INDEX idx_activity_logs_company ON core.activity_logs(company_id);
CREATE INDEX idx_activity_logs_module ON core.activity_logs(module, action);

-- ============================================
-- MODULE REGISTRY & TENANT MODULES (Core)
-- ============================================

-- Module categories (e.g. Operations, Finance, HR)
CREATE TABLE core.module_categories (
    category_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,        -- e.g. 'operations', 'finance'
    name VARCHAR(255) NOT NULL,               -- Human-readable name (Bengali)
    name_en VARCHAR(255),                     -- Human-readable name (English)
    image_url VARCHAR(500),                   -- Category image (local path or S3 URL)
    sort_order INTEGER NOT NULL DEFAULT 0,    -- Display order
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO core.module_categories (category_uuid, code, name, name_en, image_url, sort_order, is_active, created_at, updated_at)
VALUES
  ('bfbc8106-941c-4761-ac4b-f9c46f2e32c3', 'core', 'কোর মডিউল (সবসময় সক্রিয়)', 'Core Modules', NULL, 1, true, DEFAULT, DEFAULT),
  ('1f495147-0551-42cc-9633-1b36b3ed07ae', 'finance', 'ফাইন্যান্স', 'Finance', NULL, 2, true, DEFAULT, DEFAULT),
  ('a2b868a7-1b08-4c33-ba90-a4a3f67cc1a0', 'sales', 'বিক্রয়', 'Sales', NULL, 3, true, DEFAULT, DEFAULT),
  ('1c5ca683-8b97-48a7-900e-ecaa83c140c3', 'procurement', 'ক্রয়', 'Procurement', NULL, 4, true, DEFAULT, DEFAULT),
  ('54dd641e-2116-48cf-aacc-4e0538a10cb2', 'crm', 'গ্রাহক', 'CRM', NULL, 5, true, DEFAULT, DEFAULT),
  ('74216f7d-7acf-4553-9b88-aab2a33c3a1a', 'hr', 'মানব সম্পদ', 'HR', NULL, 6, true, DEFAULT, DEFAULT),
  ('47aa5b02-419a-4ea4-9a32-db82f208b405', 'logistics', 'লজিস্টিক', 'Logistics', NULL, 7, true, DEFAULT, DEFAULT),
  ('e11a00ca-9346-493b-9036-1c6049328f66', 'analytics', 'বিশ্লেষণ', 'Analytics', NULL, 8, true, DEFAULT, DEFAULT)
ON CONFLICT (code) DO NOTHING;

-- Available application modules/features
CREATE TABLE core.modules (
    module_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_uuid UUID REFERENCES core.module_categories(category_uuid) ON DELETE SET NULL,
    code VARCHAR(100) NOT NULL UNIQUE,        -- e.g. 'catalog', 'inventory', 'pos'
    name VARCHAR(255) NOT NULL,               -- Human-readable name (Bengali)
    name_en VARCHAR(255),                     -- Human-readable name (English)
    description TEXT,                         -- Description (Bengali)
    description_en TEXT,                      -- Description (English)
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed default application modules
INSERT INTO core.modules (code, name, name_en, description, description_en, is_active)
VALUES
  ('INV', 'ইনভেন্টরি ব্যবস্থাপনা', 'Inventory Management', 'পণ্য, স্টক লেভেল, স্টক মুভমেন্ট এবং গুদাম ব্যবস্থাপনার জন্য ইনভেন্টরি মডিউল।', 'Manage products, stock levels, stock movements and warehouses.', true),
  ('SAP', 'বিক্রয় এবং POS', 'Sales & POS', 'বিক্রয় চালান, বিলিং এবং খুচরা POS লেনদেন পরিচালনার জন্য বিক্রয় ও POS মডিউল।', 'Handle sales invoices, billing and retail POS transactions.', true),
  ('CRM', 'গ্রাহক সম্পর্ক ব্যবস্থাপনা', 'Customer Relationship Management', 'গ্রাহকের প্রোফাইল, যোগাযোগ তথ্য এবং সম্পর্ক ব্যবস্থাপনার জন্য CRM মডিউল।', 'Manage customer profiles, contact details and relationships.', true),
  ('ACP', 'প্রদেয় হিসাব', 'Accounts Payable', 'সরবরাহকারী বিল, বকেয়া এবং প্রদানযোগ্য হিসাব ট্র্যাক করার জন্য প্রদেয় হিসাব মডিউল।', 'Track supplier bills, dues and payables.', true),
  ('ACD', 'প্রাপ্তিযোগ্য হিসাব', 'Accounts Receivable', 'গ্রাহক বকেয়া, ধার বিক্রয় এবং আদায় ট্র্যাক করার জন্য প্রাপ্তযোগ্য হিসাব মডিউল।', 'Track customer dues, credit sales and collections.', true),
  ('ACC', 'হিসাবনিকাশ', 'Accounting', 'চার্ট অব একাউন্ট, জার্নাল এন্ট্রি এবং জেনারেল লেজারসহ পূর্ণাঙ্গ হিসাবনিকাশ ব্যবস্থাপনা।', 'Full accounting: chart of accounts, journal entries and general ledger.', true),
  ('HLK', 'হালখাতা', 'Halkhata', 'বাংলাদেশি ঐতিহ্যবাহী হালখাতা অনুষ্ঠান ও গ্রাহক পাওনা নিষ্পত্তি ব্যবস্থাপনার জন্য মডিউল।', 'Traditional Bangladeshi Halkhata events and customer ledger settlement.', true),
  ('SAL', 'ক্রয় ব্যবস্থাপনা', 'Purchasing Management', 'পারচেজ অর্ডার, পণ্য গ্রহণ এবং ক্রয় ফেরত পরিচালনার জন্য ক্রয় ব্যবস্থাপনা মডিউল।', 'Manage purchase orders, goods receipts and purchase returns.', true),
  ('STM', 'গুদাম ব্যবস্থাপনা', 'Warehouse Management', 'একাধিক গুদাম, লোকেশন এবং ইন্টারনাল ট্রান্সফার পরিচালনার জন্য গুদাম ব্যবস্থাপনা মডিউল।', 'Manage multiple warehouses, locations and internal transfers.', true),
  ('BRM', 'শাখা ব্যবস্থাপনা', 'Branch Management', 'একাধিক শাখা/ব্রাঞ্চ এবং স্টোর কাঠামো পরিচালনার জন্য শাখা ব্যবস্থাপনা মডিউল।', 'Manage multiple branches and store hierarchy.', true),
  ('HRM', 'মানব সম্পদ', 'Human Resources', 'কর্মচারী, ডিপার্টমেন্ট, পদবী এবং অন্যান্য মানব সম্পদ তথ্য ব্যবস্থাপনার জন্য HR মডিউল।', 'Manage employees, departments, positions and HR data.', true),
  ('PRL', 'বেতন', 'Payroll', 'বেতন কাঠামো, পেরোল পিরিয়ড, বেতন প্রস্তুতি ও পরিশোধ পরিচালনার জন্য বেতন মডিউল।', 'Manage salary structures, payroll periods and payments.', true),
  ('ANT', 'উন্নত রিপোর্ট', 'Advanced Reporting', 'ড্যাশবোর্ড, কাস্টম রিপোর্ট এবং নির্ধারিত সময়ে রিপোর্ট জেনারেশনের জন্য উন্নত রিপোর্ট মডিউল।', 'Dashboards, custom reports and scheduled report generation.', true)
ON CONFLICT (code) DO UPDATE
SET
  name           = EXCLUDED.name,
  name_en        = EXCLUDED.name_en,
  description    = EXCLUDED.description,
  description_en = EXCLUDED.description_en,
  is_active      = EXCLUDED.is_active,
  updated_at     = CURRENT_TIMESTAMP;

CREATE INDEX idx_modules_category ON core.modules (category_uuid);

-- Per-tenant module configuration and billing
CREATE TABLE core.tenant_modules (
    tenant_module_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_uuid        UUID NOT NULL,                                      -- links to core.tenants
    business_type_uuid UUID,                                               -- optional, if module availability differs by business type
    module_uuid        UUID NOT NULL REFERENCES core.modules(module_uuid) ON DELETE CASCADE,

    is_enabled         BOOLEAN NOT NULL DEFAULT false,
    is_required        BOOLEAN NOT NULL DEFAULT false,                     -- if true, UI can show as locked/always-on
    config             JSONB DEFAULT '{}'::jsonb,                          -- per-tenant module config (limits, flags, etc.)

    billing_plan       TEXT,                                               -- e.g. 'free', 'standard', 'pro'
    price_per_month    NUMERIC(12,2),
    trial_ends_at      TIMESTAMP,
    activated_at       TIMESTAMP,
    deactivated_at     TIMESTAMP,

    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (tenant_uuid, module_uuid)
);

CREATE INDEX idx_tenant_modules_tenant ON core.tenant_modules (tenant_uuid);
CREATE INDEX idx_tenant_modules_enabled ON core.tenant_modules (tenant_uuid, is_enabled);

-- Module dependency graph (e.g. POS depends on catalog + inventory)
CREATE TABLE core.module_dependencies (
    module_uuid     UUID NOT NULL REFERENCES core.modules(module_uuid) ON DELETE CASCADE,
    depends_on_uuid UUID NOT NULL REFERENCES core.modules(module_uuid) ON DELETE CASCADE,
    PRIMARY KEY (module_uuid, depends_on_uuid)
);

-- ============================================
-- MODULE 2: BUSINESS MANAGEMENT
-- ============================================

CREATE TABLE business.business_types (
    id BIGSERIAL PRIMARY KEY,
    business_type_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE, -- English name
    name_bn VARCHAR(100), -- Bengali name
    description TEXT, -- English description
    description_bn TEXT, -- Bengali description
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO business.business_types (name, name_bn) 
VALUES
    ('Crop Farming', 'ফসল ব্যবসা/চাষ'),
    ('Vegetable Farming', 'সবজি ব্যবসা/চাষ'),
    ('Fruit Orchard', 'ফল বাগান/ব্যবসা'),
    ('Dairy Farm', 'ডেইরি ফার্ম'),
    ('Poultry Farm', 'পোল্ট্রি ফার্ম'),
    ('Fish Farming', 'মাছ খামার/ব্যবসা'),
    ('Shrimp Farming', 'চিংড়ি ব্যবসা/চাষ'),
    ('Mushroom Farming', 'মাশরুম ব্যবসা/চাষ'),
    ('Agro Processing', 'এগ্রো প্রসেসিং'),
    ('Rice Mill', 'ধান/চাল মিল'),
    ('Flour Mill', 'আটা/ময়দা মিল'),
    ('Cold Storage', 'কোল্ড স্টোরেজ'),
    ('Fertilizer Business', 'সার ব্যবসা'),
    ('Pesticide Sales', 'কীটনাশক ব্যবসা'),
    ('Seed Business', 'বীজ ব্যবসা'),
    ('Dairy Milk Supply', 'দুধ সরবরাহ ব্যবসা'),
    ('Beef Fattening', 'গরু মোটাতাজাকরণ'),
    ('Goat Farming', 'ছাগল ফার্ম'),
    ('Sheep Farming', 'ভেড়া ফার্ম'),
    ('Duck Farming', 'হাঁস ফার্ম'),
    ('Quail Farming', 'কোয়েল পাখি ফার্ম'),
    ('Pigeon Farming', 'কবুতর ফার্ম'),
    ('Fish Feed Production', 'মাছের খাদ্য উৎপাদন'),
    ('Cattle Feed Production', 'গবাদি খাদ্য উৎপাদন'),
    ('Honey & Beekeeping', 'মৌমাছি পালন ও মধু উৎপাদন'),
    ('Leather Processing', 'চামড়া প্রক্রিয়াজাতকরণ'),
    ('Restaurant', 'রেস্টুরেন্ট'),
    ('Café', 'ক্যাফে'),
    ('Bakery', 'বেকারি'),
    ('Street Food Shop', 'স্ট্রিট ফুড দোকান'),
    ('Catering Service', 'ক্যাটারিং সার্ভিস'),
    ('Ice Cream Factory', 'আইসক্রিম কারখানা'),
    ('Snack/Chips Factory', 'স্ন্যাকস/চিপস কারখানা'),
    ('Pickle Manufacturing', 'আচার উৎপাদন'),
    ('Spice Grinding', 'মসলা পেষাই'),
    ('Water Bottling', 'মিনারেল ওয়াটার উৎপাদন'),
    ('Juice Production', 'জুস উৎপাদন'),
    ('Grocery Shop', 'মুদি দোকান'),
    ('Super Shop', 'সুপারশপ'),
    ('Clothing Store', 'কাপড়ের দোকান'),
    ('Electronics Shop', 'ইলেকট্রনিক্স দোকান'),
    ('Mobile Shop', 'মোবাইল দোকান'),
    ('Cosmetics Shop', 'কসমেটিকস দোকান'),
    ('Hardware Store', 'হার্ডওয়্যার দোকান'),
    ('Stationery Shop', 'স্টেশনারি দোকান'),
    ('Bookstore', 'বইয়ের দোকান'),
    ('Furniture Shop', 'ফার্নিচার দোকান'),
    ('Wholesale Trader', 'পাইকারি ব্যবসা'),
    ('Online Store', 'অনলাইন দোকান'),
    ('Multivendor Marketplace', 'মাল্টিভেন্ডর মার্কেটপ্লেস'),
    ('F-Commerce', 'এফ-কমার্স'),
    ('Dropshipping', 'ড্রপশিপিং'),
    ('Print on Demand', 'প্রিন্ট-অন-ডিমান্ড'),
    ('Digital Products', 'ডিজিটাল পণ্য'),
    ('Online Grocery Delivery', 'অনলাইন মুদি ডেলিভারি'),
    ('Food Delivery', 'ফুড ডেলিভারি'),
    ('Online Pharmacy', 'অনলাইন ফার্মেসি'),
    ('E-Learning Platform', 'ই-লার্নিং প্ল্যাটফর্ম'),
    ('Ride Sharing', 'রাইড শেয়ারিং'),
    ('Truck Transport', 'ট্রাক পরিবহন'),
    ('Bus Service', 'বাস সার্ভিস'),
    ('Human Hauler', 'হিউম্যান হলার'),
    ('Auto Rickshaw Business', 'অটোরিকশা ব্যবসা'),
    ('Courier Service', 'কুরিয়ার সার্ভিস'),
    ('Cargo Shipping', 'কার্গো শিপিং'),
    ('Garments (RMG)', 'গার্মেন্টস'),
    ('Textile Mill', 'টেক্সটাইল মিল'),
    ('Plastic Factory', 'প্লাস্টিক কারখানা'),
    ('Cement Factory', 'সিমেন্ট কারখানা'),
    ('Steel & Rod Factory', 'স্টিল/রড কারখানা'),
    ('Brickfield', 'ইটভাটা'),
    ('Pharmaceuticals', 'ফার্মাসিউটিক্যালস'),
    ('Electronics Assembly', 'ইলেকট্রনিক্স অ্যাসেম্বলি'),
    ('Furniture Manufacturing', 'ফার্নিচার উৎপাদন'),
    ('Packaging Industry', 'প্যাকেজিং শিল্প'),
    ('Real Estate Development', 'রিয়েল এস্টেট'),
    ('Construction Firm', 'নির্মাণ প্রতিষ্ঠান'),
    ('Interior Design', 'ইন্টেরিয়র ডিজাইন'),
    ('Architecture Firm', 'আর্কিটেকচার ফার্ম'),
    ('Building Materials Supply', 'নির্মাণ সামগ্রী সরবরাহ'),
    ('Software Company', 'সফটওয়্যার কোম্পানি'),
    ('Web Development', 'ওয়েব ডেভেলপমেন্ট'),
    ('App Development', 'অ্যাপ ডেভেলপমেন্ট'),
    ('UI/UX Design', 'UI/UX ডিজাইন'),
    ('Cybersecurity', 'সাইবার সিকিউরিটি'),
    ('IT Training Center', 'আইটি ট্রেনিং সেন্টার'),
    ('BPO Service', 'বিপিও সার্ভিস'),
    ('CCTV & Security', 'সিসিটিভি ও সিকিউরিটি'),
    ('School', 'স্কুল'),
    ('Coaching Center', 'কোচিং সেন্টার'),
    ('Language Center', 'ভাষা প্রশিক্ষণ কেন্দ্র'),
    ('IT Training Institute', 'আইটি ট্রেনিং ইনস্টিটিউট'),
    ('Online Tutoring', 'অনলাইন টিউটরিং'),
    ('Hospital', 'হাসপাতাল'),
    ('Clinic', 'ক্লিনিক'),
    ('Diagnostic Center', 'ডায়াগনস্টিক সেন্টার'),
    ('Pharmacy', 'ফার্মেসি'),
    ('Dental Clinic', 'ডেন্টাল ক্লিনিক'),
    ('Medical Equipment Supply', 'চিকিৎসা সরঞ্জাম সরবরাহ'),
    ('Boutique', 'বুটিক'),
    ('Tailoring', 'দর্জির কাজ'),
    ('Beauty Parlour', 'বিবিউটি পার্লার'),
    ('Spa', 'স্পা'),
    ('Jewelry Shop', 'গহনার দোকান'),
    ('Handicrafts', 'হস্তশিল্প'),
    ('Photography Studio', 'ফটোগ্রাফি স্টুডিও'),
    ('Videography Agency', 'ভিডিওগ্রাফি এজেন্সি'),
    ('Graphics Design', 'গ্রাফিক্স ডিজাইন'),
    ('Animation & VFX', 'অ্যানিমেশন ও ভিএফএক্স'),
    ('Event Management', 'ইভেন্ট ম্যানেজমেন্ট'),
    ('YouTube Business', 'ইউটিউব ব্যবসা'),
    ('Hotel', 'হোটেল'),
    ('Resort', 'রিসোর্ট'),
    ('Guest House', 'গেস্ট হাউজ'),
    ('Travel Agency', 'ট্রাভেল এজেন্সি'),
    ('Tour Guide Service', 'ট্যুর গাইড সার্ভিস'),
    ('Laundry Service', 'লন্ড্রি সার্ভিস'),
    ('Home Cleaning', 'বাড়ি পরিষ্কার'),
    ('Pest Control', 'পেস্ট কন্ট্রোল'),
    ('Security Service', 'সিকিউরিটি সার্ভিস'),
    ('Water Purification', 'পানিশোধন'),
    ('Waste Management', 'বর্জ্য ব্যবস্থাপনা'),
    ('Agricultural Machine Rental', 'কৃষি যন্ত্র ভাড়া'),
    ('Handloom', 'হাতের তাঁত'),
    ('Bamboo Products', 'বাঁশের পণ্য'),
    ('Village Pharmacy', 'গ্রামীন ফার্মেসি'),
    ('Tailoring Shop', 'দর্জির দোকান'),
    ('Mobile Servicing', 'মোবাইল সার্ভিসিং'),
    ('Fish Feed Mill', 'মাছের খাদ্য মিল'),
    ('Solar Energy Business', 'সোলার ব্যবসা'),
    ('Generator Sales', 'জেনারেটর বিক্রয়'),
    ('EV Charging Station', 'ইভি চার্জিং স্টেশন'),
    ('Water Supply Systems', 'পানি সরবরাহ ব্যবস্থা'),
    ('Recycling Plant', 'রিসাইক্লিং প্ল্যান্ট'),
    ('Plastic Waste Management', 'প্লাস্টিক বর্জ্য ব্যবস্থাপনা'),
    ('Tree Nursery', 'নার্সারি'),
    ('NGO Services', 'এনজিও সেবা'),
    ('Drone Services', 'ড্রোন সেবা'),
    ('IoT Solutions', 'আইওটি সলিউশন'),
    ('AI-Based Services', 'কৃত্রিম বুদ্ধিমত্তা ভিত্তিক সেবা'),
    ('Smart Home Systems', 'স্মার্ট হোম সিস্টেম');


-- Optional high-level grouping for business types
CREATE TABLE business.business_type_categories (
    id BIGSERIAL PRIMARY KEY,
    category_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

    code VARCHAR(50) NOT NULL UNIQUE,  -- e.g. RETAIL, SERVICE, MANUFACTURING
    name VARCHAR(100) NOT NULL,        -- English
    name_bn VARCHAR(100),              -- Bangla
    description TEXT,
    description_bn TEXT,
    icon VARCHAR(100),

    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO business.business_type_categories 
    (code, name, name_bn, display_order) 
VALUES
    ('agriculture_agro', 'Agriculture & Agro-Based Business', 'কৃষি ও কৃষি-ভিত্তিক ব্যবসা', 1),
    ('livestock_animal', 'Livestock & Animal-Based Business', 'পশুপালন ও প্রাণী-ভিত্তিক ব্যবসা', 2),
    ('food_beverage', 'Food & Beverage', 'খাদ্য ও পানীয়', 3),
    ('retail_wholesale', 'Retail & Wholesale Trading', 'খুচরা ও পাইকারি ব্যবসা', 4),
    ('ecommerce_online', 'E-Commerce & Online Business', 'ই-কমার্স ও অনলাইন ব্যবসা', 5),
    ('transport_mobility', 'Transport & Mobility', 'পরিবহন ও চলাচল', 6),
    ('manufacturing_industry', 'Manufacturing & Industry', 'উৎপাদন ও শিল্প', 7),
    ('construction_real_estate', 'Construction & Real Estate', 'নির্মাণ ও রিয়েল এস্টেট', 8),
    ('it_technology', 'IT & Technology', 'আইটি ও প্রযুক্তি', 9),
    ('education_training', 'Education & Training', 'শিক্ষা ও প্রশিক্ষণ', 10),
    ('health_medical', 'Health & Medical', 'স্বাস্থ্য ও চিকিৎসা', 11),
    ('fashion_accessories', 'Fashion & Accessories', 'ফ্যাশন ও অ্যাক্সেসরিজ', 12),
    ('creative_media_entertainment', 'Creative, Media & Entertainment', 'ক্রিয়েটিভ, মিডিয়া ও বিনোদন', 13),
    ('pharmacy_medicine', 'Pharmacy & Medicine', 'ফার্মেসি ও ঔষধ', 14),
    ('gold_jewellery', 'Gold & Jewellery', 'স্বর্ণ ও জুয়েলারি', 15),
    ('tourism_hospitality', 'Tourism & Hospitality', 'পর্যটন ও হসপিটালিটি', 16),
    ('home_community_services', 'Home & Community Services', 'গৃহ ও কমিউনিটি সেবা', 17),
    ('rural_village_business', 'Rural & Village-Based Businesses', 'গ্রামভিত্তিক ব্যবসা', 18),
    ('energy_utility', 'Energy & Utility', 'জ্বালানি ও ইউটিলিটি', 19),
    ('environmental_social_enterprise', 'Environmental & Social Enterprise', 'পরিবেশ ও সামাজিক ব্যবসা', 20),
    ('emerging_future_tech', 'Emerging & Future Tech', 'উদীয়মান ও ভবিষ্যৎ প্রযুক্তি', 21);

-- Link table: assign each business type to a category (optional)
CREATE TABLE business.business_type_category_map (
    id BIGSERIAL PRIMARY KEY,
    business_type_uuid UUID NOT NULL,
    category_uuid UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (business_type_uuid, category_uuid)
);

CREATE INDEX idx_bt_category_map_type ON business.business_type_category_map (business_type_uuid);
CREATE INDEX idx_bt_category_map_category ON business.business_type_category_map (category_uuid);

CREATE TABLE business.businesses (
    id BIGSERIAL PRIMARY KEY,
    business_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL, -- No FK to core, loose coupling
    business_name VARCHAR(255) NOT NULL,
    business_name_en VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    domain VARCHAR(100) UNIQUE, -- Website domain url of the business
    company_id UUID, -- External company ID from auth server
    business_type_uuid UUID NOT NULL, -- No FK, loose coupling
    code VARCHAR(50) NOT NULL,
    address TEXT,
    -- External location references (from auth/location service), mirroring core.tenants
    country_code VARCHAR(2) NOT NULL DEFAULT 'BD', -- ISO-3166 alpha-2 (e.g. BD, IN)
    -- Hierarchical location IDs (level 1..7) from the location service.
    -- Example for Bangladesh: 1=division, 2=district, 3=upazila, 4=union, 5=village.
    location_level_1_id BIGINT,
    location_level_2_id BIGINT,
    location_level_3_id BIGINT,
    location_level_4_id BIGINT,
    location_level_5_id BIGINT,
    location_level_6_id BIGINT,
    location_level_7_id BIGINT,
    location_rank INT,           -- 1..7: level at which this business is attached
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_uuid UUID, -- External user UUID from auth server, no direct FK
    tin_number VARCHAR(50),
    trade_license VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    opening_time TIME,
    closing_time TIME,
    enable_pos BOOLEAN DEFAULT true,
    is_personal_website_enabled BOOLEAN DEFAULT false,
    is_marketplace_enabled BOOLEAN DEFAULT true, -- Business opted into Grameen Bazaar marketplace listing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, code)
);

-- User Business Access (links external auth server users to businesses)
CREATE TABLE business.user_businesses (
    id BIGSERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL, -- External user UUID from auth server, no FK
    business_uuid UUID REFERENCES business.businesses(business_uuid) ON DELETE CASCADE,
    company_id UUID, -- For filtering by company
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_uuid, business_uuid)
);

CREATE INDEX idx_user_businesses_user ON business.user_businesses(user_uuid);
CREATE INDEX idx_user_businesses_company ON business.user_businesses(company_id);

-- ============================================
-- MODULE 3: CATALOG (Product Management)
-- ============================================

CREATE TABLE catalog.categories (
    id BIGSERIAL PRIMARY KEY,
    category_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_uuid UUID, -- Self-reference
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE catalog.brands (
    id BIGSERIAL PRIMARY KEY,
    brand_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

-- Master units and conversions (templates)
-- business_type_uuid NULL = shared "common" unit (single row; edit once, all business types see it).
-- business_type_uuid set = unit exists only for that type (pharmacy, gold, land_ag, time pools).
-- On onboarding, copy from shared + type-specific rows into catalog.units / unit_conversions.

CREATE TABLE catalog.master_units (
    id BIGSERIAL PRIMARY KEY,
    unit_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    business_type_uuid UUID NULL, -- NULL = global common; NOT NULL = type-specific
    name VARCHAR(50) NOT NULL,
    short_name JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}'::jsonb,
    unit_type catalog.unit_type,
    is_base_unit BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_master_units_global_name ON catalog.master_units (name) WHERE business_type_uuid IS NULL;
CREATE UNIQUE INDEX ux_master_units_scoped_name ON catalog.master_units (business_type_uuid, name) WHERE business_type_uuid IS NOT NULL;

-- 1) Shared common units (once; all business types use these via API merge)
INSERT INTO catalog.master_units (business_type_uuid, name, short_name, unit_type, is_base_unit)
SELECT NULL, v.name, v.short_name::jsonb, v.unit_kind::catalog.unit_type, v.is_base_unit
FROM (
    VALUES
        ('Kilogram', '{"en": "kg", "bn": "কেজি"}', 'weight', true),
        ('Gram', '{"en": "g", "bn": "গ্রাম"}', 'weight', false),
        ('Milligram', '{"en": "mg", "bn": "মিলিগ্রাম"}', 'weight', false),
        ('Microgram', '{"en": "mcg", "bn": "মাইক্রোগ্রাম"}', 'weight', false),
        ('Ton', '{"en": "ton", "bn": "টন"}', 'weight', false),
        ('Quintal', '{"en": "quintal", "bn": "কুইন্টাল"}', 'weight', false),
        ('Mon', '{"en": "mon", "bn": "মণ"}', 'weight', false),
        ('Pound', '{"en": "lb", "bn": "পাউন্ড"}', 'weight', false),
        ('Ounce', '{"en": "oz", "bn": "আউন্স"}', 'weight', false),
        ('Liter', '{"en": "liter", "bn": "লিটার"}', 'volume', true),
        ('Millilitre', '{"en": "ml", "bn": "মিলিলিটার"}', 'volume', false),
        ('Gallon', '{"en": "gallon", "bn": "গ্যালন"}', 'volume', false),
        ('Cubic Meter', '{"en": "m³", "bn": "ঘনমিটার"}', 'volume', false),
        ('Cubic Centimeter', '{"en": "cm³", "bn": "ঘনসেন্টিমিটার"}', 'volume', false),
        ('Meter', '{"en": "m", "bn": "মিটার"}', 'length', true),
        ('Centimeter', '{"en": "cm", "bn": "সেন্টিমিটার"}', 'length', false),
        ('Millimeter', '{"en": "mm", "bn": "মিলিমিটার"}', 'length', false),
        ('Kilometer', '{"en": "km", "bn": "কিলোমিটার"}', 'length', false),
        ('Yard', '{"en": "yard", "bn": "ইয়ার্ড"}', 'length', false),
        ('Foot', '{"en": "ft", "bn": "ফুট"}', 'length', false),
        ('Inch', '{"en": "in", "bn": "ইঞ্চি"}', 'length', false),
        ('Square Meter', '{"en": "sqm", "bn": "বর্গমিটার"}', 'area', true),
        ('Square Foot', '{"en": "sqft", "bn": "বর্গফুট"}', 'area', false),
        ('Piece', '{"en": "piece", "bn": "পিস"}', 'count', true),
        ('Dozen', '{"en": "dozen", "bn": "ডজন"}', 'count', false),
        ('Gross', '{"en": "gross", "bn": "গ্রস"}', 'count', false),
        ('Hundred', '{"en": "hundred", "bn": "শত"}', 'count', false),
        ('Thousand', '{"en": "thousand", "bn": "হাজার"}', 'count', false),
        ('Box', '{"en": "box", "bn": "বক্স"}', 'packaging', true),
        ('Carton', '{"en": "carton", "bn": "কার্টন"}', 'packaging', false),
        ('Crate', '{"en": "crate", "bn": "ক্রেট"}', 'packaging', false),
        ('Packet', '{"en": "packet", "bn": "প্যাকেট"}', 'packaging', false),
        ('Bag', '{"en": "bag", "bn": "বস্তা"}', 'packaging', false),
        ('Bottle', '{"en": "bottle", "bn": "বোতল"}', 'packaging', false),
        ('Jar', '{"en": "jar", "bn": "জার"}', 'packaging', false),
        ('Can', '{"en": "can", "bn": "ক্যান"}', 'packaging', false),
        ('Pouch', '{"en": "pouch", "bn": "পাউচ"}', 'packaging', false),
        ('Case', '{"en": "case", "bn": "কেস"}', 'packaging', false),
        ('Bundle', '{"en": "bundle", "bn": "গুচ্ছ"}', 'packaging', false),
        ('Sachet', '{"en": "sachet", "bn": "স্যাশে"}', 'packaging', false)
) AS v(name, short_name, unit_kind, is_base_unit);

-- 2) Type-specific pools (same rules as before; one row per matching business type)
INSERT INTO catalog.master_units (business_type_uuid, name, short_name, unit_type, is_base_unit)
SELECT bt.business_type_uuid, u.name, u.short_name::jsonb, u.unit_kind::catalog.unit_type, u.is_base_unit
FROM business.business_types bt
CROSS JOIN (
    VALUES
        ('Acre', '{"en": "acre", "bn": "একর"}', 'area', false, 'land_ag'),
        ('Hectare', '{"en": "hectare", "bn": "হেক্টর"}', 'area', false, 'land_ag'),
        ('Bigha', '{"en": "bigha", "bn": "বিঘা"}', 'area', false, 'land_ag'),
        ('Katha', '{"en": "katha", "bn": "কাঠা"}', 'area', false, 'land_ag'),
        ('Square Centimeter', '{"en": "sqcm", "bn": "বর্গসেন্টিমিটার"}', 'area', false, 'land_ag'),
        ('Square Kilometer', '{"en": "sqkm", "bn": "বর্গকিলোমিটার"}', 'area', false, 'land_ag'),
        ('Gram Gold', '{"en": "g", "bn": "গ্রাম"}', 'gold_jewellery', true, 'gold'),
        ('Ana', '{"en": "ana", "bn": "আনা"}', 'gold_jewellery', false, 'gold'),
        ('Vori', '{"en": "vori", "bn": "ভরি"}', 'gold_jewellery', false, 'gold'),
        ('Carat', '{"en": "carat", "bn": "ক্যারেট"}', 'gold_jewellery', false, 'gold'),
        ('Tola', '{"en": "tola", "bn": "তোলা"}', 'gold_jewellery', false, 'gold'),
        ('Tablet/Capsule', '{"en": "tablet", "bn": "পিস"}', 'pharmacy_medical', true, 'pharmacy'),
        ('Strip', '{"en": "strip", "bn": "স্ট্রিপ"}', 'pharmacy_medical', false, 'pharmacy'),
        ('Vial', '{"en": "vial", "bn": "ভায়াল"}', 'pharmacy_medical', false, 'pharmacy'),
        ('IU', '{"en": "IU", "bn": "আইইউ"}', 'pharmacy_medical', false, 'pharmacy'),
        ('Second', '{"en": "s", "bn": "সেকেন্ড"}', 'time', true, 'time'),
        ('Minute', '{"en": "min", "bn": "মিনিট"}', 'time', false, 'time'),
        ('Hour', '{"en": "hr", "bn": "ঘণ্টা"}', 'time', false, 'time'),
        ('Day', '{"en": "day", "bn": "দিন"}', 'time', false, 'time'),
        ('Week', '{"en": "wk", "bn": "সপ্তাহ"}', 'time', false, 'time'),
        ('Month', '{"en": "month", "bn": "মাস"}', 'time', false, 'time'),
        ('Year', '{"en": "year", "bn": "বছর"}', 'time', false, 'time')
) AS u(name, short_name, unit_kind, is_base_unit, pool)
WHERE
    (u.pool = 'land_ag'
        AND bt.name NOT IN ('Pharmacy', 'Online Pharmacy', 'Village Pharmacy')
        AND (
            bt.name ILIKE '%Farm%'
            OR bt.name ILIKE '%Farming%'
            OR bt.name ILIKE '%Crop %'
            OR bt.name ILIKE 'Crop %'
            OR bt.name ILIKE '%Orchard%'
            OR bt.name ILIKE '%Mill'
            OR bt.name ILIKE 'Rice %'
            OR bt.name ILIKE '%Agro%'
            OR bt.name ILIKE '%Agri%'
            OR bt.name ILIKE '%Nursery%'
            OR bt.name ILIKE '%Fish %'
            OR bt.name ILIKE '%Shrimp%'
            OR bt.name ILIKE '%Seed %'
            OR bt.name ILIKE '%Fertilizer%'
            OR bt.name ILIKE '%Pesticide%'
            OR bt.name ILIKE '%Cattle%'
            OR bt.name ILIKE '%Dairy%'
            OR bt.name ILIKE '%Poultry%'
            OR bt.name ILIKE '%Bee %'
            OR bt.name ILIKE '%Honey%'
            OR bt.name ILIKE '%Agricultural%'
            OR bt.name ILIKE '%Leather Processing%'
            OR bt.name ILIKE '%Cold Storage%'
            OR bt.name ILIKE '%Feed %'
            OR bt.name ILIKE '%Rural%'
            OR bt.name IN (
                'Real Estate Development', 'Construction Firm', 'Interior Design', 'Architecture Firm',
                'Building Materials Supply', 'Tree Nursery', 'Brickfield'
            )
        )
    )
    OR (u.pool = 'pharmacy' AND bt.name IN ('Pharmacy', 'Online Pharmacy', 'Village Pharmacy', 'Pharmaceuticals'))
    OR (u.pool = 'gold' AND (bt.name ILIKE '%Jewelry%' OR bt.name ILIKE '%Jewellery%'))
    OR (u.pool = 'time' AND bt.name IN (
            'Software Company', 'Web Development', 'App Development', 'UI/UX Design',
            'IT Training Center', 'BPO Service', 'E-Learning Platform', 'Online Tutoring',
            'Cybersecurity', 'IT Training Institute', 'IoT Solutions', 'AI-Based Services'
        ));

CREATE TABLE catalog.master_unit_conversions (
    id BIGSERIAL PRIMARY KEY,
    business_type_uuid UUID NULL, -- NULL = shared conversion between two global common units
    from_unit_uuid UUID NOT NULL REFERENCES catalog.master_units(unit_uuid) ON DELETE CASCADE,
    to_unit_uuid UUID NOT NULL REFERENCES catalog.master_units(unit_uuid) ON DELETE CASCADE,
    conversion_factor DECIMAL(15,6) NOT NULL,
    formula VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX ux_muc_global_pair ON catalog.master_unit_conversions (from_unit_uuid, to_unit_uuid)
    WHERE business_type_uuid IS NULL;
CREATE UNIQUE INDEX ux_muc_scoped_triple ON catalog.master_unit_conversions (business_type_uuid, from_unit_uuid, to_unit_uuid)
    WHERE business_type_uuid IS NOT NULL;

-- Master unit conversions: (1) global rows — both units are common (business_type_uuid NULL);
-- (2) per-type rows — both endpoints are type-specific rows for the same business_type_uuid;
-- (3) hectare → sqm — scoped hectare to global Square Meter for each type that has Hectare.
-- Note: PostgreSQL WITH ... applies only to the next single statement; use TEMP tables so both INSERTs share seed data.
CREATE TEMP TABLE _seed_muc_conversions (
    from_key TEXT NOT NULL,
    to_key TEXT NOT NULL,
    factor NUMERIC NOT NULL,
    formula_str TEXT
);
INSERT INTO _seed_muc_conversions (from_key, to_key, factor, formula_str) VALUES
    ('kg', 'g', 1000.0, '1 kg = 1000 g (১ কেজি = ১০০০ গ্রাম)'),
    ('g', 'kg', 0.001, '1 g = 0.001 kg (১ গ্রাম = ০.০০১ কেজি)'),
    ('ton', 'kg', 1000.0, '1 Ton = 1000 kg (১ টন = ১০০০ কেজি)'),
    ('mon', 'kg', 40.0, '1 Mon = 40 kg (১ মণ = ৪০ কেজি)'),
    ('kg', 'mon', 0.025, '1 kg = 0.025 Mon (১ কেজি = ০.০২৫ মণ)'),
    ('quintal', 'kg', 100.0, '1 Quintal = 100 kg (১ কুইন্টাল = ১০০ কেজি)'),
    ('lb', 'kg', 0.453592, '1 lb = 0.4535 kg (১ পাউন্ড = ০.৪৫৩৫ কেজি)'),
    ('liter', 'ml', 1000.0, '1 L = 1000 ml (১ লিটার = ১০০০ মিলিলিটার)'),
    ('ml', 'liter', 0.001, '1 ml = 0.001 L (১ মিলিলিটার = ০.০০১ লিটার)'),
    ('gallon', 'liter', 3.78541, '1 Gallon = 3.785 L (১ গ্যালন = ৩.৭৮৫ লিটার)'),
    ('cubic_meter', 'liter', 1000.0, '1 m³ = 1000 L (১ ঘনমিটার = ১০০০ লিটার)'),
    ('meter', 'cm', 100.0, '1 m = 100 cm (১ মিটার = ১০০ সেন্টিমিটার)'),
    ('km', 'meter', 1000.0, '1 km = 1000 m (১ কিলোমিটার = ১০০০ মিটার)'),
    ('foot', 'inch', 12.0, '1 ft = 12 in (১ ফুট = ১২ ইঞ্চি)'),
    ('yard', 'meter', 0.9144, '1 Yard = 0.9144 m (১ ইয়ার্ড = ০.৯১৪৪ মিটার)'),
    ('bigha', 'katha', 20.0, '1 Bigha = 20 Katha (১ বিঘা = ২০ কাঠা)'),
    ('katha', 'bigha', 0.05, '1 Katha = 0.05 Bigha (১ কাঠা = ০.০৫ বিঘা)'),
    ('acre', 'bigha', 3.025, '1 Acre = 3.025 Bigha (১ একর = ৩.০২৫ বিঘা)'),
    ('dozen', 'piece', 12.0, '1 Dozen = 12 pcs (১ ডজন = ১২ পিস)'),
    ('gross', 'piece', 144.0, '1 Gross = 144 pcs (১ গ্রস = ১৪৪ পিস)'),
    ('hundred', 'piece', 100.0, '1 Hundred = 100 pcs (১ শত = ১০০ পিস)'),
    ('thousand', 'piece', 1000.0, '1 Thousand = 1000 pcs (১ হাজার = ১০০০ পিস)'),
    ('vori', 'ana', 16.0, '1 Vori = 16 Ana (১ ভরি = ১৬ আনা)'),
    ('ana', 'vori', 0.0625, '1 Ana = 0.0625 Vori (১ আনা = ০.০৬২৫ ভরি)'),
    ('vori', 'gram_gold', 11.824, '1 Vori = 11.824 g (১ ভরি = ১১.৮২৪ গ্রাম)'),
    ('ana', 'gram_gold', 0.739, '1 Ana = 0.739 g (১ আনা = ০.৭৩৯ গ্রাম)'),
    ('tola', 'gram_gold', 11.6638, '1 Tola = 11.6638 g (১ তোলা = ১১.৬৬৩৮ গ্রাম)'),
    ('strip', 'tablet', 10.0, '1 Strip = 10 Tabs (১ স্ট্রিপ = ১০ ট্যাবলেট)'),
    ('year', 'month', 12.0, '1 Year = 12 Months (১ বছর = ১২ মাস)'),
    ('month', 'day', 30.0, '1 Month = 30 Days (১ মাস = ৩০ দিন)'),
    ('week', 'day', 7.0, '1 Week = 7 Days (১ সপ্তাহ = ৭ দিন)'),
    ('day', 'hour', 24.0, '1 Day = 24 Hours (১ দিন = ২৪ ঘণ্টা)'),
    ('hour', 'minute', 60.0, '1 Hour = 60 Mins (১ ঘণ্টা = ৬০ মিনিট)'),
    ('minute', 'second', 60.0, '1 Minute = 60 Seconds (১ মিনিট = ৬০ সেকেন্ড)');

CREATE TEMP TABLE _seed_muc_unit_data AS
SELECT unit_uuid, business_type_uuid, name,
    CASE 
        WHEN name = 'Kilogram' THEN 'kg'
        WHEN name = 'Gram' THEN 'g'
        WHEN name = 'Milligram' THEN 'mg'
        WHEN name = 'Microgram' THEN 'mcg'
        WHEN name = 'Ton' THEN 'ton'
        WHEN name = 'Quintal' THEN 'quintal'
        WHEN name = 'Mon' THEN 'mon'
        WHEN name = 'Pound' THEN 'lb'
        WHEN name = 'Ounce' THEN 'oz'
        WHEN name = 'Liter' THEN 'liter'
        WHEN name = 'Millilitre' THEN 'ml'
        WHEN name = 'Gallon' THEN 'gallon'
        WHEN name = 'Cubic Meter' THEN 'cubic_meter'
        WHEN name = 'Cubic Centimeter' THEN 'cubic_cm'
        WHEN name = 'Meter' THEN 'meter'
        WHEN name = 'Centimeter' THEN 'cm'
        WHEN name = 'Millimeter' THEN 'mm'
        WHEN name = 'Kilometer' THEN 'km'
        WHEN name = 'Yard' THEN 'yard'
        WHEN name = 'Foot' THEN 'foot'
        WHEN name = 'Inch' THEN 'inch'
        WHEN name = 'Square Meter' THEN 'sqm'
        WHEN name = 'Square Foot' THEN 'sqft'
        WHEN name = 'Acre' THEN 'acre'
        WHEN name = 'Hectare' THEN 'hectare'
        WHEN name = 'Bigha' THEN 'bigha'
        WHEN name = 'Katha' THEN 'katha'
        WHEN name = 'Piece' THEN 'piece'
        WHEN name = 'Dozen' THEN 'dozen'
        WHEN name = 'Gross' THEN 'gross'
        WHEN name = 'Hundred' THEN 'hundred'
        WHEN name = 'Thousand' THEN 'thousand'
        WHEN name = 'Gram Gold' THEN 'gram_gold'
        WHEN name = 'Ana' THEN 'ana'
        WHEN name = 'Vori' THEN 'vori'
        WHEN name = 'Carat' THEN 'carat'
        WHEN name = 'Tola' THEN 'tola'
        WHEN name = 'Strip' THEN 'strip'
        WHEN name = 'Tablet/Capsule' THEN 'tablet'
        WHEN name = 'Year' THEN 'year'
        WHEN name = 'Month' THEN 'month'
        WHEN name = 'Week' THEN 'week'
        WHEN name = 'Day' THEN 'day'
        WHEN name = 'Hour' THEN 'hour'
        WHEN name = 'Minute' THEN 'minute'
        WHEN name = 'Second' THEN 'second'
    END AS lookup_key
FROM catalog.master_units;

INSERT INTO catalog.master_unit_conversions (business_type_uuid, from_unit_uuid, to_unit_uuid, conversion_factor, formula)
SELECT NULL, f.unit_uuid, t.unit_uuid, c.factor, c.formula_str
FROM _seed_muc_conversions c
JOIN _seed_muc_unit_data f ON c.from_key = f.lookup_key AND f.business_type_uuid IS NULL
JOIN _seed_muc_unit_data t ON c.to_key = t.lookup_key AND t.business_type_uuid IS NULL
WHERE f.lookup_key IS NOT NULL AND t.lookup_key IS NOT NULL;

INSERT INTO catalog.master_unit_conversions (business_type_uuid, from_unit_uuid, to_unit_uuid, conversion_factor, formula)
SELECT f.business_type_uuid, f.unit_uuid, t.unit_uuid, c.factor, c.formula_str
FROM _seed_muc_conversions c
JOIN _seed_muc_unit_data f ON c.from_key = f.lookup_key AND f.business_type_uuid IS NOT NULL
JOIN _seed_muc_unit_data t ON c.to_key = t.lookup_key AND t.business_type_uuid = f.business_type_uuid
WHERE f.lookup_key IS NOT NULL AND t.lookup_key IS NOT NULL;

DROP TABLE _seed_muc_conversions;
DROP TABLE _seed_muc_unit_data;

INSERT INTO catalog.master_unit_conversions (business_type_uuid, from_unit_uuid, to_unit_uuid, conversion_factor, formula)
SELECT hu.business_type_uuid, hu.unit_uuid, gm.unit_uuid, 10000.0,
       '1 Hectare = 10000 sqm (১ হেক্টর = ১০০০০ বর্গমিটার)'
FROM catalog.master_units hu
JOIN catalog.master_units gm ON gm.business_type_uuid IS NULL AND gm.name = 'Square Meter'
WHERE hu.name = 'Hectare' AND hu.business_type_uuid IS NOT NULL;

-- Per-tenant/business units (instantiated from master_units on onboarding)
CREATE TABLE catalog.units (
    id BIGSERIAL PRIMARY KEY,
    unit_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    business_type_uuid UUID NOT NULL, -- Reference to business type
    name VARCHAR(50) NOT NULL,
    short_name JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}'::jsonb, -- Multilingual short name
    unit_type catalog.unit_type,
    is_base_unit BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, business_type_uuid, name)
);

CREATE TABLE catalog.unit_conversions (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    from_unit_uuid UUID NOT NULL,
    to_unit_uuid UUID NOT NULL,
    conversion_factor DECIMAL(15,6) NOT NULL,
    formula VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, from_unit_uuid, to_unit_uuid)
);

CREATE TABLE catalog.products (
    id BIGSERIAL PRIMARY KEY,
    product_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    category_uuid UUID,
    brand_uuid UUID,
    unit_uuid UUID,
    description TEXT,              -- Internal description
    product_type catalog.product_type DEFAULT 'standard',
    
    -- Pricing
    cost_price DECIMAL(15,2) DEFAULT 0,
    selling_price DECIMAL(15,2) NOT NULL,   -- In-store/base price
    mrp DECIMAL(15,2),
    wholesale_price DECIMAL(15,2),
    online_price DECIMAL(15,2),            -- Optional: different price for online channel
    
    -- Tax & Discount
    tax_type VARCHAR(20) DEFAULT 'inclusive', -- 'inclusive', 'exclusive'
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Inventory
    track_inventory BOOLEAN DEFAULT true,
    alert_quantity INT DEFAULT 10,
    
    -- Warranty
    has_warranty BOOLEAN DEFAULT false,
    warranty_period INT,
    warranty_type VARCHAR(50),
    
    -- Media
    primary_image_url VARCHAR(500),
    online_description TEXT,               -- Optional: description for online listing (HTML/long form)
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,               -- Product switch: available in tenant's own online storefront
    is_marketplace_enabled BOOLEAN DEFAULT false,  -- If true, eligible to be listed on Grameen Bazar marketplace
    marketplace_status VARCHAR(50) DEFAULT 'draft',-- draft, pending_review, approved, rejected, suspended
    
    -- Common Fields for Multiple Business Types
    -- Expiry/Batch (Pharmacy, Grocery, Cosmetics)
    expiry_date DATE,
    batch_number VARCHAR(100),
    manufacture_date DATE,
    
    -- Serial/Model (Electronics, Mobile, Hardware)
    serial_number VARCHAR(100),
    model_number VARCHAR(100),
    
    -- Dimensions/Weight (Hardware, Jewellery, Shipping)
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    weight DECIMAL(10,3), -- In base unit (kg or grams)
    
    -- Manufacturer/Origin (Pharmacy, Electronics, Grocery)
    manufacturer_name VARCHAR(255),
    manufacturer_code VARCHAR(100),
    country_of_origin VARCHAR(100),
    
    -- Flexible Attributes (JSONB for business-type-specific data)
    -- Examples:
    -- Jewellery: {"carat": "22K", "metal_type": "gold", "purity": 91.6, "making_charges": 500}
    -- Electronics: {"ram": "8GB", "storage": "256GB", "screen_size": "6.1 inch", "color": "black"}
    -- Pharmacy: {"generic_name": "Paracetamol", "strength": "500mg", "dosage_form": "tablet", "prescription_required": true}
    -- Clothing: {"size": "L", "color": "blue", "material": "cotton", "gender": "unisex"}
    -- Books: {"isbn": "978-0-123456-78-9", "author": "John Doe", "publisher": "ABC Books", "edition": "3rd", "language": "English", "pages": 350}
    -- Cosmetics: {"skin_type": "all", "ingredients": "water, glycerin", "volume_ml": 100}
    -- Grocery: {"nutritional_info": {...}, "organic": true, "halal": true}
    attributes JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, sku)
);

-- Index for JSONB attributes (for efficient querying)
CREATE INDEX idx_products_attributes ON catalog.products USING GIN (attributes);
CREATE INDEX idx_products_expiry_date ON catalog.products(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_products_batch_number ON catalog.products(batch_number) WHERE batch_number IS NOT NULL;
CREATE INDEX idx_products_serial_number ON catalog.products(serial_number) WHERE serial_number IS NOT NULL;
CREATE INDEX idx_products_model_number ON catalog.products(model_number) WHERE model_number IS NOT NULL;

CREATE TABLE catalog.product_images (
    id BIGSERIAL PRIMARY KEY,
    product_uuid UUID NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE catalog.product_variants (
    id BIGSERIAL PRIMARY KEY,
    variant_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    product_uuid UUID NOT NULL,
    variant_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    cost_price DECIMAL(15,2) DEFAULT 0,
    selling_price DECIMAL(15,2) NOT NULL,
    
    -- Variant-specific attributes (e.g., Size: L, Color: Red, Storage: 256GB)
    -- This allows variants to have different attributes than the base product
    -- Examples:
    -- Clothing: {"size": "L", "color": "red"}
    -- Electronics: {"color": "black", "storage": "256GB", "ram": "8GB"}
    -- Jewellery: {"carat": "22K", "weight_grams": 10.5}
    variant_attributes JSONB DEFAULT '{}'::jsonb,
    
    -- Variant-specific expiry/batch (if different from base product)
    expiry_date DATE,
    batch_number VARCHAR(100),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_uuid, sku)
);

-- Index for variant attributes
CREATE INDEX idx_product_variants_attributes ON catalog.product_variants USING GIN (variant_attributes);
CREATE INDEX idx_product_variants_product ON catalog.product_variants(product_uuid);

-- Product Variation Templates (for business-type-specific variation definitions)
-- This table defines what variations are available for each business type
-- Example: Jewellery shop might have "Carat", "Metal Type", "Weight"
-- Example: Clothing shop might have "Size", "Color", "Material"
CREATE TABLE catalog.product_variation_templates (
    id BIGSERIAL PRIMARY KEY,
    template_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    business_type_uuid UUID NOT NULL, -- Reference to business type
    variation_name VARCHAR(100) NOT NULL, -- e.g., "Size", "Color", "Carat", "Storage"
    variation_name_bn VARCHAR(100), -- Bengali name
    variation_type VARCHAR(50) NOT NULL, -- 'select', 'text', 'number', 'date'
    display_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    default_values JSONB, -- Array of default values for 'select' type
    -- Example for Size: ["S", "M", "L", "XL", "XXL"]
    -- Example for Carat: ["18K", "22K", "24K"]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_type_uuid, variation_name)
);

-- Index for variation templates
CREATE INDEX idx_variation_templates_business_type ON catalog.product_variation_templates(business_type_uuid);

-- Category ↔ Marketplace category mapping (Phase 2: auto-mapped via trigram / alias)
CREATE TABLE catalog.category_marketplace_mapping (
    id BIGSERIAL PRIMARY KEY,
    category_uuid UUID UNIQUE NOT NULL,          -- tenant's category
    marketplace_category_uuid UUID NOT NULL,      -- canonical marketplace category
    auto_mapped BOOLEAN DEFAULT false,            -- true = set by auto-mapping, false = manually set by admin
    confidence DECIMAL(5,4),                      -- trigram similarity score (0.0–1.0); 1.0 for alias/manual
    mapping_source VARCHAR(20) DEFAULT 'manual',  -- 'alias' | 'trigram' | 'manual'
    needs_review BOOLEAN DEFAULT false,           -- true when 0.3 ≤ confidence < 0.6
    mapped_by UUID,                               -- admin user_uuid (NULL if auto)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cat_mp_mapping_marketplace ON catalog.category_marketplace_mapping(marketplace_category_uuid);
CREATE INDEX idx_cat_mp_mapping_needs_review ON catalog.category_marketplace_mapping(needs_review) WHERE needs_review = true;

-- Brand ↔ Marketplace brand mapping (Phase 2: auto-mapped via trigram / alias)
CREATE TABLE catalog.brand_marketplace_mapping (
    id BIGSERIAL PRIMARY KEY,
    brand_uuid UUID UNIQUE NOT NULL,             -- tenant's brand
    marketplace_brand_uuid UUID NOT NULL,         -- canonical marketplace brand
    auto_mapped BOOLEAN DEFAULT false,
    confidence DECIMAL(5,4),
    mapping_source VARCHAR(20) DEFAULT 'manual',  -- 'alias' | 'trigram' | 'manual'
    needs_review BOOLEAN DEFAULT false,
    mapped_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_brand_mp_mapping_marketplace ON catalog.brand_marketplace_mapping(marketplace_brand_uuid);
CREATE INDEX idx_brand_mp_mapping_needs_review ON catalog.brand_marketplace_mapping(needs_review) WHERE needs_review = true;

-- ============================================
-- MODULE 3.5: MARKETPLACE (Grameen Bazaar)
-- ============================================

-- Enable trigram extension for auto-similarity matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Canonical marketplace categories (admin-curated, hierarchical)
CREATE TABLE marketplace.categories (
    id BIGSERIAL PRIMARY KEY,
    category_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    parent_uuid UUID REFERENCES marketplace.categories(category_uuid) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,          -- Bangla display name
    name_en VARCHAR(255) NOT NULL,       -- English display name
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mp_categories_parent ON marketplace.categories(parent_uuid);
CREATE INDEX idx_mp_categories_slug ON marketplace.categories(slug);
CREATE INDEX idx_mp_categories_active ON marketplace.categories(is_active);

-- Phase 1: Business type → marketplace category (one-time admin mapping, fully automatic)
CREATE TABLE marketplace.business_type_category_mapping (
    id BIGSERIAL PRIMARY KEY,
    business_type_uuid UUID UNIQUE NOT NULL,     -- references business.business_types
    marketplace_category_uuid UUID NOT NULL REFERENCES marketplace.categories(category_uuid) ON DELETE CASCADE,
    mapped_by UUID,                              -- admin user_uuid
    mapped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bt_mp_mapping_category ON marketplace.business_type_category_mapping(marketplace_category_uuid);

-- Phase 3: Known category aliases dictionary
CREATE TABLE marketplace.category_aliases (
    id BIGSERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,                 -- e.g. "Electric & Electronics", "ইলেকট্রনিক্স"
    marketplace_category_uuid UUID NOT NULL REFERENCES marketplace.categories(category_uuid) ON DELETE CASCADE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alias)
);
CREATE INDEX idx_mp_aliases_lower ON marketplace.category_aliases(LOWER(alias));

-- Canonical marketplace brands (admin-curated)
CREATE TABLE marketplace.brands (
    id BIGSERIAL PRIMARY KEY,
    brand_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,          -- Bangla display name (or same as English if global brand)
    name_en VARCHAR(255) NOT NULL,       -- English display name
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mp_brands_slug ON marketplace.brands(slug);
CREATE INDEX idx_mp_brands_active ON marketplace.brands(is_active);

-- Phase 3: Known brand aliases dictionary
CREATE TABLE marketplace.brand_aliases (
    id BIGSERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    marketplace_brand_uuid UUID NOT NULL REFERENCES marketplace.brands(brand_uuid) ON DELETE CASCADE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alias)
);
CREATE INDEX idx_mp_brand_aliases_lower ON marketplace.brand_aliases(LOWER(alias));

-- Phase 2: Auto-map function (trigram + alias lookup)
CREATE OR REPLACE FUNCTION marketplace.auto_map_category_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_mcat_uuid  UUID;
  v_confidence DECIMAL(5,4);
  v_source     VARCHAR(20);
BEGIN
  -- Skip if no marketplace categories exist yet
  IF NOT EXISTS (SELECT 1 FROM marketplace.categories WHERE is_active = true LIMIT 1) THEN
    RETURN NEW;
  END IF;

  -- Phase 3: Exact alias match (case-insensitive)
  SELECT marketplace_category_uuid INTO v_mcat_uuid
  FROM marketplace.category_aliases
  WHERE LOWER(TRIM(alias)) = LOWER(TRIM(NEW.name))
  LIMIT 1;

  IF v_mcat_uuid IS NOT NULL THEN
    v_confidence := 1.0;
    v_source     := 'alias';
  ELSE
    -- Phase 2: Trigram similarity across name and name_en
    SELECT mc.category_uuid,
           GREATEST(
             similarity(LOWER(NEW.name), LOWER(mc.name)),
             COALESCE(similarity(LOWER(NEW.name), LOWER(mc.name_en)), 0)
           )
    INTO v_mcat_uuid, v_confidence
    FROM marketplace.categories mc
    WHERE mc.is_active = true
      AND GREATEST(
            similarity(LOWER(NEW.name), LOWER(mc.name)),
            COALESCE(similarity(LOWER(NEW.name), LOWER(mc.name_en)), 0)
          ) >= 0.3
    ORDER BY GREATEST(
               similarity(LOWER(NEW.name), LOWER(mc.name)),
               COALESCE(similarity(LOWER(NEW.name), LOWER(mc.name_en)), 0)
             ) DESC
    LIMIT 1;

    v_source := 'trigram';
  END IF;

  IF v_mcat_uuid IS NOT NULL THEN
    INSERT INTO catalog.category_marketplace_mapping
      (category_uuid, marketplace_category_uuid, auto_mapped, confidence, mapping_source, needs_review)
    VALUES (
      NEW.category_uuid,
      v_mcat_uuid,
      true,
      v_confidence,
      v_source,
      v_confidence < 0.6
    )
    ON CONFLICT (category_uuid) DO UPDATE SET
      marketplace_category_uuid = EXCLUDED.marketplace_category_uuid,
      auto_mapped               = true,
      confidence                = EXCLUDED.confidence,
      mapping_source            = EXCLUDED.mapping_source,
      needs_review              = EXCLUDED.needs_review,
      updated_at                = CURRENT_TIMESTAMP
    WHERE catalog.category_marketplace_mapping.mapping_source != 'manual'; -- never overwrite manual mappings
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_map_category
AFTER INSERT OR UPDATE OF name ON catalog.categories
FOR EACH ROW EXECUTE FUNCTION marketplace.auto_map_category_fn();

-- Phase 2: Auto-map brand function (alias → trigram fallback)
CREATE OR REPLACE FUNCTION marketplace.auto_map_brand_fn()
RETURNS TRIGGER AS $$
DECLARE
  v_mbrand_uuid UUID;
  v_confidence  DECIMAL(5,4);
  v_source      VARCHAR(20);
BEGIN
  -- Skip if no marketplace brands exist yet
  IF NOT EXISTS (SELECT 1 FROM marketplace.brands WHERE is_active = true LIMIT 1) THEN
    RETURN NEW;
  END IF;

  -- Phase 3: Exact alias match (case-insensitive)
  SELECT marketplace_brand_uuid INTO v_mbrand_uuid
  FROM marketplace.brand_aliases
  WHERE LOWER(TRIM(alias)) = LOWER(TRIM(NEW.name))
  LIMIT 1;

  IF v_mbrand_uuid IS NOT NULL THEN
    v_confidence := 1.0;
    v_source     := 'alias';
  ELSE
    -- Phase 2: Trigram similarity across name and name_en
    SELECT mb.brand_uuid,
           GREATEST(
             similarity(LOWER(NEW.name), LOWER(mb.name)),
             COALESCE(similarity(LOWER(NEW.name), LOWER(mb.name_en)), 0)
           )
    INTO v_mbrand_uuid, v_confidence
    FROM marketplace.brands mb
    WHERE mb.is_active = true
      AND GREATEST(
            similarity(LOWER(NEW.name), LOWER(mb.name)),
            COALESCE(similarity(LOWER(NEW.name), LOWER(mb.name_en)), 0)
          ) >= 0.3
    ORDER BY GREATEST(
               similarity(LOWER(NEW.name), LOWER(mb.name)),
               COALESCE(similarity(LOWER(NEW.name), LOWER(mb.name_en)), 0)
             ) DESC
    LIMIT 1;

    v_source := 'trigram';
  END IF;

  IF v_mbrand_uuid IS NOT NULL THEN
    INSERT INTO catalog.brand_marketplace_mapping
      (brand_uuid, marketplace_brand_uuid, auto_mapped, confidence, mapping_source, needs_review)
    VALUES (
      NEW.brand_uuid,
      v_mbrand_uuid,
      true,
      v_confidence,
      v_source,
      v_confidence < 0.6
    )
    ON CONFLICT (brand_uuid) DO UPDATE SET
      marketplace_brand_uuid = EXCLUDED.marketplace_brand_uuid,
      auto_mapped            = true,
      confidence             = EXCLUDED.confidence,
      mapping_source         = EXCLUDED.mapping_source,
      needs_review           = EXCLUDED.needs_review,
      updated_at             = CURRENT_TIMESTAMP
    WHERE catalog.brand_marketplace_mapping.mapping_source != 'manual';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_map_brand
AFTER INSERT OR UPDATE OF name ON catalog.brands
FOR EACH ROW EXECUTE FUNCTION marketplace.auto_map_brand_fn();

-- ============================================
-- MARKETPLACE SEED DATA
-- ============================================

-- Seed 13 canonical marketplace categories
INSERT INTO marketplace.categories (name, name_en, slug, display_order) VALUES
  ('নিত্যপণ্যে',   'Daily Essentials', 'daily-essentials', 1),
  ('ঔষধ',          'Medicine',         'medicine',          2),
  ('ফ্রেশ খাবার',  'Fresh Food',       'fresh-food',        3),
  ('শস্য',         'Grains',           'grains',            4),
  ('গার্মেন্টস',   'Garments',         'garments',          5),
  ('কসমেটিক্স',    'Cosmetics',        'cosmetics',         6),
  ('বই',           'Books',            'books',             7),
  ('নার্সারি',     'Nursery',          'nursery',           8),
  ('ইলেক্ট্রনিক্স','Electronics',      'electronics',       9),
  ('কেমিক্যাল',    'Chemicals',        'chemicals',         10),
  ('হার্ডওয়্যার',  'Hardware',         'hardware',          11),
  ('সার্ভিস',      'Service',          'service',           12),
  ('পশু খাদ্য',    'Animal Feed',      'animal-feed',       13);

-- Seed common English & Bangla aliases → canonical categories
INSERT INTO marketplace.category_aliases (alias, marketplace_category_uuid) VALUES
  -- Daily Essentials
  ('Daily Essentials',   (SELECT category_uuid FROM marketplace.categories WHERE slug = 'daily-essentials')),
  ('Essentials',         (SELECT category_uuid FROM marketplace.categories WHERE slug = 'daily-essentials')),
  ('নিত্যপণ্য',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'daily-essentials')),
  ('নিত্য প্রয়োজনীয়',  (SELECT category_uuid FROM marketplace.categories WHERE slug = 'daily-essentials')),
  -- Medicine
  ('Medicine',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'medicine')),
  ('Medicines',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'medicine')),
  ('Pharmacy',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'medicine')),
  ('ওষুধ',               (SELECT category_uuid FROM marketplace.categories WHERE slug = 'medicine')),
  ('ঔষধপত্র',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'medicine')),
  -- Fresh Food
  ('Fresh Food',         (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  ('Fresh Produce',      (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  ('Vegetables',         (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  ('Fruits',             (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  ('সবজি',               (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  ('তাজা খাবার',         (SELECT category_uuid FROM marketplace.categories WHERE slug = 'fresh-food')),
  -- Grains
  ('Grains',             (SELECT category_uuid FROM marketplace.categories WHERE slug = 'grains')),
  ('Rice',               (SELECT category_uuid FROM marketplace.categories WHERE slug = 'grains')),
  ('Cereals',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'grains')),
  ('চাল',                (SELECT category_uuid FROM marketplace.categories WHERE slug = 'grains')),
  ('শস্যদানা',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'grains')),
  -- Garments
  ('Garments',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'garments')),
  ('Clothing',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'garments')),
  ('Fashion',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'garments')),
  ('পোশাক',              (SELECT category_uuid FROM marketplace.categories WHERE slug = 'garments')),
  ('পোষাক',              (SELECT category_uuid FROM marketplace.categories WHERE slug = 'garments')),
  -- Cosmetics
  ('Cosmetics',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'cosmetics')),
  ('Beauty',             (SELECT category_uuid FROM marketplace.categories WHERE slug = 'cosmetics')),
  ('Personal Care',      (SELECT category_uuid FROM marketplace.categories WHERE slug = 'cosmetics')),
  ('সৌন্দর্য',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'cosmetics')),
  -- Books
  ('Books',              (SELECT category_uuid FROM marketplace.categories WHERE slug = 'books')),
  ('Stationery',         (SELECT category_uuid FROM marketplace.categories WHERE slug = 'books')),
  ('বই পুস্তক',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'books')),
  ('স্টেশনারি',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'books')),
  -- Nursery
  ('Nursery',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'nursery')),
  ('Plants',             (SELECT category_uuid FROM marketplace.categories WHERE slug = 'nursery')),
  ('Gardening',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'nursery')),
  ('গাছপালা',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'nursery')),
  -- Electronics
  ('Electronics',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  ('Electric',              (SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  ('Electric & Electronics',(SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  ('Electrical',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  ('ইলেকট্রিক',             (SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  ('ইলেকট্রনিক্স',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'electronics')),
  -- Chemicals
  ('Chemicals',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'chemicals')),
  ('Chemical',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'chemicals')),
  ('রাসায়নিক',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'chemicals')),
  -- Hardware
  ('Hardware',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'hardware')),
  ('Tools',              (SELECT category_uuid FROM marketplace.categories WHERE slug = 'hardware')),
  ('Hardware & Tools',   (SELECT category_uuid FROM marketplace.categories WHERE slug = 'hardware')),
  ('হার্ডওয়্যার সরঞ্জাম',(SELECT category_uuid FROM marketplace.categories WHERE slug = 'hardware')),
  -- Service
  ('Service',            (SELECT category_uuid FROM marketplace.categories WHERE slug = 'service')),
  ('Services',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'service')),
  ('সেবা',               (SELECT category_uuid FROM marketplace.categories WHERE slug = 'service')),
  -- Animal Feed
  ('Animal Feed',        (SELECT category_uuid FROM marketplace.categories WHERE slug = 'animal-feed')),
  ('Pet Food',           (SELECT category_uuid FROM marketplace.categories WHERE slug = 'animal-feed')),
  ('Livestock Feed',     (SELECT category_uuid FROM marketplace.categories WHERE slug = 'animal-feed')),
  ('পশু খাদ্য',          (SELECT category_uuid FROM marketplace.categories WHERE slug = 'animal-feed')),
  ('গবাদি পশুর খাবার',   (SELECT category_uuid FROM marketplace.categories WHERE slug = 'animal-feed'));

-- ============================================
-- MODULE 4: INVENTORY MANAGEMENT
-- ============================================

CREATE TABLE inventory.warehouses (
    id BIGSERIAL PRIMARY KEY,
    warehouse_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    warehouse_type VARCHAR(50) DEFAULT 'storage', -- 'storage', 'shop', 'office', 'other'
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    phone VARCHAR(20),
    manager_uuid UUID, -- External user UUID from auth server
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, code)
);

CREATE TABLE inventory.stock (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    warehouse_uuid UUID NOT NULL,
    quantity DECIMAL(15,3) DEFAULT 0,
    reserved_quantity DECIMAL(15,3) DEFAULT 0,
    available_quantity DECIMAL(15,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_stock_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, product_uuid, variant_uuid, warehouse_uuid)
);

CREATE TABLE inventory.stock_movements (
    id BIGSERIAL PRIMARY KEY,
    movement_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    warehouse_uuid UUID NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    quantity DECIMAL(15,3) NOT NULL,
    reference_type VARCHAR(50),
    reference_uuid UUID, -- UUID of related entity
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory.stock_adjustments (
    id BIGSERIAL PRIMARY KEY,
    adjustment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    warehouse_uuid UUID NOT NULL,
    adjustment_date DATE NOT NULL,
    adjustment_type VARCHAR(50) NOT NULL,
    reason TEXT,
    total_items INT DEFAULT 0,
    approved_by_uuid UUID, -- External user UUID from auth server
    created_by_uuid UUID, -- External user UUID from auth server
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory.stock_adjustment_items (
    id BIGSERIAL PRIMARY KEY,
    adjustment_uuid UUID NOT NULL,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    current_quantity DECIMAL(15,3) NOT NULL,
    adjusted_quantity DECIMAL(15,3) NOT NULL,
    difference DECIMAL(15,3) GENERATED ALWAYS AS (adjusted_quantity - current_quantity) STORED,
    notes TEXT
);

-- MODULE 5: SALES MANAGEMENT
-- ============================================

CREATE TABLE sales.customers (
    -- Global customer identity: auth server user UUID (universal ID)
    user_uuid UUID PRIMARY KEY
        REFERENCES core.user_cache(user_uuid) ON DELETE CASCADE,

    -- Global / shared customer business fields (identity comes from auth server)
    customer_code     VARCHAR(50),
    customer_type     VARCHAR(50) DEFAULT 'retail',
    opening_balance   DECIMAL(15,2) DEFAULT 0,
    current_balance   DECIMAL(15,2) DEFAULT 0,
    credit_limit      DECIMAL(15,2) DEFAULT 0,
    loyalty_points    INT DEFAULT 0,
    notes             TEXT,
    is_active         BOOLEAN DEFAULT true,

    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link table: which tenants this global customer (user_uuid) belongs to
CREATE TABLE sales.tenant_customers (
    tenant_uuid UUID NOT NULL
        REFERENCES core.tenants(tenant_uuid) ON DELETE CASCADE,
    user_uuid   UUID NOT NULL
        REFERENCES sales.customers(user_uuid) ON DELETE CASCADE,
    created_by_uuid UUID, -- auth user who created this relation
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tenant_uuid, user_uuid)
);

CREATE TABLE sales.orders (
    id BIGSERIAL PRIMARY KEY,
    order_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    user_uuid UUID,
    warehouse_uuid UUID, -- Optional: POS orders should set this; online orders may leave it NULL
    order_date DATE NOT NULL,
    sale_type VARCHAR(50) DEFAULT 'pos',-- 'pos', 'online', 'walk-in'
    
    -- Amounts
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'fixed',
    discount_value DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    due_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    change_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    status sales.order_status DEFAULT 'completed',
    payment_status sales.payment_status DEFAULT 'unpaid',
    
    -- POS Specific
    pos_session_uuid UUID,
    
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, order_number)
);

CREATE TABLE sales.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_uuid UUID NOT NULL,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'fixed',
    discount_value DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    has_warranty BOOLEAN DEFAULT false,
    warranty_months INT,
    warranty_expiry_date DATE,
    notes TEXT
);

CREATE TABLE sales.pos_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL,
    session_number VARCHAR(50) NOT NULL,
    warehouse_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL REFERENCES core.user_cache(user_uuid), -- Auth server user UUID operating this session
    device_id VARCHAR(255),              -- Identifier for POS device (mobile/desktop/web)
    client_type VARCHAR(20) DEFAULT 'pos', -- 'web', 'desktop', 'android', 'ios', etc.
    opening_time TIMESTAMP NOT NULL,
    closing_time TIMESTAMP,
    opening_balance DECIMAL(15,2) NOT NULL,
    closing_balance DECIMAL(15,2),
    expected_balance DECIMAL(15,2),
    difference DECIMAL(15,2),
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_cash DECIMAL(15,2) DEFAULT 0,
    total_card DECIMAL(15,2) DEFAULT 0,
    total_mobile_banking DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, session_number)
);

CREATE TABLE sales.returns (
    id BIGSERIAL PRIMARY KEY,
    return_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    return_number VARCHAR(50) NOT NULL,
    order_uuid UUID NOT NULL,
    user_uuid UUID,
    warehouse_uuid UUID NOT NULL,
    return_date DATE NOT NULL,
    return_type VARCHAR(50) DEFAULT 'refund',
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    refund_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    approved_by_uuid UUID,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, return_number)
);

CREATE TABLE sales.return_items (
    id BIGSERIAL PRIMARY KEY,
    return_uuid UUID NOT NULL,
    order_item_id BIGINT,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    quantity DECIMAL(15,3) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    reason TEXT,
    condition VARCHAR(50)
);

-- ============================================
-- MODULE 6: DELIVERY & LOGISTICS
-- ============================================

CREATE SCHEMA IF NOT EXISTS delivery;

-- Master list of delivery partners (own + 3rd party)
CREATE TABLE IF NOT EXISTS delivery.partners (
    id BIGSERIAL PRIMARY KEY,
    partner_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID, -- NULL = global partner definition (shared), non-NULL = tenant-specific override

    code VARCHAR(50) NOT NULL UNIQUE,  -- e.g. GRAMEEN_DELIVERY, STEADFAST, REDEX, ECURIER, SUNDARBAN
    name VARCHAR(255) NOT NULL,        -- English name
    name_bn VARCHAR(255),              -- Bangla name

    partner_type VARCHAR(50) NOT NULL DEFAULT 'third_party', -- 'own', 'third_party'

    api_base_url VARCHAR(500),         -- For partners with API integration
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    webhook_url VARCHAR(500),          -- Our callback URL registered at partner
    tracking_url_template VARCHAR(500),-- e.g. https://track.partner.com/{tracking_code}

    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    contact_person VARCHAR(255),
    address TEXT,

    is_cod_supported BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_partners_tenant ON delivery.partners(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_active ON delivery.partners(is_active);

-- Shipments created for online orders
CREATE TABLE IF NOT EXISTS delivery.order_shipments (
    id BIGSERIAL PRIMARY KEY,
    shipment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL,
    order_uuid UUID NOT NULL, -- references sales.orders(order_uuid) logically

    delivery_partner_uuid UUID NOT NULL
        REFERENCES delivery.partners(partner_uuid) ON DELETE RESTRICT,

    consignment_id VARCHAR(100),   -- ID generated by partner
    tracking_code VARCHAR(100),    -- Code used for tracking URL

    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, pickup_scheduled, in_transit, delivered, cancelled, returned, failed
    status_reason TEXT,

    is_cod BOOLEAN DEFAULT true,
    cod_amount DECIMAL(15,2),      -- Amount partner will collect from customer
    delivery_charge DECIMAL(15,2) DEFAULT 0,
    additional_charges JSONB,      -- Any fuel surcharge, remote area fee etc.

    pickup_address JSONB,          -- Structured pickup details (name, phone, address, location ids)
    delivery_address JSONB,        -- Structured delivery details (name, phone, address, location ids)

    estimated_delivery_date DATE,
    delivered_at TIMESTAMP,

    last_partner_payload JSONB,    -- Raw payload from last partner API call / webhook
    notes TEXT,

    created_by_uuid UUID,          -- auth user who created shipment
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_shipments_tenant ON delivery.order_shipments(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_delivery_shipments_business ON delivery.order_shipments(business_uuid);
CREATE INDEX IF NOT EXISTS idx_delivery_shipments_order ON delivery.order_shipments(order_uuid);
CREATE INDEX IF NOT EXISTS idx_delivery_shipments_partner ON delivery.order_shipments(delivery_partner_uuid);
CREATE INDEX IF NOT EXISTS idx_delivery_shipments_status ON delivery.order_shipments(status);

-- Seed common delivery partners for Bangladesh
INSERT INTO delivery.partners (tenant_uuid, code, name, name_bn, partner_type, is_cod_supported, is_active)
VALUES
  (NULL, 'GRAMEEN_DELIVERY', 'Grameen Delivery', 'গ্রামীণ ডেলিভারি', 'own',         true,  true),
  (NULL, 'STEADFAST',        'Steadfast Courier', 'স্টেডফাস্ট কুরিয়ার', 'third_party', true,  true),
  (NULL, 'REDEX',            'Redex', 'রেডেক্স',                    'third_party', true,  true),
  (NULL, 'ECURIER',          'eCourier', 'ই কুরিয়ার',              'third_party', true,  true),
  (NULL, 'SUNDARBAN',        'Sundarban Courier Service', 'সুন্দরবন কুরিয়ার সার্ভিস', 'third_party', true,  true),
  (NULL, 'PATHAO',           'Pathao Courier', 'পাঠাও কুরিয়ার',     'third_party', true,  true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- MODULE 7: PURCHASING MANAGEMENT
-- ============================================

CREATE TABLE purchasing.suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    mobile VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Bangladesh',
    contact_person VARCHAR(255),
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    tin_number VARCHAR(50),
    trade_license VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, phone)
);

CREATE TABLE purchasing.purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    po_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    po_number VARCHAR(50) NOT NULL,
    supplier_uuid UUID NOT NULL,
    warehouse_uuid UUID NOT NULL,
    purchase_date DATE NOT NULL,
    expected_delivery_date DATE,
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_type VARCHAR(20) DEFAULT 'fixed',
    discount_value DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    other_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    due_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status purchasing.po_status DEFAULT 'pending',
    payment_status sales.payment_status DEFAULT 'unpaid',
    notes TEXT,
    created_by_uuid UUID, -- External user UUID from auth server
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, po_number)
);

CREATE TABLE purchasing.purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    po_uuid UUID NOT NULL,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    quantity DECIMAL(15,3) NOT NULL,
    received_quantity DECIMAL(15,3) DEFAULT 0,
    unit_cost DECIMAL(15,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    notes TEXT
);

CREATE TABLE purchasing.purchase_returns (
    id BIGSERIAL PRIMARY KEY,
    return_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    return_number VARCHAR(50) NOT NULL,
    po_uuid UUID NOT NULL,
    supplier_uuid UUID NOT NULL,
    warehouse_uuid UUID NOT NULL,
    return_date DATE NOT NULL,
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    approved_by_uuid UUID,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, return_number)
);

CREATE TABLE purchasing.purchase_return_items (
    id BIGSERIAL PRIMARY KEY,
    return_uuid UUID NOT NULL,
    po_item_id BIGINT,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    quantity DECIMAL(15,3) NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(15,2) NOT NULL,
    total DECIMAL(15,2) NOT NULL,
    reason TEXT
);

-- ============================================
-- MODULE 7: WARRANTY MANAGEMENT
-- ============================================

CREATE TABLE warranty.warranties (
    id BIGSERIAL PRIMARY KEY,
    warranty_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    warranty_number VARCHAR(50) NOT NULL,
    order_uuid UUID NOT NULL,
    order_item_id BIGINT,
    user_uuid UUID,
    product_uuid UUID NOT NULL,
    variant_uuid UUID,
    warranty_type VARCHAR(50) NOT NULL,
    warranty_period INT NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    terms_and_conditions TEXT,
    notes TEXT,
    created_by_uuid UUID, -- External user UUID from auth server
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, warranty_number)
);

CREATE TABLE warranty.claims (
    id BIGSERIAL PRIMARY KEY,
    claim_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    claim_number VARCHAR(50) NOT NULL,
    warranty_uuid UUID NOT NULL REFERENCES warranty.warranties(warranty_uuid) ON DELETE RESTRICT,
    user_uuid UUID,
    product_uuid UUID NOT NULL,
    claim_date DATE NOT NULL,
    issue_description TEXT NOT NULL,
    claim_type VARCHAR(50),
    resolution_type VARCHAR(50),
    resolution_date DATE,
    resolution_notes TEXT,
    cost DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by_uuid UUID,
    handled_by_uuid UUID,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, claim_number)
);

-- ============================================
-- MODULE 8: FINANCE MANAGEMENT
-- ============================================

CREATE TABLE finance.payment_methods (
    id BIGSERIAL PRIMARY KEY,
    payment_method_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type finance.payment_method_type NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

CREATE TABLE finance.payments (
    id BIGSERIAL PRIMARY KEY,
    payment_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    payment_number VARCHAR(50) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_uuid UUID,
    user_uuid UUID,
    supplier_uuid UUID,
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method_uuid UUID NOT NULL,
    transaction_id VARCHAR(100),
    card_number VARCHAR(20),
    mobile_banking_number VARCHAR(20),
    bank_name VARCHAR(100),
    cheque_number VARCHAR(50),
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, payment_number)
);

CREATE TABLE finance.expense_categories (
    id BIGSERIAL PRIMARY KEY,
    category_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

CREATE TABLE finance.expenses (
    id BIGSERIAL PRIMARY KEY,
    expense_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    expense_number VARCHAR(50) NOT NULL,
    category_uuid UUID,
    warehouse_uuid UUID,
    expense_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method_uuid UUID,
    description TEXT,
    receipt_url VARCHAR(500),
    approved_by_uuid UUID, -- External user UUID from auth server
    created_by_uuid UUID, -- External user UUID from auth server
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, expense_number)
);

-- ============================================
-- MODULE 8B: ACCOUNTING MANAGEMENT
-- ============================================

CREATE TABLE finance.chart_of_accounts (
    id BIGSERIAL PRIMARY KEY,
    account_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_bn VARCHAR(255), -- Bengali name
    account_type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_account_uuid UUID, -- Self-reference for hierarchical accounts
    account_category VARCHAR(100), -- 'current_asset', 'fixed_asset', 'current_liability', etc.
    is_active BOOLEAN DEFAULT true,
    is_system_account BOOLEAN DEFAULT false, -- System accounts cannot be deleted
    opening_balance DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, account_code)
);

CREATE TABLE finance.journal_entries (
    id BIGSERIAL PRIMARY KEY,
    entry_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference_type VARCHAR(50), -- 'invoice', 'payment', 'purchase', 'adjustment', etc.
    reference_uuid UUID, -- UUID of related entity
    reference_number VARCHAR(100), -- Human-readable reference (e.g., invoice number)
    total_debit DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_credit DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'posted', 'cancelled'
    posted_at TIMESTAMP,
    posted_by_uuid UUID,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, entry_number)
);

CREATE TABLE finance.journal_entry_lines (
    id BIGSERIAL PRIMARY KEY,
    entry_uuid UUID NOT NULL REFERENCES finance.journal_entries(entry_uuid) ON DELETE CASCADE,
    account_uuid UUID NOT NULL REFERENCES finance.chart_of_accounts(account_uuid) ON DELETE RESTRICT,
    line_number INT NOT NULL,
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE finance.general_ledger (
    id BIGSERIAL PRIMARY KEY,
    ledger_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    account_uuid UUID NOT NULL REFERENCES finance.chart_of_accounts(account_uuid) ON DELETE RESTRICT,
    transaction_date DATE NOT NULL,
    entry_uuid UUID REFERENCES finance.journal_entries(entry_uuid) ON DELETE SET NULL, -- Reference to journal entry
    reference_type VARCHAR(50),
    reference_uuid UUID,
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    running_balance DECIMAL(15,2) NOT NULL, -- Calculated running balance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for accounting module
CREATE INDEX idx_chart_of_accounts_tenant ON finance.chart_of_accounts(tenant_uuid);
CREATE INDEX idx_chart_of_accounts_type ON finance.chart_of_accounts(account_type);
CREATE INDEX idx_journal_entries_tenant ON finance.journal_entries(tenant_uuid);
CREATE INDEX idx_journal_entries_date ON finance.journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON finance.journal_entries(status);
CREATE INDEX idx_journal_entry_lines_entry ON finance.journal_entry_lines(entry_uuid);
CREATE INDEX idx_journal_entry_lines_account ON finance.journal_entry_lines(account_uuid);
CREATE INDEX idx_general_ledger_account ON finance.general_ledger(account_uuid, transaction_date);
CREATE INDEX idx_general_ledger_tenant ON finance.general_ledger(tenant_uuid);

-- Customer to Account Receivable mapping (for Halkhata and customer balance tracking)
CREATE TABLE finance.customer_account_mapping (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL, -- Reference to sales.customers.user_uuid (no FK for loose coupling)
    account_receivable_uuid UUID NOT NULL REFERENCES finance.chart_of_accounts(account_uuid) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, user_uuid, account_receivable_uuid)
);

CREATE INDEX idx_customer_account_mapping_user ON finance.customer_account_mapping(user_uuid);
CREATE INDEX idx_customer_account_mapping_account ON finance.customer_account_mapping(account_receivable_uuid);
CREATE INDEX idx_customer_account_mapping_tenant ON finance.customer_account_mapping(tenant_uuid);

-- ============================================
-- MODULE 8C: HALKHATA (TRADITIONAL LEDGER - PART OF ACCOUNTING)
-- ============================================
-- Halkhata is a traditional Bangladeshi business practice where businesses
-- invite customers with outstanding debts to come on a specific date to pay
-- their dues. In return, customers receive treats from the business.
-- This is part of the accounting/finance module.
--
-- IMPORTANT: Halkhata does NOT duplicate accounting. It uses existing accounting data:
-- 1. sales.customers - for customer information (name, phone, address)
-- 2. finance.customer_account_mapping - links customers to their AR accounts
-- 3. finance.chart_of_accounts - customer accounts receivable accounts
-- 4. finance.general_ledger - calculates outstanding balances (debit - credit)
-- 5. finance.journal_entries - transaction history (when payments are made)
--
-- HOW IT WORKS:
-- - Customer balances are calculated from finance.general_ledger, NOT stored separately
-- - When creating Halkhata event, system queries finance.api_halkhata_customer_balances view
-- - Outstanding balance in halkhata_invitations is a snapshot at invitation time
-- - When customer pays during event, a journal entry is created in finance.journal_entries
-- - The payment_entry_uuid in halkhata_invitations links to the journal entry
-- - This ensures single source of truth: all accounting happens in finance module

CREATE TABLE finance.halkhata_events (
    id BIGSERIAL PRIMARY KEY,
    event_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_name_bn VARCHAR(255), -- Bengali name (e.g., 'হালখাতা ২০২৪')
    event_date DATE NOT NULL, -- The specific date when customers are invited
    event_time TIME, -- Optional time for the event
    venue VARCHAR(255), -- Location/venue for the event
    description TEXT,
    description_bn TEXT, -- Bengali description
    invitation_message TEXT,
    invitation_message_bn TEXT, -- Bengali invitation message
    treat_budget DECIMAL(15,2) DEFAULT 0, -- Budget allocated for customer treats
    total_invitations_sent INT DEFAULT 0,
    total_customers_attended INT DEFAULT 0,
    total_collected DECIMAL(15,2) DEFAULT 0, -- Total amount collected on event date
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
    is_active BOOLEAN DEFAULT true,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE finance.halkhata_invitations (
    id BIGSERIAL PRIMARY KEY,
    invitation_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    event_uuid UUID NOT NULL REFERENCES finance.halkhata_events(event_uuid) ON DELETE CASCADE,
    user_uuid UUID NOT NULL, -- Reference to sales.customers.user_uuid (no FK for loose coupling)
    account_receivable_uuid UUID, -- Reference to finance.chart_of_accounts (customer's AR account)
    invitation_code VARCHAR(50) NOT NULL,
    outstanding_balance DECIMAL(15,2) DEFAULT 0, -- Balance at time of invitation (snapshot from general_ledger)
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'attended', 'expired', 'cancelled'
    sent_at TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    accepted_by_uuid UUID,
    attended_at TIMESTAMP, -- When customer actually attended the event
    amount_paid DECIMAL(15,2) DEFAULT 0, -- Amount paid during the event (creates journal entry)
    payment_entry_uuid UUID, -- Reference to finance.journal_entries (payment journal entry created)
    treat_received VARCHAR(255), -- Description of treat given to customer
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, invitation_code)
);

CREATE TABLE finance.halkhata_settings (
    id BIGSERIAL PRIMARY KEY,
    tenant_uuid UUID NOT NULL,
    enable_auto_invitation BOOLEAN DEFAULT false,
    default_invitation_message TEXT,
    default_invitation_message_bn TEXT, -- Bengali message
    enable_notifications BOOLEAN DEFAULT true,
    notification_frequency VARCHAR(50) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    default_treat_budget_per_customer DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid)
);

-- Indexes for halkhata module
CREATE INDEX idx_halkhata_events_tenant ON finance.halkhata_events(tenant_uuid);
CREATE INDEX idx_halkhata_events_date ON finance.halkhata_events(event_date);
CREATE INDEX idx_halkhata_events_status ON finance.halkhata_events(status);
CREATE INDEX idx_halkhata_invitations_tenant ON finance.halkhata_invitations(tenant_uuid);
CREATE INDEX idx_halkhata_invitations_event ON finance.halkhata_invitations(event_uuid);
CREATE INDEX idx_halkhata_invitations_user ON finance.halkhata_invitations(user_uuid);
CREATE INDEX idx_halkhata_invitations_account_receivable ON finance.halkhata_invitations(account_receivable_uuid);
CREATE INDEX idx_halkhata_invitations_code ON finance.halkhata_invitations(invitation_code);
CREATE INDEX idx_halkhata_invitations_status ON finance.halkhata_invitations(status);
CREATE INDEX idx_halkhata_invitations_payment_entry ON finance.halkhata_invitations(payment_entry_uuid);

-- ============================================
-- MODULE 9: HR MANAGEMENT
-- ============================================

CREATE TABLE hr.departments (
    id BIGSERIAL PRIMARY KEY,
    department_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255), -- Bengali name
    code VARCHAR(50),
    description TEXT,
    manager_uuid UUID, -- External user UUID from auth server
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

CREATE TABLE hr.positions (
    id BIGSERIAL PRIMARY KEY,
    position_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    department_uuid UUID REFERENCES hr.departments(department_uuid) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_bn VARCHAR(255), -- Bengali title
    code VARCHAR(50),
    description TEXT,
    min_salary DECIMAL(15,2),
    max_salary DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, title)
);

CREATE TABLE hr.employees (
    -- Global employee identity: auth server user UUID (universal ID)
    user_uuid UUID PRIMARY KEY
        REFERENCES core.user_cache(user_uuid) ON DELETE CASCADE,

    tenant_uuid UUID NOT NULL,
    employee_id VARCHAR(50) NOT NULL,

    department_uuid UUID REFERENCES hr.departments(department_uuid) ON DELETE SET NULL,
    position_uuid UUID REFERENCES hr.positions(position_uuid) ON DELETE SET NULL,
    join_date DATE NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'full_time', -- 'full_time', 'part_time', 'contract', 'intern'
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'terminated', 'on_leave'
    termination_date DATE,
    termination_reason TEXT,

    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    nid_number VARCHAR(50), -- National ID
    tin_number VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    bank_branch VARCHAR(100),
    notes TEXT,

    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(tenant_uuid, employee_id)
);

CREATE TABLE hr.employee_salary (
    id BIGSERIAL PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES hr.employees(user_uuid) ON DELETE CASCADE,
    basic_salary DECIMAL(15,2) NOT NULL,
    allowances JSONB DEFAULT '{}'::jsonb, -- {"house_rent": 5000, "transport": 2000, "medical": 1000}
    deductions JSONB DEFAULT '{}'::jsonb, -- {"tax": 1000, "provident_fund": 500}
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for HR module
CREATE INDEX idx_departments_tenant ON hr.departments(tenant_uuid);
CREATE INDEX idx_positions_tenant ON hr.positions(tenant_uuid);
CREATE INDEX idx_positions_department ON hr.positions(department_uuid);
CREATE INDEX idx_employees_tenant ON hr.employees(tenant_uuid);
CREATE INDEX idx_employees_user ON hr.employees(user_uuid);
CREATE INDEX idx_employees_department ON hr.employees(department_uuid);
CREATE INDEX idx_employees_status ON hr.employees(status);
CREATE INDEX idx_employee_salary_employee ON hr.employee_salary(user_uuid);

-- ============================================
-- MODULE 10: PAYROLL MANAGEMENT
-- ============================================

CREATE TABLE payroll.salary_components (
    id BIGSERIAL PRIMARY KEY,
    component_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255), -- Bengali name
    component_type VARCHAR(50) NOT NULL, -- 'allowance', 'deduction', 'overtime', 'bonus'
    is_taxable BOOLEAN DEFAULT false,
    is_percentage BOOLEAN DEFAULT false, -- If true, value is percentage of basic salary
    default_value DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

CREATE TABLE payroll.payroll_periods (
    id BIGSERIAL PRIMARY KEY,
    period_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    period_code VARCHAR(50) NOT NULL, -- '2024-01', '2024-02', etc.
    period_name VARCHAR(255) NOT NULL,
    period_name_bn VARCHAR(255), -- Bengali name (e.g., 'জানুয়ারি ২০২৪')
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'processing', 'completed', 'cancelled'
    total_employees INT DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    processed_at TIMESTAMP,
    processed_by_uuid UUID,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, period_code)
);

CREATE TABLE payroll.payroll_records (
    id BIGSERIAL PRIMARY KEY,
    payroll_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    payroll_number VARCHAR(50) NOT NULL,
    period_uuid UUID NOT NULL REFERENCES payroll.payroll_periods(period_uuid) ON DELETE RESTRICT,
    user_uuid UUID NOT NULL REFERENCES hr.employees(user_uuid) ON DELETE RESTRICT,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL DEFAULT 0,
    allowances DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    overtime DECIMAL(15,2) DEFAULT 0,
    bonus DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) GENERATED ALWAYS AS (basic_salary + allowances + overtime + bonus) STORED,
    net_salary DECIMAL(15,2) GENERATED ALWAYS AS (basic_salary + allowances + overtime + bonus - deductions) STORED,
    payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'cheque'
    payment_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'cancelled'
    bank_account_number VARCHAR(50),
    transaction_id VARCHAR(100),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'paid', 'cancelled'
    approved_by_uuid UUID,
    approved_at TIMESTAMP,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, payroll_number)
);

CREATE TABLE payroll.payroll_details (
    id BIGSERIAL PRIMARY KEY,
    payroll_uuid UUID NOT NULL REFERENCES payroll.payroll_records(payroll_uuid) ON DELETE CASCADE,
    component_uuid UUID REFERENCES payroll.salary_components(component_uuid) ON DELETE SET NULL,
    component_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    is_percentage BOOLEAN DEFAULT false,
    percentage_value DECIMAL(5,2),
    notes TEXT
);

CREATE TABLE payroll.attendance (
    id BIGSERIAL PRIMARY KEY,
    attendance_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    user_uuid UUID NOT NULL REFERENCES hr.employees(user_uuid) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    total_hours DECIMAL(5,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'late', 'half_day', 'leave'
    leave_type VARCHAR(50), -- 'sick', 'casual', 'annual', 'unpaid'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, user_uuid, attendance_date)
);

-- Indexes for payroll module
CREATE INDEX idx_salary_components_tenant ON payroll.salary_components(tenant_uuid);
CREATE INDEX idx_payroll_periods_tenant ON payroll.payroll_periods(tenant_uuid);
CREATE INDEX idx_payroll_periods_status ON payroll.payroll_periods(status);
CREATE INDEX idx_payroll_records_tenant ON payroll.payroll_records(tenant_uuid);
CREATE INDEX idx_payroll_records_period ON payroll.payroll_records(period_uuid);
CREATE INDEX idx_payroll_records_employee ON payroll.payroll_records(user_uuid);
CREATE INDEX idx_payroll_records_status ON payroll.payroll_records(status);
CREATE INDEX idx_payroll_details_payroll ON payroll.payroll_details(payroll_uuid);
CREATE INDEX idx_attendance_tenant ON payroll.attendance(tenant_uuid);
CREATE INDEX idx_attendance_employee ON payroll.attendance(user_uuid, attendance_date);

-- ============================================
-- MODULE 12: REPORTS MANAGEMENT
-- ============================================

CREATE TABLE reports.report_templates (
    id BIGSERIAL PRIMARY KEY,
    template_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_bn VARCHAR(255), -- Bengali name
    report_type VARCHAR(100) NOT NULL, -- 'sales', 'inventory', 'financial', 'customer', 'purchase', 'product_performance', 'payroll'
    description TEXT,
    template_config JSONB NOT NULL, -- Report configuration (filters, columns, grouping, etc.)
    output_format VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'excel', 'csv', 'html'
    is_active BOOLEAN DEFAULT true,
    is_system_template BOOLEAN DEFAULT false,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, name)
);

CREATE TABLE reports.generated_reports (
    id BIGSERIAL PRIMARY KEY,
    report_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    report_number VARCHAR(50) NOT NULL,
    template_uuid UUID REFERENCES reports.report_templates(template_uuid) ON DELETE SET NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    period_start DATE,
    period_end DATE,
    period_name VARCHAR(255), -- 'January 2024', 'জানুয়ারি ২০২৪'
    parameters JSONB, -- Report parameters used for generation
    output_format VARCHAR(50) NOT NULL,
    file_url VARCHAR(500), -- URL to generated report file
    file_size BIGINT, -- File size in bytes
    status VARCHAR(50) DEFAULT 'generating', -- 'generating', 'completed', 'failed', 'cancelled'
    total_records INT DEFAULT 0,
    summary_data JSONB, -- Summary statistics
    error_message TEXT,
    generated_at TIMESTAMP,
    generated_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_uuid, report_number)
);

CREATE TABLE reports.report_schedules (
    id BIGSERIAL PRIMARY KEY,
    schedule_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    template_uuid UUID NOT NULL REFERENCES reports.report_templates(template_uuid) ON DELETE CASCADE,
    schedule_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
    day_of_week INT, -- 0-6 for weekly (0=Sunday)
    day_of_month INT, -- 1-31 for monthly
    time TIME DEFAULT '09:00:00',
    recipients TEXT[], -- Array of email addresses
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_by_uuid UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for reports module
CREATE INDEX idx_report_templates_tenant ON reports.report_templates(tenant_uuid);
CREATE INDEX idx_report_templates_type ON reports.report_templates(report_type);
CREATE INDEX idx_generated_reports_tenant ON reports.generated_reports(tenant_uuid);
CREATE INDEX idx_generated_reports_type ON reports.generated_reports(report_type);
CREATE INDEX idx_generated_reports_date ON reports.generated_reports(period_start, period_end);
CREATE INDEX idx_generated_reports_status ON reports.generated_reports(status);
CREATE INDEX idx_report_schedules_tenant ON reports.report_schedules(tenant_uuid);
CREATE INDEX idx_report_schedules_active ON reports.report_schedules(is_active, next_run_at);

-- ============================================
-- MODULE 13: NOTIFICATION MANAGEMENT
-- ============================================

CREATE TABLE notification.notifications (
    id BIGSERIAL PRIMARY KEY,
    notification_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    company_id UUID,
    user_uuid UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MODULE 10: REPORTING
-- ============================================

CREATE TABLE reporting.report_schedules (
    id BIGSERIAL PRIMARY KEY,
    schedule_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MODULE 11: INTEGRATION (Event-Driven Communication)
-- ============================================

-- Domain Events (for async communication between modules)
CREATE TABLE integration.domain_events (
    id BIGSERIAL PRIMARY KEY,
    event_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- ProductCreated, OrderCompleted, etc.
    aggregate_type VARCHAR(100) NOT NULL, -- Product, Order, etc.
    aggregate_uuid UUID NOT NULL,
    event_data JSONB NOT NULL,
    metadata JSONB,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP,
    created_by_module VARCHAR(50) NOT NULL, -- Source module
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_domain_events_pending ON integration.domain_events(processed, published_at) 
WHERE processed = false;

CREATE INDEX idx_domain_events_type ON integration.domain_events(event_type, tenant_uuid);

-- Event Subscriptions (which modules listen to which events)
CREATE TABLE integration.event_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    subscriber_module VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscriber_module, event_type)
);

-- Saga Orchestration (for distributed transactions across modules)
CREATE TABLE integration.sagas (
    id BIGSERIAL PRIMARY KEY,
    saga_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    saga_type VARCHAR(100) NOT NULL, -- OrderFulfillmentSaga, etc.
    status VARCHAR(50) NOT NULL, -- started, completed, compensating, failed
    current_step VARCHAR(100),
    saga_data JSONB NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE integration.saga_steps (
    id BIGSERIAL PRIMARY KEY,
    saga_uuid UUID NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INT NOT NULL,
    status VARCHAR(50) NOT NULL, -- pending, completed, failed, compensated
    module VARCHAR(50) NOT NULL,
    command_data JSONB,
    response_data JSONB,
    error_message TEXT,
    executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MODULE INTERFACE VIEWS (Public API of each module)
-- ============================================

-- Core Module API
CREATE VIEW core.api_tenants AS
SELECT tenant_uuid,
       company_id,
       email,
       subscription_plan,
       subscription_status,
       is_active
FROM core.tenants;

CREATE VIEW core.api_users AS
SELECT user_uuid, email, first_name, last_name, phone, avatar, is_staff, status, company_id
FROM core.user_cache;

-- Business Module API
CREATE VIEW business.api_businesses AS
SELECT business_uuid,
       tenant_uuid,
       business_type_uuid,
       business_name,
       business_name_en,
       code,
       is_active
FROM business.businesses;

-- Catalog Module API
CREATE VIEW catalog.api_products AS
SELECT product_uuid, tenant_uuid, business_uuid, name, sku, barcode, 
       selling_price, is_active
FROM catalog.products;

-- Inventory Module API
CREATE VIEW inventory.api_stock_levels AS
SELECT product_uuid, warehouse_uuid, available_quantity, tenant_uuid
FROM inventory.stock;

-- Sales Module API
CREATE VIEW sales.api_orders AS
SELECT order_uuid, tenant_uuid, business_uuid, order_number, 
       user_uuid, total_amount, status, order_date
FROM sales.orders;

-- Accounting Module API
CREATE VIEW finance.api_chart_of_accounts AS
SELECT account_uuid, tenant_uuid, account_code, account_name, account_type, is_active
FROM finance.chart_of_accounts;

CREATE VIEW finance.api_journal_entries AS
SELECT entry_uuid, tenant_uuid, entry_number, entry_date, description, status
FROM finance.journal_entries;

-- HR Module API
CREATE VIEW hr.api_employees AS
SELECT 
    e.user_uuid,
    e.tenant_uuid,
    e.employee_id,
    uc.first_name,
    uc.last_name,
    e.department_uuid,
    e.position_uuid,
    e.status
FROM hr.employees e
JOIN core.user_cache uc
  ON uc.user_uuid = e.user_uuid;

-- Payroll Module API
CREATE VIEW payroll.api_payroll_records AS
SELECT payroll_uuid, tenant_uuid, payroll_number, period_uuid, user_uuid, 
       net_salary, payment_status, status
FROM payroll.payroll_records;

-- Halkhata Module API (part of finance)
-- View to get customer balances from accounting system
-- Uses customer_account_mapping to link customers to their accounts receivable accounts
CREATE VIEW finance.api_halkhata_customer_balances AS
SELECT 
    c.user_uuid,
    tc.tenant_uuid,
    concat_ws(' ', uc.first_name, uc.last_name) AS customer_name,
    uc.phone AS customer_phone,
    c.customer_code,
    cam.account_receivable_uuid,
    coa.account_code AS account_code,
    coa.account_name AS account_name,
    COALESCE(SUM(gl.debit_amount - gl.credit_amount), 0) AS current_balance
FROM sales.customers c
JOIN sales.tenant_customers tc
    ON tc.user_uuid = c.user_uuid
JOIN core.user_cache uc
    ON uc.user_uuid = c.user_uuid
LEFT JOIN finance.customer_account_mapping cam
    ON cam.user_uuid = c.user_uuid
    AND cam.tenant_uuid = tc.tenant_uuid
    AND cam.is_active = true
LEFT JOIN finance.chart_of_accounts coa
    ON coa.account_uuid = cam.account_receivable_uuid
LEFT JOIN finance.general_ledger gl
    ON gl.account_uuid = cam.account_receivable_uuid
WHERE c.is_active = true
GROUP BY c.user_uuid, tc.tenant_uuid, uc.first_name, uc.last_name, uc.phone, c.customer_code, 
         cam.account_receivable_uuid, coa.account_code, coa.account_name;

-- Reports Module API
CREATE VIEW reports.api_generated_reports AS
SELECT report_uuid, tenant_uuid, report_number, report_name, report_type, 
       period_start, period_end, status, generated_at
FROM reports.generated_reports;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core module indexes
CREATE INDEX IF NOT EXISTS idx_tenants_uuid ON core.tenants(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_user_cache_uuid ON core.user_cache(user_uuid);
-- Business module indexes
CREATE INDEX IF NOT EXISTS idx_businesses_uuid ON business.businesses(business_uuid);
CREATE INDEX IF NOT EXISTS idx_businesses_tenant ON business.businesses(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_businesses_country_code ON business.businesses(country_code);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_1_id ON business.businesses(location_level_1_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_2_id ON business.businesses(location_level_2_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_3_id ON business.businesses(location_level_3_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_4_id ON business.businesses(location_level_4_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_5_id ON business.businesses(location_level_5_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_6_id ON business.businesses(location_level_6_id);
CREATE INDEX IF NOT EXISTS idx_businesses_location_level_7_id ON business.businesses(location_level_7_id);
-- idx_user_businesses_user is created earlier alongside business.user_businesses

-- Catalog module indexes
CREATE INDEX IF NOT EXISTS idx_products_uuid ON catalog.products(product_uuid);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON catalog.products(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_products_business ON catalog.products(business_uuid);
CREATE INDEX IF NOT EXISTS idx_products_marketplace_enabled ON catalog.products(tenant_uuid, is_marketplace_enabled);
CREATE INDEX IF NOT EXISTS idx_categories_business ON catalog.categories(business_uuid);
CREATE INDEX IF NOT EXISTS idx_brands_business ON catalog.brands(business_uuid);
CREATE INDEX IF NOT EXISTS idx_units_business ON catalog.units(business_uuid);
CREATE INDEX IF NOT EXISTS idx_unit_conversions_business ON catalog.unit_conversions(business_uuid);
CREATE INDEX IF NOT EXISTS idx_products_sku ON catalog.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON catalog.products(barcode);

-- Inventory module indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_uuid ON inventory.warehouses(warehouse_uuid);
CREATE INDEX IF NOT EXISTS idx_warehouses_business ON inventory.warehouses(business_uuid);
CREATE INDEX IF NOT EXISTS idx_stock_product ON inventory.stock(product_uuid, warehouse_uuid);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON inventory.stock_movements(product_uuid);

-- Sales module indexes
CREATE INDEX IF NOT EXISTS idx_orders_uuid ON sales.orders(order_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON sales.orders(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_business ON sales.orders(business_uuid);
CREATE INDEX IF NOT EXISTS idx_orders_date ON sales.orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_user ON sales.orders(user_uuid);
CREATE INDEX IF NOT EXISTS idx_customers_user_uuid ON sales.customers(user_uuid);

-- Purchasing module indexes
CREATE INDEX IF NOT EXISTS idx_po_uuid ON purchasing.purchase_orders(po_uuid);
CREATE INDEX IF NOT EXISTS idx_po_tenant ON purchasing.purchase_orders(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_suppliers_uuid ON purchasing.suppliers(supplier_uuid);

-- Finance module indexes
CREATE INDEX IF NOT EXISTS idx_payments_uuid ON finance.payments(payment_uuid);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON finance.payments(tenant_uuid);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON finance.payments(reference_type, reference_uuid);

-- Warranty module indexes
CREATE INDEX IF NOT EXISTS idx_warranties_uuid ON warranty.warranties(warranty_uuid);
CREATE INDEX IF NOT EXISTS idx_warranties_expiry ON warranty.warranties(expiry_date, status);

-- Accounting module indexes (already added above in module definition)
-- Halkhata module indexes (already added above in module definition, part of finance)
-- HR module indexes (already added above in module definition)
-- Payroll module indexes (already added above in module definition)
-- Reports module indexes (already added above in module definition)

-- Notification module indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notification.notifications(user_uuid, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON notification.notifications(company_id);

-- ============================================
-- FUNCTIONS FOR CROSS-MODULE COMMUNICATION
-- ============================================

-- Function to publish domain events
CREATE OR REPLACE FUNCTION integration.publish_event(
    p_tenant_uuid UUID,
    p_event_type VARCHAR,
    p_aggregate_type VARCHAR,
    p_aggregate_uuid UUID,
    p_event_data JSONB,
    p_module VARCHAR,
    p_user_uuid UUID DEFAULT NULL -- Optional: external user UUID from auth server
) RETURNS UUID AS $$
DECLARE
    v_event_uuid UUID;
BEGIN
    INSERT INTO integration.domain_events (
        tenant_uuid, event_type, aggregate_type, aggregate_uuid,
        event_data, created_by_module, metadata
    ) VALUES (
        p_tenant_uuid, p_event_type, p_aggregate_type, p_aggregate_uuid,
        p_event_data, p_module,
        CASE WHEN p_user_uuid IS NOT NULL THEN jsonb_build_object('user_uuid', p_user_uuid) ELSE NULL END
    ) RETURNING event_uuid INTO v_event_uuid;
    
    RETURN v_event_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to process events
CREATE OR REPLACE FUNCTION integration.mark_event_processed(
    p_event_uuid UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE integration.domain_events
    SET processed = true, processed_at = CURRENT_TIMESTAMP
    WHERE event_uuid = p_event_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SUBSCRIPTION PLAN HELPER FUNCTIONS
-- ============================================

-- Function to get max products allowed for a subscription plan
CREATE OR REPLACE FUNCTION core.get_max_products_for_plan(
    p_plan core.subscription_plan
) RETURNS INT AS $$
BEGIN
    CASE p_plan
        WHEN 'small_business' THEN RETURN 200;
        WHEN 'medium_business' THEN RETURN 500;
        WHEN 'big_business' THEN RETURN NULL; -- NULL means unlimited
        -- marketplace tenants have no product cap enforced here
        WHEN 'marketplace' THEN RETURN NULL;
        ELSE RETURN NULL;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if tenant can add more products
CREATE OR REPLACE FUNCTION core.can_add_product(
    p_tenant_uuid UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_plan core.subscription_plan;
    v_max_products INT;
    v_current_count INT;
BEGIN
    -- Get tenant's subscription plan
    SELECT subscription_plan, max_products INTO v_plan, v_max_products
    FROM core.tenants
    WHERE tenant_uuid = p_tenant_uuid;
    
    -- If max_products is NULL, it means unlimited (big_business plan)
    IF v_max_products IS NULL THEN
        RETURN true;
    END IF;
    
    -- Get current product count
    SELECT COUNT(*) INTO v_current_count
    FROM catalog.products
    WHERE tenant_uuid = p_tenant_uuid;
    
    -- Check if current count is less than max
    RETURN v_current_count < v_max_products;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically set max_products when subscription_plan changes
CREATE OR REPLACE FUNCTION core.set_max_products_from_plan()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if subscription_plan changed or max_products is not set
    IF NEW.subscription_plan != OLD.subscription_plan OR NEW.max_products IS NULL THEN
        NEW.max_products := core.get_max_products_for_plan(NEW.subscription_plan);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_max_products
BEFORE INSERT OR UPDATE OF subscription_plan ON core.tenants
FOR EACH ROW EXECUTE FUNCTION core.set_max_products_from_plan();

-- ============================================
-- TRIGGERS FOR AUTOMATED EVENT PUBLISHING
-- ============================================

-- Trigger function to publish ProductCreated event
CREATE OR REPLACE FUNCTION catalog.publish_product_created()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM integration.publish_event(
        NEW.tenant_uuid,
        'ProductCreated',
        'Product',
        NEW.product_uuid,
        jsonb_build_object(
            'product_uuid', NEW.product_uuid,
            'name', NEW.name,
            'sku', NEW.sku,
            'business_uuid', NEW.business_uuid,
            'selling_price', NEW.selling_price
        ),
        'catalog',
        NEW.created_by_uuid -- External user UUID from auth server
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_created
AFTER INSERT ON catalog.products
FOR EACH ROW EXECUTE FUNCTION catalog.publish_product_created();

-- Trigger function to publish OrderCompleted event
CREATE OR REPLACE FUNCTION sales.publish_order_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM integration.publish_event(
            NEW.tenant_uuid,
            'OrderCompleted',
            'Order',
            NEW.order_uuid,
            jsonb_build_object(
                'order_uuid', NEW.order_uuid,
                'order_number', NEW.order_number,
                'total_amount', NEW.total_amount,
                'business_uuid', NEW.business_uuid
            ),
            'sales',
            NEW.created_by_uuid -- External user UUID from auth server
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_completed
AFTER UPDATE ON sales.orders
FOR EACH ROW EXECUTE FUNCTION sales.publish_order_completed();

-- Location hierarchy (countries/divisions/districts/upazilas/unions) is not stored here;
-- use the auth/location API. No local verification queries for removed core.* geo tables.

-- Business types - Comprehensive list for Bangladesh market (Multilingual: English & Bengali)
INSERT INTO business.business_types (id, name, name_bn, description, description_bn, icon, is_active) VALUES
-- Food & Grocery
(1, 'Grocery Store', 'মুদি দোকান', 'Food, beverages, and household items', 'খাদ্য, পানীয় এবং গৃহস্থালির জিনিসপত্র', 'grocery', true),
(2, 'Supermarket', 'সুপারমার্কেট', 'Large grocery store with wide variety of products', 'বিভিন্ন ধরনের পণ্যের বিশাল দোকান', 'supermarket', true),
(3, 'Vegetable Shop', 'শাকসবজির দোকান', 'Fresh vegetables and produce', 'তাজা শাকসবজি', 'vegetable', true),
(4, 'Fruit Shop', 'ফলের দোকান', 'Fresh fruits and fruit products', 'তাজা ফল', 'fruit', true),
(5, 'Meat Shop', 'মাংসের দোকান', 'Fresh meat and poultry', 'তাজা মাংস ও হাঁস-মুরগি', 'meat', true),
(6, 'Fish Market', 'মাছের বাজার', 'Fresh fish and seafood', 'তাজা মাছ ও সামুদ্রিক খাবার', 'fish', true),
(7, 'Rice Shop', 'চালের দোকান', 'Rice, pulses, and grains', 'চাল, ডাল ও শস্য', 'rice', true),
(8, 'Spice Shop', 'মসলার দোকান', 'Spices, masala, and condiments', 'মসলা ও মশলা', 'spice', true),
(9, 'Oil Shop', 'তেলের দোকান', 'Cooking oil and edible oils', 'রান্নার তেল', 'oil', true),
(10, 'Bakery', 'বেকারি', 'Bread, cakes, pastries, and baked goods', 'রুটি, কেক, পেস্ট্রি ও বেকারি পণ্য', 'bakery', true),
(11, 'Sweet Shop', 'মিষ্টির দোকান', 'Traditional sweets, confectionery', 'ঐতিহ্যবাহী মিষ্টি', 'sweet', true),
(12, 'Tea Shop', 'চায়ের দোকান', 'Tea, coffee, and beverages', 'চা, কফি ও পানীয়', 'tea', true),
(13, 'Restaurant', 'রেস্তোরাঁ', 'Food and beverage service', 'খাবার ও পানীয় সেবা', 'restaurant', true),
(14, 'Fast Food', 'ফাস্ট ফুড', 'Quick service restaurant', 'দ্রুত সেবা রেস্তোরাঁ', 'fast-food', true),
(15, 'Cafe', 'ক্যাফে', 'Coffee shop and light meals', 'কফি শপ ও হালকা খাবার', 'cafe', true),

-- Electronics & Technology
(16, 'Electronics Store', 'ইলেকট্রনিক্স দোকান', 'Electronic devices, gadgets, and accessories', 'ইলেকট্রনিক ডিভাইস, গ্যাজেট ও আনুষাঙ্গিক', 'electronics', true),
(17, 'Mobile Shop', 'মোবাইল দোকান', 'Mobile phones and accessories', 'মোবাইল ফোন ও আনুষাঙ্গিক', 'mobile', true),
(18, 'Computer Shop', 'কম্পিউটার দোকান', 'Computers, laptops, and IT equipment', 'কম্পিউটার, ল্যাপটপ ও আইটি সরঞ্জাম', 'computer', true),
(19, 'Home Appliances', 'গৃহ সরঞ্জাম', 'Home appliances and white goods', 'গৃহ সরঞ্জাম ও সাদা পণ্য', 'appliances', true),
(20, 'Electrical Store', 'ইলেকট্রিক্যাল দোকান', 'Electrical items, wires, switches', 'ইলেকট্রিক্যাল সামগ্রী, তার, সুইচ', 'electrical', true),

-- Fashion & Apparel
(21, 'Clothing Store', 'পোশাকের দোকান', 'Apparel, fashion accessories', 'পোশাক ও ফ্যাশন আনুষাঙ্গিক', 'clothing', true),
(22, 'Footwear Store', 'জুতার দোকান', 'Shoes, sandals, and footwear', 'জুতা, স্যান্ডেল ও পাদুকা', 'footwear', true),
(23, 'Jewellery Shop', 'গহনার দোকান', 'Gold, silver, and precious jewelry', 'সোনা, রূপা ও মূল্যবান গহনা', 'jewellery', true),
(24, 'Textile Store', 'টেক্সটাইল দোকান', 'Fabrics, cloth, and textiles', 'কাপড়, বস্ত্র ও টেক্সটাইল', 'textile', true),
(25, 'Tailoring Shop', 'দর্জির দোকান', 'Custom clothing and alterations', 'কাস্টম পোশাক ও পরিবর্তন', 'tailoring', true),
(26, 'Bag & Luggage', 'ব্যাগ ও ল্যাগেজ', 'Bags, luggage, and travel accessories', 'ব্যাগ, ল্যাগেজ ও ভ্রমণ আনুষাঙ্গিক', 'bag', true),
(27, 'Watch Shop', 'ঘড়ির দোকান', 'Watches and timepieces', 'ঘড়ি ও সময় পরিমাপক', 'watch', true),

-- Health & Beauty
(28, 'Pharmacy', 'ফার্মেসি', 'Medicines, healthcare products', 'ঔষধ ও স্বাস্থ্যসেবা পণ্য', 'pharmacy', true),
(29, 'Cosmetics Store', 'কসমেটিক্স দোকান', 'Beauty products, cosmetics', 'সৌন্দর্য পণ্য ও কসমেটিক্স', 'cosmetics', true),
(30, 'Medical Equipment', 'চিকিৎসা সরঞ্জাম', 'Medical devices and equipment', 'চিকিৎসা ডিভাইস ও সরঞ্জাম', 'medical', true),
(31, 'Optical Shop', 'চশমার দোকান', 'Eyeglasses, lenses, and frames', 'চশমা, লেন্স ও ফ্রেম', 'optical', true),
(32, 'Herbal Store', 'ভেষজ দোকান', 'Herbal medicines and natural products', 'ভেষজ ঔষধ ও প্রাকৃতিক পণ্য', 'herbal', true),

-- Home & Furniture
(33, 'Furniture Store', 'ফার্নিচার দোকান', 'Furniture and home furnishings', 'ফার্নিচার ও গৃহসজ্জা', 'furniture', true),
(34, 'Hardware Store', 'হার্ডওয়্যার দোকান', 'Tools, building materials, hardware', 'যন্ত্রপাতি, নির্মাণ সামগ্রী, হার্ডওয়্যার', 'hardware', true),
(35, 'Paint Store', 'রঙের দোকান', 'Paints, varnishes, and coatings', 'রঙ, বার্নিশ ও আবরণ', 'paint', true),
(36, 'Building Materials', 'নির্মাণ সামগ্রী', 'Cement, bricks, construction materials', 'সিমেন্ট, ইট, নির্মাণ সামগ্রী', 'construction', true),
(37, 'Kitchenware Store', 'রান্নাঘরের সরঞ্জাম', 'Kitchen utensils and cookware', 'রান্নাঘরের সরঞ্জাম ও রান্নার পাত্র', 'kitchenware', true),
(38, 'Home Decor', 'গৃহসজ্জা', 'Home decoration items and accessories', 'গৃহসজ্জার সামগ্রী ও আনুষাঙ্গিক', 'decor', true),
(39, 'Curtain & Upholstery', 'পর্দা ও আসবাব', 'Curtains, fabrics, and upholstery', 'পর্দা, কাপড় ও আসবাব', 'curtain', true),

-- Books & Stationery
(40, 'Bookstore', 'বইয়ের দোকান', 'Books, stationery, office supplies', 'বই, স্টেশনারি, অফিস সরঞ্জাম', 'bookstore', true),
(41, 'Stationery Shop', 'স্টেশনারি দোকান', 'Office supplies and stationery', 'অফিস সরঞ্জাম ও স্টেশনারি', 'stationery', true),
(42, 'Art Supply Store', 'শিল্প সামগ্রীর দোকান', 'Art materials and craft supplies', 'শিল্প সামগ্রী ও কারুশিল্প সরঞ্জাম', 'art', true),

-- Sports & Toys
(43, 'Sports Goods Store', 'ক্রীড়া সামগ্রীর দোকান', 'Sports equipment and accessories', 'ক্রীড়া সরঞ্জাম ও আনুষাঙ্গিক', 'sports', true),
(44, 'Toys Store', 'খেলনার দোকান', 'Toys, games, and children products', 'খেলনা, গেম ও শিশু পণ্য', 'toys', true),
(45, 'Bicycle Shop', 'সাইকেল দোকান', 'Bicycles and cycling accessories', 'সাইকেল ও সাইকেলিং আনুষাঙ্গিক', 'bicycle', true),

-- Baby & Kids
(46, 'Baby Products Store', 'শিশু পণ্যের দোকান', 'Baby care products and accessories', 'শিশু যত্ন পণ্য ও আনুষাঙ্গিক', 'baby', true),
(47, 'Kids Clothing', 'শিশু পোশাক', 'Children apparel and accessories', 'শিশু পোশাক ও আনুষাঙ্গিক', 'kids', true),

-- Automotive
(48, 'Auto Parts Store', 'গাড়ির যন্ত্রাংশ', 'Automobile parts and accessories', 'গাড়ির যন্ত্রাংশ ও আনুষাঙ্গিক', 'auto-parts', true),
(49, 'Motorcycle Shop', 'মোটরসাইকেল দোকান', 'Motorcycles and bike accessories', 'মোটরসাইকেল ও বাইক আনুষাঙ্গিক', 'motorcycle', true),
(50, 'Battery Shop', 'ব্যাটারি দোকান', 'Batteries and power solutions', 'ব্যাটারি ও পাওয়ার সমাধান', 'battery', true),

-- Specialized Retail
(51, 'Gift Shop', 'উপহারের দোকান', 'Gifts, souvenirs, and novelty items', 'উপহার, স্যুভেনির ও নবত্ব আইটেম', 'gift', true),
(52, 'Flower Shop', 'ফুলের দোকান', 'Flowers, bouquets, and floral arrangements', 'ফুল, ফুলের তোড়া ও ফুল সাজানো', 'flower', true),
(53, 'Pet Shop', 'পোষা প্রাণীর দোকান', 'Pet supplies and accessories', 'পোষা প্রাণীর সরঞ্জাম ও আনুষাঙ্গিক', 'pet', true),
(54, 'Photography Shop', 'ফটোগ্রাফি দোকান', 'Cameras, photography equipment', 'ক্যামেরা ও ফটোগ্রাফি সরঞ্জাম', 'photography', true),
(55, 'Musical Instruments', 'বাদ্যযন্ত্র', 'Musical instruments and accessories', 'বাদ্যযন্ত্র ও আনুষাঙ্গিক', 'music', true),

-- Services
(56, 'Printing Shop', 'প্রিন্টিং দোকান', 'Printing, photocopy, and document services', 'প্রিন্টিং, ফটোকপি ও নথি সেবা', 'printing', true),
(57, 'Repair Shop', 'মেরামত দোকান', 'Electronics and appliance repair', 'ইলেকট্রনিক্স ও সরঞ্জাম মেরামত', 'repair', true),
(58, 'Laundry Service', 'লন্ড্রি সেবা', 'Laundry and dry cleaning', 'লন্ড্রি ও ড্রাই ক্লিনিং', 'laundry', true),

-- Agricultural
(59, 'Agricultural Supplies', 'কৃষি সরঞ্জাম', 'Farming tools, seeds, and agricultural products', 'কৃষি যন্ত্রপাতি, বীজ ও কৃষি পণ্য', 'agriculture', true),
(60, 'Fertilizer Shop', 'সার দোকান', 'Fertilizers and agricultural chemicals', 'সার ও কৃষি রাসায়নিক', 'fertilizer', true),

-- General & Others
(61, 'General Store', 'সাধারণ দোকান', 'Mixed general merchandise', 'মিশ্র সাধারণ পণ্য', 'general', true),
(62, 'Department Store', 'ডিপার্টমেন্ট স্টোর', 'Large retail store with multiple departments', 'বিভিন্ন বিভাগ সহ বড় খুচরা দোকান', 'department', true),
(63, 'Wholesale Store', 'পাইকারি দোকান', 'Bulk and wholesale products', 'পাইকারি ও বাল্ক পণ্য', 'wholesale', true),
(64, 'Convenience Store', 'কনভেনিয়েন্স স্টোর', 'Small convenience store', 'ছোট সুবিধাজনক দোকান', 'convenience', true);

-- Note: Permissions are managed by external auth server
-- This system validates permissions from JWT token claims
-- No local permissions table needed

-- Event subscriptions (which modules listen to which events)
INSERT INTO integration.event_subscriptions (subscriber_module, event_type, is_active) VALUES
('inventory', 'OrderCompleted', true),       -- Inventory module listens to order completion
('inventory', 'OrderCancelled', true),       -- To restore stock
('finance', 'OrderCompleted', true),         -- Finance module tracks payments
('finance', 'PurchaseOrderCreated', true),   -- Track payables
('notification', 'LowStockDetected', true),  -- Send notifications
('notification', 'OrderCompleted', true),    -- Customer notifications
('warranty', 'OrderCompleted', true),        -- Create warranties for products
('reporting', 'OrderCompleted', true),       -- Update analytics
('reporting', 'ProductCreated', true);       -- Track product metrics

-- ============================================
-- DOCUMENTATION
-- ============================================

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON SCHEMA core IS 'Core module: Tenant management (Auth handled by external auth server)';
COMMENT ON TABLE core.tenants IS 'Tenant/Company information with subscription management. Subscription plans: trial, small_business, medium_business, big_business, marketplace. Location is resolved via external Auth/Location service using country_code and hierarchical location_level_*_id fields.';
COMMENT ON COLUMN core.tenants.max_products IS 'Maximum products allowed. NULL means unlimited (big_business plan). Automatically set by trigger based on subscription_plan';
COMMENT ON COLUMN core.tenants.subscription_plan IS 'Subscription plan type: trial, small_business, medium_business, big_business, or marketplace';
COMMENT ON SCHEMA business IS 'Business module: Business types, businesses, locations';
COMMENT ON SCHEMA catalog IS 'Catalog module: Products, categories, brands, units';
COMMENT ON TABLE catalog.products IS 'Products table with flexible attributes system. Uses JSONB attributes field for business-type-specific data. Common fields (expiry_date, batch_number, serial_number, model_number, dimensions, weight) support multiple business types. See attributes field documentation for examples.';
COMMENT ON COLUMN catalog.products.attributes IS 'JSONB field for flexible business-type-specific attributes. Examples: Jewellery: {"carat": "22K", "metal_type": "gold", "purity": 91.6}, Electronics: {"ram": "8GB", "storage": "256GB", "screen_size": "6.1 inch"}, Pharmacy: {"generic_name": "Paracetamol", "strength": "500mg", "prescription_required": true}, Books: {"isbn": "978-0-123456-78-9", "author": "John Doe", "publisher": "ABC Books"}';
COMMENT ON COLUMN catalog.products.expiry_date IS 'Expiry date for perishable items (Pharmacy, Grocery, Cosmetics)';
COMMENT ON COLUMN catalog.products.batch_number IS 'Batch/lot number for traceability (Pharmacy, Grocery, Cosmetics)';
COMMENT ON COLUMN catalog.products.serial_number IS 'Serial number for electronics, mobile phones, and high-value items';
COMMENT ON COLUMN catalog.products.model_number IS 'Model number for electronics, mobile phones, and hardware';
COMMENT ON TABLE catalog.product_variants IS 'Product variants with their own attributes. Supports size/color combinations, storage/RAM options, carat/weight variations, etc.';
COMMENT ON COLUMN catalog.product_variants.variant_attributes IS 'JSONB field for variant-specific attributes (e.g., {"size": "L", "color": "red"} for clothing, {"storage": "256GB", "color": "black"} for electronics)';
COMMENT ON TABLE catalog.product_variation_templates IS 'Defines available variation types for each business type. Example: Jewellery shop has "Carat", "Metal Type", "Weight". Clothing shop has "Size", "Color", "Material". Used to guide UI and validate product creation.';
COMMENT ON SCHEMA inventory IS 'Inventory module: Stock, warehouses, movements';
COMMENT ON SCHEMA sales IS 'Sales module: Orders, POS, customers';
COMMENT ON SCHEMA purchasing IS 'Purchasing module: Purchase orders, suppliers';
COMMENT ON SCHEMA warranty IS 'Warranty module: Warranty tracking and claims';
COMMENT ON SCHEMA finance IS 'Finance module: Payments, expenses, accounting, chart of accounts, journal entries, general ledger, and Halkhata (traditional Bangladeshi customer debt collection festival/ledger system)';
COMMENT ON SCHEMA hr IS 'HR module: Employee management, departments, positions';
COMMENT ON SCHEMA payroll IS 'Payroll module: Payroll processing, salary management, attendance';
COMMENT ON SCHEMA reports IS 'Reports module: Report generation, templates, and scheduling';
COMMENT ON SCHEMA notification IS 'Notification module: Alerts and notifications';
COMMENT ON SCHEMA reporting IS 'Reporting module: Analytics and reports (legacy, use reports schema)';
COMMENT ON SCHEMA integration IS 'Integration module: Event-driven communication';

COMMENT ON TABLE hr.employees IS 'Employee master data. Links to external auth server users via user_uuid. Supports Bengali names and Bangladeshi address structure.';
COMMENT ON TABLE hr.departments IS 'Organizational departments (e.g., Sales, Purchase, Accounting). Supports Bengali names.';
COMMENT ON TABLE hr.positions IS 'Job positions/titles within departments. Supports salary ranges and Bengali titles.';
COMMENT ON TABLE hr.employee_salary IS 'Employee salary structure with flexible allowances and deductions stored as JSONB.';
COMMENT ON TABLE payroll.payroll_records IS 'Monthly payroll records for employees. Includes gross/net salary calculations.';
COMMENT ON TABLE payroll.payroll_periods IS 'Payroll periods (typically monthly). Tracks processing status and totals.';
COMMENT ON TABLE payroll.attendance IS 'Daily attendance records with check-in/check-out times and leave tracking.';
COMMENT ON TABLE finance.chart_of_accounts IS 'Chart of accounts with hierarchical structure. Supports Bengali account names. Account types: asset, liability, equity, revenue, expense.';
COMMENT ON TABLE finance.journal_entries IS 'Journal entries for double-entry bookkeeping. Must balance (total_debit = total_credit).';
COMMENT ON TABLE finance.journal_entry_lines IS 'Individual lines within journal entries. Each entry must have at least 2 lines (debit and credit).';
COMMENT ON TABLE finance.general_ledger IS 'General ledger entries derived from journal entries. Maintains running balances per account.';
COMMENT ON TABLE finance.halkhata_events IS 'Halkhata festival/event dates. Halkhata is a traditional Bangladeshi business practice where businesses invite customers with outstanding debts to pay on a specific date and receive treats. Tracks event details, venue, treats budget, and collection statistics.';
COMMENT ON TABLE finance.halkhata_invitations IS 'Invitations sent to customers for Halkhata events. Links to sales.customers for customer info and finance.chart_of_accounts for account receivable account. Outstanding balance is calculated from finance.general_ledger, not stored. When payment is made during event, a journal entry is created and referenced here.';
COMMENT ON TABLE finance.customer_account_mapping IS 'Maps customers to their accounts receivable accounts in chart of accounts. Used by Halkhata to calculate customer balances from accounting system.';
COMMENT ON VIEW finance.api_halkhata_customer_balances IS 'View to calculate customer outstanding balances from accounting system. Uses finance.customer_account_mapping to link customers to their AR accounts, then sums debit_amount - credit_amount from finance.general_ledger. Balance is calculated, not stored.';
COMMENT ON TABLE finance.halkhata_settings IS 'Halkhata system settings including default invitation messages, notification preferences, and treat budget defaults.';
COMMENT ON TABLE reports.report_templates IS 'Report templates with configurable parameters. Supports multiple report types and output formats.';
COMMENT ON TABLE reports.generated_reports IS 'Generated report instances with file storage and status tracking.';
COMMENT ON TABLE reports.report_schedules IS 'Scheduled report generation with email delivery to recipients.';

COMMENT ON TABLE integration.domain_events IS 'Event store for async module communication';
COMMENT ON TABLE integration.sagas IS 'Saga orchestration for distributed transactions';

-- MIGRATION SECTION (disabled): For this project we always build
-- a fresh schema using the definitions above. Legacy migration
-- helpers (STEP 1–4) have been removed to avoid duplicate object
-- creation and NOTICE spam. Helper views and later maintenance
-- scripts remain below.

-- ============================================
-- STEP 5: Recreate Helper Views (Drop and Recreate for Safety)
-- ============================================

-- Helper views related to the old local administrative hierarchy
-- (core.countries/divisions/districts/upazilas) have been removed,
-- since location is now resolved from the external Auth/Location API.
-- Legacy comments for removed helper views (kept here for historical context only)
-- COMMENT ON VIEW core.vw_administrative_hierarchy IS 'View showing full administrative hierarchy path: Country > Division > District > Upazila';
-- COMMENT ON VIEW core.vw_tenants_with_location IS 'View showing tenants with their complete administrative location information';

-- ============================================
-- STEP 6: Add business_type_uuid to catalog.units (For Existing Databases)
-- ============================================
-- Migration: Add business_type_uuid column to catalog.units table
-- This migration adds the missing business_type_uuid column for databases
-- that were created before this column was added to the schema

DO $$
DECLARE
    default_business_type_uuid UUID;
BEGIN
    -- Check if the column doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'catalog' 
        AND table_name = 'units' 
        AND column_name = 'business_type_uuid'
    ) THEN
        -- Try to get the first active business type UUID as default
        SELECT business_type_uuid INTO default_business_type_uuid
        FROM business.business_types
        WHERE is_active = true
        LIMIT 1;
        
        -- If no business type found, use a placeholder UUID
        IF default_business_type_uuid IS NULL THEN
            default_business_type_uuid := '00000000-0000-0000-0000-000000000000';
            RAISE WARNING 'No active business type found. Using placeholder UUID. Please update existing units manually.';
        END IF;
        
        -- Add the column as nullable first (to allow existing rows)
        ALTER TABLE catalog.units 
        ADD COLUMN business_type_uuid UUID;
        
        -- Update existing rows with the default business type
        UPDATE catalog.units 
        SET business_type_uuid = default_business_type_uuid
        WHERE business_type_uuid IS NULL;
        
        -- Now make it NOT NULL
        ALTER TABLE catalog.units 
        ALTER COLUMN business_type_uuid SET NOT NULL;
        
        -- Add comment
        COMMENT ON COLUMN catalog.units.business_type_uuid IS 'Reference to business type';
        
        RAISE NOTICE 'Column business_type_uuid added to catalog.units with default value: %', default_business_type_uuid;
    ELSE
        RAISE NOTICE 'Column business_type_uuid already exists in catalog.units';
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'units_tenant_business_type_name_key'
    ) THEN
        ALTER TABLE catalog.units 
        ADD CONSTRAINT units_tenant_business_type_name_key 
        UNIQUE(tenant_uuid, business_type_uuid, name);
        
        RAISE NOTICE 'Unique constraint added on (tenant_uuid, business_type_uuid, name)';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- ============================================
-- STEP 7: Convert short_name to JSONB for multilingual support (For Existing Databases)
-- ============================================
-- Migration: Convert short_name from VARCHAR to JSONB to support English and Bengali
-- This migration converts existing short_name values to JSON format: {"en": "...", "bn": "..."}

DO $$
DECLARE
    col_type TEXT;
BEGIN
    -- Check current column type
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_schema = 'catalog'
      AND table_name = 'units'
      AND column_name = 'short_name';
    
    -- Only migrate if column is VARCHAR/TEXT (not already JSONB)
    IF col_type IN ('character varying', 'varchar', 'text', 'character') THEN
        -- Add temporary column
        ALTER TABLE catalog.units 
        ADD COLUMN IF NOT EXISTS short_name_jsonb JSONB;
        
        -- Migrate existing data: convert VARCHAR to JSONB format
        -- If short_name is already JSONB-like, try to parse it, otherwise wrap it in {"en": "value"}
        UPDATE catalog.units
        SET short_name_jsonb = CASE
            WHEN short_name::text ~ '^\{.*\}$' THEN
                -- Already looks like JSON, try to parse it
                short_name::text::jsonb
            ELSE
                -- Convert plain text to JSON format with English value
                jsonb_build_object('en', short_name::text, 'bn', '')
        END
        WHERE short_name_jsonb IS NULL;
        
        -- Make it NOT NULL with default
        ALTER TABLE catalog.units 
        ALTER COLUMN short_name_jsonb SET NOT NULL,
        ALTER COLUMN short_name_jsonb SET DEFAULT '{"en": "", "bn": ""}'::jsonb;
        
        -- Drop old column
        ALTER TABLE catalog.units 
        DROP COLUMN short_name;
        
        -- Rename new column
        ALTER TABLE catalog.units 
        RENAME COLUMN short_name_jsonb TO short_name;
        
        -- Add comment
        COMMENT ON COLUMN catalog.units.short_name IS 'Multilingual short name in JSON format: {"en": "kg", "bn": "কেজি"}';
        
        RAISE NOTICE 'Column short_name converted from VARCHAR to JSONB for multilingual support';
    ELSIF col_type = 'jsonb' THEN
        RAISE NOTICE 'Column short_name is already JSONB, no migration needed';
    ELSE
        RAISE NOTICE 'Column short_name type is %, migration may be needed manually', col_type;
    END IF;
END $$;

-- ============================================
-- STEP 8: Rename store_uuid to business_uuid in catalog.products (For Existing Databases)
-- ============================================
-- Migration: Rename store_uuid to business_uuid in catalog.products table
-- This migration ensures consistency with the schema which uses business_uuid

DO $$
BEGIN
    -- Check if store_uuid column exists and rename it to business_uuid
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'catalog' 
        AND table_name = 'products' 
        AND column_name = 'store_uuid'
    ) THEN
        -- Rename the column
        ALTER TABLE catalog.products 
        RENAME COLUMN store_uuid TO business_uuid;
        
        RAISE NOTICE 'Renamed store_uuid to business_uuid in catalog.products';
    ELSE
        -- If store_uuid doesn't exist, check if business_uuid already exists
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'catalog' 
            AND table_name = 'products' 
            AND column_name = 'business_uuid'
        ) THEN
            -- Add business_uuid column if neither exists
            ALTER TABLE catalog.products 
            ADD COLUMN business_uuid UUID NOT NULL DEFAULT gen_random_uuid();
            
            RAISE NOTICE 'Added business_uuid column to catalog.products';
        ELSE
            RAISE NOTICE 'business_uuid column already exists in catalog.products';
        END IF;
    END IF;
END $$;

-- Update the index if it exists with the old name
DO $$
BEGIN
    -- Drop old index if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'catalog' 
        AND tablename = 'products' 
        AND indexname = 'idx_products_store'
    ) THEN
        DROP INDEX IF EXISTS catalog.idx_products_store;
    END IF;
    
    -- Create index on business_uuid if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE schemaname = 'catalog' 
        AND tablename = 'products' 
        AND indexname = 'idx_products_business'
    ) THEN
        CREATE INDEX idx_products_business ON catalog.products(business_uuid);
        RAISE NOTICE 'Created index idx_products_business';
    END IF;
END $$;

-- Ensure business_uuid is NOT NULL (remove default if it was added temporarily)
DO $$
BEGIN
    -- Ensure business_uuid is NOT NULL
    ALTER TABLE catalog.products 
    ALTER COLUMN business_uuid SET NOT NULL;
    
    -- Remove default if it was added temporarily
    ALTER TABLE catalog.products 
    ALTER COLUMN business_uuid DROP DEFAULT;
    
    RAISE NOTICE 'Updated business_uuid constraints';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update constraints: %', SQLERRM;
END $$;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps for existing databases:
-- 1. Update existing tenant records to link to upazilas
-- 2. Optionally remove old columns (city, district, country) after data migration
-- 3. Load complete administrative data (all 64 districts, ~500 upazilas)
-- 4. Update existing units to use correct business_type_uuid if default was used
-- 5. Verify that all products have valid business_uuid values


-- ============================================
-- MAINTENANCE SCRIPT: FIX DUPLICATE ENTRIES IN core.user_cache
-- ============================================
-- This script will:
-- 1. Find duplicate user_uuid entries
-- 2. Keep the most recent entry (by last_synced_at or created_at)
-- 3. Delete older duplicates
-- 4. Verify the unique constraint exists
--
-- NOTE:
-- - Run this script manually when needed (e.g. after discovering duplicates)
-- - It is safe to keep this here for documentation and operational use
-- - The core.user_cache table is defined near the top of this schema file
--
-- Step 1: Check for duplicates
-- (Run manually when you want to inspect duplicate user_cache rows)
-- SELECT 
--     user_uuid,
--     COUNT(*) as duplicate_count,
--     STRING_AGG(id::text, ', ' ORDER BY last_synced_at DESC, created_at DESC) as ids,
--     STRING_AGG(email, ', ') as emails
-- FROM core.user_cache
-- GROUP BY user_uuid
-- HAVING COUNT(*) > 1
-- ORDER BY duplicate_count DESC;
--
-- Step 2: Delete duplicates, keeping only the most recent entry per user_uuid
-- This uses a CTE to identify which rows to keep and which to delete
-- WITH ranked_users AS (
--     SELECT 
--         id,
--         user_uuid,
--         ROW_NUMBER() OVER (
--             PARTITION BY user_uuid 
--             ORDER BY last_synced_at DESC, created_at DESC, id DESC
--         ) as row_num
--     FROM core.user_cache
-- )
-- DELETE FROM core.user_cache
-- WHERE id IN (
--     SELECT id 
--     FROM ranked_users 
--     WHERE row_num > 1
-- );
--
-- Step 3: Verify unique constraint exists on user_uuid
-- SELECT 
--     conname as constraint_name,
--     contype as constraint_type,
--     pg_get_constraintdef(oid) as constraint_definition
-- FROM pg_constraint
-- WHERE conrelid = 'core.user_cache'::regclass
--     AND contype = 'u'
--     AND conkey::text LIKE '%user_uuid%';
--
-- Step 4: If unique constraint doesn't exist, create it
-- (Uncomment and run if needed)
-- ALTER TABLE core.user_cache 
-- ADD CONSTRAINT user_cache_user_uuid_unique UNIQUE (user_uuid);
--
-- Step 5: Verify no duplicates remain
-- SELECT 
--     user_uuid,
--     COUNT(*) as count
-- FROM core.user_cache
-- GROUP BY user_uuid
-- HAVING COUNT(*) > 1;
--
-- If the above query returns no rows, all duplicates have been removed