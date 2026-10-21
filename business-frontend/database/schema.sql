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
CREATE TYPE catalog.unit_type AS ENUM ('weight', 'volume', 'count', 'length', 'area');

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
    category VARCHAR(100), -- Optional high-level category for grouping (e.g. retail, service)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business.businesses (
    id BIGSERIAL PRIMARY KEY,
    business_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL, -- No FK to core, loose coupling
    business_name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    domain VARCHAR(100) UNIQUE, -- Website domain url of the business
    company_id UUID, -- External company ID from auth server
    business_type_uuid UUID NOT NULL, -- No FK, loose coupling
    name VARCHAR(255) NOT NULL,
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
    enable_online_orders BOOLEAN DEFAULT false,
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

CREATE TABLE catalog.units (
    id BIGSERIAL PRIMARY KEY,
    unit_uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    tenant_uuid UUID NOT NULL,
    business_uuid UUID NOT NULL, -- Reference to business
    business_type_uuid UUID NOT NULL, -- Reference to business type
    name VARCHAR(50) NOT NULL,
    short_name JSONB NOT NULL DEFAULT '{"en": "", "bn": ""}'::jsonb, -- Multilingual short name: {"en": "kg", "bn": "কেজি"}
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
-- MODULE 6: PURCHASING MANAGEMENT
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
SELECT business_uuid, tenant_uuid, business_type_uuid, name, code, is_active
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

-- ============================================
-- INITIAL SEED DATA
-- ============================================

/* ============================================
-- BANGLADESHI ADMINISTRATIVE HIERARCHY SEED DATA
-- (disabled: location now comes from external Auth/Location API)
-- ============================================
-- Complete administrative data for Bangladesh:
-- - 1 Country (Bangladesh)
-- - 8 Divisions (Dhaka, Chittagong, Rajshahi, Khulna, Barisal, Sylhet, Rangpur, Mymensingh)
-- - 64 Districts (all districts across all divisions)
-- - 492 Upazilas/Thanas (all sub-districts)
--
-- Data source: locations_bn.json and locations_en.json
-- Note: name field contains English names, name_bn field contains Bengali names
--

-- ============================================
-- COMPLETE LOCATIONS DATA INSERT
-- All divisions, districts, and upazilas from locations_bn.json
-- ============================================

-- Insert Bangladesh country
INSERT INTO core.countries (country_uuid, name, code, name_bn, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Bangladesh', 'BGD', 'বাংলাদেশ', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    name_bn = EXCLUDED.name_bn,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- INSERT DIVISIONS
-- ============================================

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Khulna', 
    'খুলনা', 
    'KHU', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Chattogram', 
    'চট্টগ্রাম', 
    'CTG', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Dhaka', 
    'ঢাকা', 
    'DHA', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Barishal', 
    'বরিশাল', 
    'BAR', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Mymensingh', 
    'ময়মনসিংহ', 
    'MYM', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Rangpur', 
    'রংপুর', 
    'RAN', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Rajshahi', 
    'রাজশাহী', 
    'RAJ', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    'Sylhet', 
    'সিলেট', 
    'SYL', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- INSERT DISTRICTS AND UPAZILAS
-- ============================================

DO $$
DECLARE
    v_country_uuid UUID;
    v_division_uuid UUID;
    v_district_uuid UUID;
    v_upazila_uuid UUID;
    v_district_counter INTEGER := 0;
    v_upazila_counter INTEGER := 0;
BEGIN
    -- Get Bangladesh UUID
    SELECT country_uuid INTO v_country_uuid FROM core.countries WHERE code = 'BGD';
    
    -- ============================================
    -- Division: খুলনা (Khulna)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'KHU';
    
    -- District: বাগেরহাট (Bagerhat)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Bagerhat',
        'বাগেরহাট',
        'KHU-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বাগেরহাট সদর (Bagerhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bagerhat',
        'বাগেরহাট সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কচুয়া (Chitalmari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chitalmari',
        'কচুয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চিতলমারী (Fakirhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fakirhat',
        'চিতলমারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফকিরহাট (Kachua)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kachua',
        'ফকিরহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোংলা (Mollahat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mollahat',
        'মোংলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোড়েলগঞ্জ (Mongla)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mongla',
        'মোড়েলগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোল্লাহাট (Morrelganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Morrelganj',
        'মোল্লাহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রামপাল (Rampal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rampal',
        'রামপাল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শরণখোলা (Sharankhola)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sharankhola',
        'শরণখোলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: চুয়াডাঙ্গা (Chuadanga)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Chuadanga',
        'চুয়াডাঙ্গা',
        'KHU-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: চুয়াডাঙ্গা সদর (Alamdanga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Alamdanga',
        'চুয়াডাঙ্গা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আলমডাঙ্গা (Chuadanga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chuadanga',
        'আলমডাঙ্গা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জীবননগর (Damurhuda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Damurhuda',
        'জীবননগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দামুড়হুদা (Jibannagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jibannagar',
        'দামুড়হুদা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: যশোর (Jashore)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Jashore',
        'যশোর',
        'KHU-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: যশোর সদর (Abhoynagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Abhoynagar',
        'যশোর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: অভয়নগর (Bagherpara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bagherpara',
        'অভয়নগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কেশবপুর (Chowgacha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chowgacha',
        'কেশবপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চৌগাছা (Jashore)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jashore',
        'চৌগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঝিকরগাছা (Jhikargacha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jhikargacha',
        'ঝিকরগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাঘারপাড়া (Keshabpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Keshabpur',
        'বাঘারপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মনিরামপুর (Monirampur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Monirampur',
        'মনিরামপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শার্শা (Sarsha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sarsha',
        'শার্শা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ঝিনাইদহ (Jhenaidah)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Jhenaidah',
        'ঝিনাইদহ',
        'KHU-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ঝিনাইদহ সদর (Harinakunda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Harinakunda',
        'ঝিনাইদহ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালীগঞ্জ (Jhenaidah)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jhenaidah',
        'কালীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কোটচাঁদপুর (Kaliganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaliganj',
        'কোটচাঁদপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মহেশপুর (Kotchandpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kotchandpur',
        'মহেশপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শৈলকুপা (Moheshpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Moheshpur',
        'শৈলকুপা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হরিণাকুন্ডু (Shailkupa)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shailkupa',
        'হরিণাকুন্ডু',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: খুলনা (Khulna)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Khulna',
        'খুলনা',
        'KHU-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কয়রা (Batiaghata)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Batiaghata',
        'কয়রা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ডুমুরিয়া (Dacope)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dacope',
        'ডুমুরিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তেরখাদা (Dighalia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dighalia',
        'তেরখাদা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দাকোপ (Dumuria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dumuria',
        'দাকোপ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দিঘলিয়া (Koira)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Koira',
        'দিঘলিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাইকগাছা (Paikgacha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Paikgacha',
        'পাইকগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলতলা (Phultala)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Phultala',
        'ফুলতলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বটিয়াঘাটা (Rupsa)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rupsa',
        'বটিয়াঘাটা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রূপসা (Terokhada)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Terokhada',
        'রূপসা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: কুষ্টিয়া (Kushtia)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Kushtia',
        'কুষ্টিয়া',
        'KHU-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কুষ্টিয়া সদর (Bheramara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bheramara',
        'কুষ্টিয়া সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কুমারখালী (Daulatpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Daulatpur',
        'কুমারখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: খোকসা (Khoksha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Khoksha',
        'খোকসা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দৌলতপুর (Kumarkhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kumarkhali',
        'দৌলতপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভেড়ামারা (Kushtia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kushtia',
        'ভেড়ামারা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মিরপুর (Mirpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mirpur',
        'মিরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মাগুরা (Magura)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Magura',
        'মাগুরা',
        'KHU-07',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: মাগুরা সদর (Magura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Magura',
        'মাগুরা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোহাম্মদপুর (Mohammadpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mohammadpur',
        'মোহাম্মদপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শালিখা (Salikha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Salikha',
        'শালিখা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্রীপুর (Sreepur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sreepur',
        'শ্রীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মেহেরপুর (Meherpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Meherpur',
        'মেহেরপুর',
        'KHU-08',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: মেহেরপুর সদর (Gangni)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gangni',
        'মেহেরপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গাংনী (Meherpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Meherpur',
        'গাংনী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মুজিবনগর (Mujib Nagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mujib Nagar',
        'মুজিবনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নড়াইল (Narail)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Narail',
        'নড়াইল',
        'KHU-09',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নড়াইল সদর (Kalia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalia',
        'নড়াইল সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালিয়া (Lohagara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lohagara',
        'কালিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লোহাগড়া (Narail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Narail',
        'লোহাগড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: সাতক্ষীরা (Satkhira)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Satkhira',
        'সাতক্ষীরা',
        'KHU-10',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: সাতক্ষীরা সদর (Assasuni)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Assasuni',
        'সাতক্ষীরা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আশাশুনি (Debhata)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Debhata',
        'আশাশুনি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কলারোয়া (Kalaroa)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalaroa',
        'কলারোয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালীগঞ্জ (Kaliganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaliganj',
        'কালীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তালা (Satkhira)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Satkhira',
        'তালা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দেবহাটা (Shyamnagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shyamnagar',
        'দেবহাটা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্যামনগর (Tala)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tala',
        'শ্যামনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: চট্টগ্রাম (Chittagong)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'CTG';
    
    -- District: বি.বাড়িয়া (B.baria)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'B.baria',
        'বি.বাড়িয়া',
        'CTG-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ব্রাহ্মণবাড়িয়া সদর (Akhaura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Akhaura',
        'ব্রাহ্মণবাড়িয়া সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নবীনগর (Ashuganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ashuganj',
        'নবীনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আশুগঞ্জ (B.Baria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'B.Baria',
        'আশুগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আখাউড়া (Bancharampur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bancharampur',
        'আখাউড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কসবা (Bijoynagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bijoynagar',
        'কসবা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিজয়নগর (Kasba)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kasba',
        'বিজয়নগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সরাইল (Nabinagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nabinagar',
        'সরাইল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাসিরনগর (Nasirnagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nasirnagar',
        'নাসিরনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাঞ্ছারামপুর (Sarail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sarail',
        'বাঞ্ছারামপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: বান্দরবান (Bandarban)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Bandarban',
        'বান্দরবান',
        'CTG-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বান্দরবন সদর (Alikadam)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Alikadam',
        'বান্দরবন সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আলীকদম (Bandarban)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bandarban',
        'আলীকদম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: থানচি (Lama)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lama',
        'থানচি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাইক্ষ্যংছড়ি (Naikhyongchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Naikhyongchari',
        'নাইক্ষ্যংছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রুমা (Rowangchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rowangchari',
        'রুমা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রোয়াংছড়ি (Ruma)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ruma',
        'রোয়াংছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লামা (Thanchi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Thanchi',
        'লামা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: চাঁদপুর (Chandpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Chandpur',
        'চাঁদপুর',
        'CTG-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: চাঁদপুর সদর (Chandpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chandpur',
        'চাঁদপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফরিদগঞ্জ (Faridganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Faridganj',
        'ফরিদগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাজীগঞ্জ (Haimchar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Haimchar',
        'হাজীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাইমচর (Haziganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Haziganj',
        'হাইমচর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শাহরাস্তি (Kachua)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kachua',
        'শাহরাস্তি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শাহরাস্তি (Dakshin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dakshin',
        'শাহরাস্তি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: চট্টগ্রাম (Chattogram)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Chattogram',
        'চট্টগ্রাম',
        'CTG-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: আনোয়ারা (Anwara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Anwara',
        'আনোয়ারা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কর্ণফুলি (Banskhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Banskhali',
        'কর্ণফুলি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চন্দনাইশ (Boalkhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Boalkhali',
        'চন্দনাইশ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পটিয়া (Chandanish)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chandanish',
        'পটিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফটিকছড়ি (Fatikchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fatikchari',
        'ফটিকছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাঁশখালী (Hathazari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hathazari',
        'বাঁশখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বোয়ালখালী (Karnaphuli)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Karnaphuli',
        'বোয়ালখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মীরসরাই (Lohagara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lohagara',
        'মীরসরাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাউজান (Mirsharai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mirsharai',
        'রাউজান',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাঙ্গুনিয়া (Patiya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Patiya',
        'রাঙ্গুনিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লোহাগাড়া (Rangunia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rangunia',
        'লোহাগাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সন্দ্বীপ (Raojan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Raojan',
        'সন্দ্বীপ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাতকানিয়া (Sandwip)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sandwip',
        'সাতকানিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সীতাকুণ্ড (Satkania)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Satkania',
        'সীতাকুণ্ড',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাটহাজারী (Sitakunda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sitakunda',
        'হাটহাজারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: কক্সবাজার (Cox's bazar)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Cox''s bazar',
        'কক্সবাজার',
        'CTG-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কক্সবাজার সদর (Chakoria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chakoria',
        'কক্সবাজার সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: উখিয়া (Cox'S Bazar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Cox''S Bazar',
        'উখিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কুতুবদিয়া (Kutubdia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kutubdia',
        'কুতুবদিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চকরিয়া (Moheskhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Moheskhali',
        'চকরিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: টেকনাফ (Pekua)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pekua',
        'টেকনাফ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পেকুয়া (Ramu)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ramu',
        'পেকুয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মহেশখালী (Teknaf)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Teknaf',
        'মহেশখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রামু (Ukhiya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ukhiya',
        'রামু',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: কুমিল্লা (Cumilla)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Cumilla',
        'কুমিল্লা',
        'CTG-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বরুড়া (Barura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Barura',
        'বরুড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ব্রাহ্মনপাড়া (Brahmanpara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Brahmanpara',
        'ব্রাহ্মনপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বুড়িচং (Burichong)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Burichong',
        'বুড়িচং',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চান্দিনা (Chandina)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chandina',
        'চান্দিনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চৌদ্দগ্রাম (Chouddagram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chouddagram',
        'চৌদ্দগ্রাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কুমিল্লা- সদর (Cumilla)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Cumilla',
        'কুমিল্লা- সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সদর দক্ষিন (Cumilla-S Daksin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Cumilla-S Daksin',
        'সদর দক্ষিন',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দাউদকান্দি (Daudkandi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Daudkandi',
        'দাউদকান্দি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দেবিদ্বার (Debidwar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Debidwar',
        'দেবিদ্বার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হোমনা (Homna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Homna',
        'হোমনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লাকসাম (Laksham)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Laksham',
        'লাকসাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লালমাই (Lalmai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lalmai',
        'লালমাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মেঘনা (Meghna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Meghna',
        'মেঘনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মনোহরগঞ্জ (Monohorganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Monohorganj',
        'মনোহরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মুরাদনগর (Muradnagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Muradnagar',
        'মুরাদনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাঙ্গলকোট (Nangalkot)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nangalkot',
        'নাঙ্গলকোট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তিতাস (Titas)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Titas',
        'তিতাস',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ফেনী (Feni)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Feni',
        'ফেনী',
        'CTG-07',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ফেনী সদর (Chhagalniya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chhagalniya',
        'ফেনী সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দাগনভূঁইয়া (Daganbhuiyan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Daganbhuiyan',
        'দাগনভূঁইয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সোনাগাজী (Feni)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Feni',
        'সোনাগাজী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ছাগলনাইয়া (Fulgazi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fulgazi',
        'ছাগলনাইয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পরশুরাম (Porshuram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Porshuram',
        'পরশুরাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলগাজী (Sonagazi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sonagazi',
        'ফুলগাজী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: খাগড়াছড়ি (Khagrachari)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Khagrachari',
        'খাগড়াছড়ি',
        'CTG-08',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: খাগড়াছড়ি সদর (Dighinala)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dighinala',
        'খাগড়াছড়ি সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পানছড়ি (Guimara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Guimara',
        'পানছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পানছড়ি (Khagrachari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Khagrachari',
        'পানছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মহালছড়ি (Laxmichari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Laxmichari',
        'মহালছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মাটিরাঙ্গা (Mahalchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mahalchari',
        'মাটিরাঙ্গা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মানিকছড়ি (Manikchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Manikchari',
        'মানিকছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রামগড় (Matiranga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Matiranga',
        'রামগড়',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লক্ষীছড়ি (Panchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Panchari',
        'লক্ষীছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গুইমারা (Ramgarh)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ramgarh',
        'গুইমারা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: লক্ষ্মীপুর (Laxmipur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Laxmipur',
        'লক্ষ্মীপুর',
        'CTG-09',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: লক্ষ্মীপুর (Komol Nagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Komol Nagar',
        'লক্ষ্মীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রায়পুর (Laxmipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Laxmipur',
        'রায়পুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রামগঞ্জ (Raipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Raipur',
        'রামগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রামগতি (Ramganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ramganj',
        'রামগতি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কমলনগর (Ramgati)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ramgati',
        'কমলনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নোয়াখালী (Noakhali)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Noakhali',
        'নোয়াখালী',
        'CTG-10',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বেগমগঞ্জ (Begumganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Begumganj',
        'বেগমগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চাটখিল (Chatkhil)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chatkhil',
        'চাটখিল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কোম্পানীগঞ্জ (Companiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Companiganj',
        'কোম্পানীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাতিয়া (Hatiya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hatiya',
        'হাতিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কবিরহাট (Kabir Hat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kabir Hat',
        'কবিরহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নোয়াখালী সদর (Noakhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Noakhali',
        'নোয়াখালী সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সেনবাগ (Senbag)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Senbag',
        'সেনবাগ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সোনাইমুড়ী (Sonaimuri)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sonaimuri',
        'সোনাইমুড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সুবর্ণচর (Subarna Char)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Subarna Char',
        'সুবর্ণচর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: রাঙ্গামাটি (Rangamati)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Rangamati',
        'রাঙ্গামাটি',
        'CTG-11',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: রাঙ্গামাটি সদর (Baghaichari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Baghaichari',
        'রাঙ্গামাটি সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নানিয়ারচর (Barkal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Barkal',
        'নানিয়ারচর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লংগদু (Belaichari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Belaichari',
        'লংগদু',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাঘাইছড়ি (Juraichari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Juraichari',
        'বাঘাইছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বরকল (Kaptai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaptai',
        'বরকল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জুরাছড়ি (Kaukhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaukhali',
        'জুরাছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিলাইছড়ি (Langadu)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Langadu',
        'বিলাইছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাজস্থলী (Nanniarchar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nanniarchar',
        'রাজস্থলী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাপ্তাই (Rajosthali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajosthali',
        'কাপ্তাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাউখালী (Rangamati)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rangamati',
        'কাউখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: ঢাকা (Dhaka)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'DHA';
    
    -- District: ঢাকা (Dhaka)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Dhaka',
        'ঢাকা',
        'DHA-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: সাভার (Dhamrai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dhamrai',
        'সাভার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধামরাই (Dohar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dohar',
        'ধামরাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দোহার (Keraniganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Keraniganj',
        'দোহার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কেরানীগঞ্জ (Nawabganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nawabganj',
        'কেরানীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নবাবগঞ্জ (Savar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Savar',
        'নবাবগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ফরিদপুর (Faridpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Faridpur',
        'ফরিদপুর',
        'DHA-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ফরিদপুর সদর (Alfadanga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Alfadanga',
        'ফরিদপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বোয়ালমারী (Bhanga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhanga',
        'বোয়ালমারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আলফাডাঙ্গা (Boalmari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Boalmari',
        'আলফাডাঙ্গা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মধুখালী (Charbhadrasan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Charbhadrasan',
        'মধুখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভাঙ্গা (Faridpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Faridpur',
        'ভাঙ্গা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নগরকান্দা (Madhukhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Madhukhali',
        'নগরকান্দা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চরভদ্রাসন (Nagarkanda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nagarkanda',
        'চরভদ্রাসন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সদরপুর (Sadarpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sadarpur',
        'সদরপুর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সালথা (Saltha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Saltha',
        'সালথা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: গাজীপুর (Gazipur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Gazipur',
        'গাজীপুর',
        'DHA-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: গাজীপুর সদর (Gazipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gazipur',
        'গাজীপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালিয়াকৈর (Kaliakoir)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaliakoir',
        'কালিয়াকৈর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালীগঞ্জ (Kaliganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaliganj',
        'কালীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাপাসিয়া (Kapasia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kapasia',
        'কাপাসিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্রীপুর (Sreepur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sreepur',
        'শ্রীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: গোপালগঞ্জ (Gopalganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Gopalganj',
        'গোপালগঞ্জ',
        'DHA-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: গোপালগঞ্জ সদর (Gopalganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gopalganj',
        'গোপালগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মুকসুদপুর (Kasiani)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kasiani',
        'মুকসুদপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাশিয়ানী (Kotwalipara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kotwalipara',
        'কাশিয়ানী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কোটালীপাড়া (Muksudpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Muksudpur',
        'কোটালীপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: টুঙ্গিপাড়া (Tungipara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tungipara',
        'টুঙ্গিপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: কিশোরগঞ্জ (Kishoreganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Kishoreganj',
        'কিশোরগঞ্জ',
        'DHA-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কিশোরগঞ্জ সদর (Austagram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Austagram',
        'কিশোরগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: অষ্টগ্রাম (Bajitpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bajitpur',
        'অষ্টগ্রাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ইটনা (Bhairab)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhairab',
        'ইটনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: করিমগঞ্জ (Hossainpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hossainpur',
        'করিমগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কটিয়াদি (Itna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Itna',
        'কটিয়াদি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কুলিয়ারচর (Karimganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Karimganj',
        'কুলিয়ারচর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তাড়াইল (Katiadi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Katiadi',
        'তাড়াইল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নিকলী (Kishoreganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kishoreganj',
        'নিকলী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাকুন্দিয়া (Kuliarchar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kuliarchar',
        'পাকুন্দিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাজিতপুর (Mithamoin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mithamoin',
        'বাজিতপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভৈরব (Nikli)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nikli',
        'ভৈরব',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মিঠামইন (Pakundia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pakundia',
        'মিঠামইন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হোসেনপুর (Tarail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tarail',
        'হোসেনপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মাদারীপুর (Madaripur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Madaripur',
        'মাদারীপুর',
        'DHA-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: মাদারীপুর সদর (Kalkini)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalkini',
        'মাদারীপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শিবচর (Madaripur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Madaripur',
        'শিবচর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালকিনী (Rajoir)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajoir',
        'কালকিনী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাজৈর (Shibchar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shibchar',
        'রাজৈর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মানিকগঞ্জ (Manikganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Manikganj',
        'মানিকগঞ্জ',
        'DHA-07',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: মাদারীপুর সদর (Daulatpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Daulatpur',
        'মাদারীপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মানিকগঞ্জ সদর (Ghior)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ghior',
        'মানিকগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঘিওর (Harirampur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Harirampur',
        'ঘিওর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দৌলতপুর (Manikganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Manikganj',
        'দৌলতপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শিবালয় (Saturia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Saturia',
        'শিবালয়',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাটুরিয়া (Shivalaya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shivalaya',
        'সাটুরিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সিঙ্গাইর (Singair)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Singair',
        'সিঙ্গাইর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হরিরামপুর (হরিরামপুর)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'হরিরামপুর',
        'হরিরামপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মুন্সিগঞ্জ (Munshiganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Munshiganj',
        'মুন্সিগঞ্জ',
        'DHA-08',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: মুন্সিগঞ্জ সদর (Gazaria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gazaria',
        'মুন্সিগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্রীনগর সদর (Lauhajong)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lauhajong',
        'শ্রীনগর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সিরাজদীখান (Munshiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Munshiganj',
        'সিরাজদীখান',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লৌহজং (Sirajdikhan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sirajdikhan',
        'লৌহজং',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: টঙ্গীবাড়ী (Sreenagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sreenagar',
        'টঙ্গীবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গজারিয়া (Tongibari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tongibari',
        'গজারিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নারায়ণগঞ্জ (Narayanganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Narayanganj',
        'নারায়ণগঞ্জ',
        'DHA-09',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নারায়ণগঞ্জ সদর (Araihazar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Araihazar',
        'নারায়ণগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বন্দর (Bandar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bandar',
        'বন্দর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আড়াইহাজার (Narayanganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Narayanganj',
        'আড়াইহাজার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রূপগঞ্জ (Rupganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rupganj',
        'রূপগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সোনারগাঁও (Sonargaon)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sonargaon',
        'সোনারগাঁও',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নরসিংদী (Narshingdi)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Narshingdi',
        'নরসিংদী',
        'DHA-10',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নরসিংদী সদর (Belabo)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Belabo',
        'নরসিংদী সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বেলাবো (Monohardi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Monohardi',
        'বেলাবো',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শিবপুর (Narshingdi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Narshingdi',
        'শিবপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মনোহরদী (Palash)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Palash',
        'মনোহরদী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রায়পুরা (Raipura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Raipura',
        'রায়পুরা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পলাশ (Shibpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shibpur',
        'পলাশ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: রাজবাড়ী (Rajbari)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Rajbari',
        'রাজবাড়ী',
        'DHA-11',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: রাজবাড়ি সদর (Baliakandi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Baliakandi',
        'রাজবাড়ি সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোয়ালন্দ (Goalanda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Goalanda',
        'গোয়ালন্দ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাংশা (Kalukhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalukhali',
        'পাংশা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বালিয়াকান্দি (Pangsha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pangsha',
        'বালিয়াকান্দি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালুখালী (Rajbari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajbari',
        'কালুখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: শরীয়তপুর (Shariatpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Shariatpur',
        'শরীয়তপুর',
        'DHA-12',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: শরিয়তপুর সদর (Bhedarganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhedarganj',
        'শরিয়তপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ডামুড্যা (Damuddya)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Damuddya',
        'ডামুড্যা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নড়িয়া (Goshairhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Goshairhat',
        'নড়িয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভেদরগঞ্জ (Janjira)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Janjira',
        'ভেদরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জাজিরা (Naria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Naria',
        'জাজিরা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোসাইরহাট (Shariatpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shariatpur',
        'গোসাইরহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: টাঙ্গাইল (Tangail)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Tangail',
        'টাঙ্গাইল',
        'DHA-13',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: টাঙ্গাইল সদর (Basail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Basail',
        'টাঙ্গাইল সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালিহাতি (Bhuapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhuapur',
        'কালিহাতি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঘাটাইল (Delduar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Delduar',
        'ঘাটাইল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাসাইল (Dhanbari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dhanbari',
        'বাসাইল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোপালপুর (Ghatail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ghatail',
        'গোপালপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মির্জাপুর (Gopalpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gopalpur',
        'মির্জাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভূঞাপুর (Kalihati)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalihati',
        'ভূঞাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাগরপুর (Madhupur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Madhupur',
        'নাগরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মধুপুর (Mirzapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mirzapur',
        'মধুপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সখিপুর (Nagarpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nagarpur',
        'সখিপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দেলদুয়ার (Shakhipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shakhipur',
        'দেলদুয়ার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধনবাড়ী (Tangail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tangail',
        'ধনবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: বরিশাল (Barisal)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'BAR';
    
    -- District: বরগুনা (Barguna)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Barguna',
        'বরগুনা',
        'BAR-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বরগুনা সদর (Amtali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Amtali',
        'বরগুনা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আমতলী (Bamna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bamna',
        'আমতলী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বেতাগী (Barguna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Barguna',
        'বেতাগী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বামনা (Betagi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Betagi',
        'বামনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাথরঘাটা (Patharghata)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Patharghata',
        'পাথরঘাটা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তালতলী (Taltali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Taltali',
        'তালতলী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: বরিশাল (Barisal)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Barisal',
        'বরিশাল',
        'BAR-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বরিশাল সদর (Barisal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Barisal',
        'বরিশাল সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গৌরনদী (Gournadi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gournadi',
        'গৌরনদী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মুলাদী (Muladi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Muladi',
        'মুলাদী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মেহেন্দিগঞ্জ (Mehendiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mehendiganj',
        'মেহেন্দিগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাবুগঞ্জ (Babuganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Babuganj',
        'বাবুগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হিজলা (Hizla)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hizla',
        'হিজলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: উজিরপুর (Uzirpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Uzirpur',
        'উজিরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাকেরগঞ্জ (Bakerganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bakerganj',
        'বাকেরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আগৈলঝাড়া (Agailjhara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Agailjhara',
        'আগৈলঝাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বানারীপাড়া (Banaripara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Banaripara',
        'বানারীপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ভোলা (Bhola)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Bhola',
        'ভোলা',
        'BAR-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ভোলা সদর (Borhanuddin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Borhanuddin',
        'ভোলা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বোরহান উদ্দিন (Charfassion)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Charfassion',
        'বোরহান উদ্দিন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দৌলতখান (Daulatkhan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Daulatkhan',
        'দৌলতখান',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লালমোহন (Lalmohan)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lalmohan',
        'লালমোহন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তজুমদ্দিন (Monpura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Monpura',
        'তজুমদ্দিন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চরফ্যাশন (Tazumuddin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tazumuddin',
        'চরফ্যাশন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মনপুরা (মনপুরা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মনপুরা',
        'মনপুরা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ঝালকাঠি (Jhalokathi)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Jhalokathi',
        'ঝালকাঠি',
        'BAR-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ঝালকাঠি সদর (Tazumuddin)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tazumuddin',
        'ঝালকাঠি সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাঁঠালিয়া (Jhalokathi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jhalokathi',
        'কাঁঠালিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নলছিটি (Kathalia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kathalia',
        'নলছিটি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাজাপুর (Nalchity)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nalchity',
        'রাজাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: পটুয়াখালী (Patuakhali)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Patuakhali',
        'পটুয়াখালী',
        'BAR-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: পটুয়াখালী সদর (Bauphal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bauphal',
        'পটুয়াখালী সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাউফল (Dashmina)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dashmina',
        'বাউফল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দশমিনা (Dumki)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dumki',
        'দশমিনা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গলাচিপা (Galachipa)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Galachipa',
        'গলাচিপা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কলাপাড়া (Kalapara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalapara',
        'কলাপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মির্জাগঞ্জ (Mirjaganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mirjaganj',
        'মির্জাগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দুমকি (Patuakhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Patuakhali',
        'দুমকি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাঙ্গাবালী (Rangabali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rangabali',
        'রাঙ্গাবালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: পিরোজপুর (Pirojpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Pirojpur',
        'পিরোজপুর',
        'BAR-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ভান্ডারিয়া (Bhandaria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhandaria',
        'ভান্ডারিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাউখালী (Kawkhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kawkhali',
        'কাউখালী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মঠবাড়িয়া (Mothbaria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mothbaria',
        'মঠবাড়িয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাজিরপুর (Nazirpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nazirpur',
        'নাজিরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পিরোজপুর সদর (Nesarabad)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nesarabad',
        'পিরোজপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নেছারাবাদ (Pirojpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pirojpur',
        'নেছারাবাদ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ইন্দুরকানী (Zianagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Zianagar',
        'ইন্দুরকানী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: ময়মনসিংহ (Mymensingh)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'MYM';
    
    -- District: জামালপুর (Jamalpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Jamalpur',
        'জামালপুর',
        'MYM-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: জামালপুর সদর (জামালপুর Sadar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'জামালপুর Sadar',
        'জামালপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বকশীগঞ্জ (বকশীগঞ্জ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'বকশীগঞ্জ',
        'বকশীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দেওয়ানগঞ্জ (দেওয়ানগঞ্জ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'দেওয়ানগঞ্জ',
        'দেওয়ানগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ইসলামপুর (ইসলামপুর)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ইসলামপুর',
        'ইসলামপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মাদারগঞ্জ (মাদারগঞ্জ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মাদারগঞ্জ',
        'মাদারগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মেলান্দহ (মেলান্দহ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মেলান্দহ',
        'মেলান্দহ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সরিষাবাড়ি (সরিষাবাড়ি)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'সরিষাবাড়ি',
        'সরিষাবাড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ময়মনসিংহ (Mymensingh)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Mymensingh',
        'ময়মনসিংহ',
        'MYM-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ময়মনসিংহ সদর (ময়মনসিংহ Sadar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ময়মনসিংহ Sadar',
        'ময়মনসিংহ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলবাড়িয়া (ফুলবাড়িয়া)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ফুলবাড়িয়া',
        'ফুলবাড়িয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ত্রিশাল (ত্রিশাল)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ত্রিশাল',
        'ত্রিশাল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভালুকা (ভালুকা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ভালুকা',
        'ভালুকা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মুক্তাগাছা (মুক্তাগাছা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মুক্তাগাছা',
        'মুক্তাগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধোবাউড়া (ধোবাউড়া)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ধোবাউড়া',
        'ধোবাউড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলপুর (ফুলপুর)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ফুলপুর',
        'ফুলপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হালুয়াঘাট (হালুয়াঘাট)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'হালুয়াঘাট',
        'হালুয়াঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গৌরীপুর (গৌরীপুর)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'গৌরীপুর',
        'গৌরীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গফরগাঁও (গফরগাঁও)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'গফরগাঁও',
        'গফরগাঁও',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঈশ্বরগঞ্জ (ঈশ্বরগঞ্জ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ঈশ্বরগঞ্জ',
        'ঈশ্বরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নান্দাইল (নান্দাইল)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'নান্দাইল',
        'নান্দাইল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তারাকান্দা (তারাকান্দা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'তারাকান্দা',
        'তারাকান্দা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নেত্রকোনা (নেত্রকোনা)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'নেত্রকোনা',
        'নেত্রকোনা',
        'MYM-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নেত্রকোনা সদর (নেত্রকোনা Sadar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'নেত্রকোনা Sadar',
        'নেত্রকোনা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আটপাড়া (আটপাড়া)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'আটপাড়া',
        'আটপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বারহাট্টা (বারহাট্টা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'বারহাট্টা',
        'বারহাট্টা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দুর্গাপুর (দুর্গাপুর)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'দুর্গাপুর',
        'দুর্গাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: খালিয়াজুড়ি (খালিয়াজুড়ি)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'খালিয়াজুড়ি',
        'খালিয়াজুড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কলমাকান্দা (কলমাকান্দা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'কলমাকান্দা',
        'কলমাকান্দা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কেন্দুয়া (কেন্দুয়া)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'কেন্দুয়া',
        'কেন্দুয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মদন (মদন)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মদন',
        'মদন',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোহনগঞ্জ (মোহনগঞ্জ)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'মোহনগঞ্জ',
        'মোহনগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পূর্বধলা (পূর্বধলা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'পূর্বধলা',
        'পূর্বধলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: শেরপুর (Sherpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Sherpur',
        'শেরপুর',
        'MYM-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: শেরপুর সদর (শেরপুর Sadar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'শেরপুর Sadar',
        'শেরপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঝিনাইগাতী (ঝিনাইগাতী)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ঝিনাইগাতী',
        'ঝিনাইগাতী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নকলা (নকলা)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'নকলা',
        'নকলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নালিতাবাড়ী (নালিতাবাড়ী)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'নালিতাবাড়ী',
        'নালিতাবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্রীবরদী (শ্রীবরদী)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'শ্রীবরদী',
        'শ্রীবরদী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: রংপুর (Rangpur)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'RAN';
    
    -- District: দিনাজপুর (Dinajpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Dinajpur',
        'দিনাজপুর',
        'RAN-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: দিনাজপুর সদর (Birampur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Birampur',
        'দিনাজপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিরামপুর (Birganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Birganj',
        'বিরামপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বীরগঞ্জ (Birol)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Birol',
        'বীরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বোচাগঞ্জ (Bochaganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bochaganj',
        'বোচাগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলবাড়ী (Chirirbandar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chirirbandar',
        'ফুলবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চিরিরবন্দর (Dinajpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dinajpur',
        'চিরিরবন্দর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঘোড়াঘাট (Fulbari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fulbari',
        'ঘোড়াঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাকিমপুর (Ghoraghat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ghoraghat',
        'হাকিমপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাহারোল (Hakimpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hakimpur',
        'কাহারোল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: খানসামা (Kaharol)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaharol',
        'খানসামা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নবাবগঞ্জ (Khanshama)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Khanshama',
        'নবাবগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পার্বতীপুর (Nawabganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nawabganj',
        'পার্বতীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিরল (Parbatipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Parbatipur',
        'বিরল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: গাইবান্ধা (Gaibandha)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Gaibandha',
        'গাইবান্ধা',
        'RAN-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: লক্ষ্মীপুর (Fulchari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fulchari',
        'লক্ষ্মীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলছড়ি (Gaibandha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gaibandha',
        'ফুলছড়ি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোবিন্দগঞ্জ (Gobindaganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gobindaganj',
        'গোবিন্দগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পলাশবাড়ী (Palashbari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Palashbari',
        'পলাশবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাদুল্লাপুর (Sadullapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sadullapur',
        'সাদুল্লাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাঘাটা (Saghata)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Saghata',
        'সাঘাটা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সুন্দরগঞ্জ (Sundarganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sundarganj',
        'সুন্দরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: কুড়িগ্রাম (Kurigram)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Kurigram',
        'কুড়িগ্রাম',
        'RAN-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কুড়িগ্রাম সদর (Bhurungamari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhurungamari',
        'কুড়িগ্রাম সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: উলিপুর (Chilmari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chilmari',
        'উলিপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চর রাজিবপুর (Fulbari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fulbari',
        'চর রাজিবপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চিলমারী (Kurigram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kurigram',
        'চিলমারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাগেশ্বরী (Nageswari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nageswari',
        'নাগেশ্বরী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফুলবাড়ী (Rajarhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajarhat',
        'ফুলবাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভুরুঙ্গামারী (Rajibpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajibpur',
        'ভুরুঙ্গামারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাজারহাট (Rowmari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rowmari',
        'রাজারহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রৌমারী (Ulipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ulipur',
        'রৌমারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: লালমনিরহাট (Lalmonirhat)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Lalmonirhat',
        'লালমনিরহাট',
        'RAN-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: লালমনিরহাট সদর (Aditmari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Aditmari',
        'লালমনিরহাট সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আদিতমারী (Hatibandha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Hatibandha',
        'আদিতমারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালীগঞ্জ (Kaliganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaliganj',
        'কালীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাটগ্রাম (Lalmonirhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lalmonirhat',
        'পাটগ্রাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হাতীবান্ধা (Patgram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Patgram',
        'হাতীবান্ধা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নীলফামারী (Nilphamari)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Nilphamari',
        'নীলফামারী',
        'RAN-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নীলফামারী সদর (Dimla)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dimla',
        'নীলফামারী সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ডোমার (Domar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Domar',
        'ডোমার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ডিমলা (Jaldhaka)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jaldhaka',
        'ডিমলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জলঢাকা (Kishoreganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kishoreganj',
        'জলঢাকা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কিশোরগঞ্জ (Nilphamari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nilphamari',
        'কিশোরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সৈয়দপুর (Sayedpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sayedpur',
        'সৈয়দপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: পঞ্চগড় (Panchagarh)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Panchagarh',
        'পঞ্চগড়',
        'RAN-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: পঞ্চগড় সদর (Atwari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Atwari',
        'পঞ্চগড় সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দেবীগঞ্জ (Boda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Boda',
        'দেবীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তেতুলিয়া (Debiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Debiganj',
        'তেতুলিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আটোয়ারী (Panchagarh)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Panchagarh',
        'আটোয়ারী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বোদা (Tetulia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tetulia',
        'বোদা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: রংপুর (Rangpur)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Rangpur',
        'রংপুর',
        'RAN-07',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: রংপুর সদর (Badarganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Badarganj',
        'রংপুর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বদরগঞ্জ (Gangachara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gangachara',
        'বদরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গংগাচড়া (Kaunia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kaunia',
        'গংগাচড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাউনিয়া (Mithapukur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mithapukur',
        'কাউনিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মিঠাপুকুর (Pirgacha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pirgacha',
        'মিঠাপুকুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পীরগাছা (Pirganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pirganj',
        'পীরগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পীরগাছা (Rangpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rangpur',
        'পীরগাছা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তারাগঞ্জ (Taraganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Taraganj',
        'তারাগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: ঠাকুরগাঁও (Thakurgaon)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Thakurgaon',
        'ঠাকুরগাঁও',
        'RAN-08',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: ঠাকুরগাঁও সদর (Baliadangi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Baliadangi',
        'ঠাকুরগাঁও সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পীরগঞ্জ (Haripur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Haripur',
        'পীরগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বালিয়াডাঙ্গী (Pirganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pirganj',
        'বালিয়াডাঙ্গী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রানীশংকৈল (Ranisankail)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ranisankail',
        'রানীশংকৈল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: হরিপুর (Thakurgaon)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Thakurgaon',
        'হরিপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: রাজশাহী (Rajshahi)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'RAJ';
    
    -- District: বগুড়া (Bogura)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Bogura',
        'বগুড়া',
        'RAJ-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বগুড়া সদর (Adamdighi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Adamdighi',
        'বগুড়া সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আদমদিঘী (Bogura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bogura',
        'আদমদিঘী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধুনট (Dhunot)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dhunot',
        'ধুনট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধুপচাঁচিয়া (Dhupchancia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dhupchancia',
        'ধুপচাঁচিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গাবতলী (Gabtali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gabtali',
        'গাবতলী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাহালু (Kahaloo)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kahaloo',
        'কাহালু',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নন্দীগ্রাম (Nandigram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nandigram',
        'নন্দীগ্রাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সারিয়াকান্দি (Sariakandi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sariakandi',
        'সারিয়াকান্দি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শেরপুর (Shajahanpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shajahanpur',
        'শেরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শিবগঞ্জ (Sherpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sherpur',
        'শিবগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সোনাতলা (Shibganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shibganj',
        'সোনাতলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শাজাহানপুর (Sonatala)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sonatala',
        'শাজাহানপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: চাঁপাইনবাবগঞ্জ (C. nawabganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'C. nawabganj',
        'চাঁপাইনবাবগঞ্জ',
        'RAJ-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: চাঁপাইনবাবগঞ্জ সদর (Bholahat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bholahat',
        'চাঁপাইনবাবগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোমস্তাপুর (Gomostapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gomostapur',
        'গোমস্তাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শিবগঞ্জ (Nachol)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nachol',
        'শিবগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নাচোল (Nawabganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nawabganj',
        'নাচোল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভোলাহাট (Shibganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shibganj',
        'ভোলাহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: জয়পুরহাট (Joypurhat)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Joypurhat',
        'জয়পুরহাট',
        'RAJ-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: জয়পুরহাট সদর (Akkelpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Akkelpur',
        'জয়পুরহাট সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পাঁচবিবি (Joypurhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Joypurhat',
        'পাঁচবিবি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কালাই (Kalai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kalai',
        'কালাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ক্ষেতলাল (Khetlal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Khetlal',
        'ক্ষেতলাল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আক্কেলপুর (Panchbibi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Panchbibi',
        'আক্কেলপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নওগাঁ (Naogaon)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Naogaon',
        'নওগাঁ',
        'RAJ-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নওগাঁ সদর (Atrai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Atrai',
        'নওগাঁ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পত্নীতলা (Badalgachi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Badalgachi',
        'পত্নীতলা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধামইরহাট (Dhamoirhat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dhamoirhat',
        'ধামইরহাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মহাদেবপুর (Manda)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Manda',
        'মহাদেবপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পরশা (Mohadevpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mohadevpur',
        'পরশা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাপাহার (Naogaon)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Naogaon',
        'সাপাহার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বদলগাছী (Niamatpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Niamatpur',
        'বদলগাছী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মান্দা (Patnitala)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Patnitala',
        'মান্দা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নিয়ামতপুর (Porsha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Porsha',
        'নিয়ামতপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আত্রাই (Raninagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Raninagar',
        'আত্রাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাণীনগর (Shapahar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shapahar',
        'রাণীনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: নাটোর (Natore)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Natore',
        'নাটোর',
        'RAJ-05',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: নাটোর সদর (Bagatipara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bagatipara',
        'নাটোর সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাগাতিপাড়া (Baraigram)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Baraigram',
        'বাগাতিপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বড়াইগ্রাম (Gurudaspur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gurudaspur',
        'বড়াইগ্রাম',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গুরুদাসপুর (Lalpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lalpur',
        'গুরুদাসপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লালপুর (Naldanga)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Naldanga',
        'লালপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সিংড়া (Natore)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Natore',
        'সিংড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নলডাঙ্গা (Singra)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Singra',
        'নলডাঙ্গা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: পাবনা (Pabna)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Pabna',
        'পাবনা',
        'RAJ-06',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: পাবনা সদর (Atghoria)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Atghoria',
        'পাবনা সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আটঘরিয়া (Bera)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bera',
        'আটঘরিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ঈশ্বরদী (Bhangura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bhangura',
        'ঈশ্বরদী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চাটমোহর (Chatmohar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chatmohar',
        'চাটমোহর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফরিদপুর (Faridpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Faridpur',
        'ফরিদপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বেড়া (Ishwardi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ishwardi',
        'বেড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ভাঙ্গুড়া (Pabna)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Pabna',
        'ভাঙ্গুড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সাঁথিয়া (Santhia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Santhia',
        'সাঁথিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সুজানগর (Sujanagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sujanagar',
        'সুজানগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: রাজশাহী (Rajshahi)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Rajshahi',
        'রাজশাহী',
        'RAJ-07',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: বাঘা (Bagha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bagha',
        'বাঘা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পুঠিয়া (Bagmara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bagmara',
        'পুঠিয়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: পবা (Charghat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Charghat',
        'পবা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাগমারা (Durgapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Durgapur',
        'বাগমারা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তানোর (Godagari)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Godagari',
        'তানোর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মোহনপুর (Mohanpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Mohanpur',
        'মোহনপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চারঘাট (Paba)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Paba',
        'চারঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোদাগাড়ী (Puthia)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Puthia',
        'গোদাগাড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দূর্গাপুর (Tanore)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tanore',
        'দূর্গাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: সিরাজগঞ্জ (Sirajganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Sirajganj',
        'সিরাজগঞ্জ',
        'RAJ-08',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: সিরাজগঞ্জ সদর (Belkuchi)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Belkuchi',
        'সিরাজগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: উল্লাপাড়া (Chowhali)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chowhali',
        'উল্লাপাড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কাজীপুর (Kamarkhand)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kamarkhand',
        'কাজীপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কামারখন্দ (Kazipur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kazipur',
        'কামারখন্দ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চৌহালি (Raiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Raiganj',
        'চৌহালি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তাড়াশ (Shahzadpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Shahzadpur',
        'তাড়াশ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বেলকুচি (Sirajganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sirajganj',
        'বেলকুচি',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রায়গঞ্জ (Tarash)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tarash',
        'রায়গঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শাহজাদপুর (Ullapara)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Ullapara',
        'শাহজাদপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- ============================================
    -- Division: সিলেট (Sylhet)
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = 'SYL';
    
    -- District: হবিগঞ্জ (Habiganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Habiganj',
        'হবিগঞ্জ',
        'SYL-01',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: হবিগঞ্জ সদর (Azmiriganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Azmiriganj',
        'হবিগঞ্জ সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: আজমিরীগঞ্জ (Bahubal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Bahubal',
        'আজমিরীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: চুনারুঘাট (Baniachong)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Baniachong',
        'চুনারুঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: নবীগঞ্জ (Chunarughat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chunarughat',
        'নবীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বানিয়াচং (Habiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Habiganj',
        'বানিয়াচং',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বাহুবল (Lakhai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Lakhai',
        'বাহুবল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মাধবপুর (Madhabpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Madhabpur',
        'মাধবপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: লাখাই (Nabiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Nabiganj',
        'লাখাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শায়েস্তাগঞ্জ (Sayestaganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sayestaganj',
        'শায়েস্তাগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: মৌলভীবাজার (Moulvibazar)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Moulvibazar',
        'মৌলভীবাজার',
        'SYL-02',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: কমলগঞ্জ (Barlekha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Barlekha',
        'কমলগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কুলাউড়া (Juri)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Juri',
        'কুলাউড়া',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জুড়ী (Kamalganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kamalganj',
        'জুড়ী',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বড়লেখা (Kulaura)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kulaura',
        'বড়লেখা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মৌলভীবাজার সদর (Moulvibazar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Moulvibazar',
        'মৌলভীবাজার সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: রাজনগর (Rajnagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Rajnagar',
        'রাজনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শ্রীমঙ্গল (Sreemangal)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sreemangal',
        'শ্রীমঙ্গল',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: সুনামগঞ্জ (Sunamganj)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Sunamganj',
        'সুনামগঞ্জ',
        'SYL-03',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: জামালগঞ্জ (Biswamvarpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Biswamvarpur',
        'জামালগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ধর্মপাশা (Chatak)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Chatak',
        'ধর্মপাশা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: মধ্যনগর (Dakhin Sunamganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dakhin Sunamganj',
        'মধ্যনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: তাহিরপুর (Derai)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Derai',
        'তাহিরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শাল্লা (Dharmapasha)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dharmapasha',
        'শাল্লা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: শান্তিগঞ্জ (Doarabazar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Doarabazar',
        'শান্তিগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দিরাই (Jagannathpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jagannathpur',
        'দিরাই',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জগন্নাথপুর (Jamalganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jamalganj',
        'জগন্নাথপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: সুনামগঞ্জ (Sulla)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sulla',
        'সুনামগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দোয়ারাবাজার (Sunamganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sunamganj',
        'দোয়ারাবাজার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিশ্বম্ভরপুর (Tahirpur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Tahirpur',
        'বিশ্বম্ভরপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ছাতক (ছাতক)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'ছাতক',
        'ছাতক',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- District: সিলেট (Sylhet)
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        'Sylhet',
        'সিলেট',
        'SYL-04',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
    -- Upazila: সিলেট সদর (Balaganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Balaganj',
        'সিলেট সদর',
        'thana',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বালাগঞ্জ (Beanibazar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Beanibazar',
        'বালাগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিয়ানীবাজার (Biswanath)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Biswanath',
        'বিয়ানীবাজার',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: বিশ্বনাথ (Companiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Companiganj',
        'বিশ্বনাথ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কোম্পানীগঞ্জ (Dakshin Surma)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Dakshin Surma',
        'কোম্পানীগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ফেঞ্চুগঞ্জ (Fenchuganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Fenchuganj',
        'ফেঞ্চুগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোলাপগঞ্জ (Golapganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Golapganj',
        'গোলাপগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: গোয়াইনঘাট (Gowainghat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Gowainghat',
        'গোয়াইনঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জৈন্তাপুর (Jointiapur)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Jointiapur',
        'জৈন্তাপুর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: কানাইঘাট (Kanaighat)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Kanaighat',
        'কানাইঘাট',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: জকিগঞ্জ (Osmaninagar)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Osmaninagar',
        'জকিগঞ্জ',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: দক্ষিণ সুরমা (Sylhet)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Sylhet',
        'দক্ষিণ সুরমা',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Upazila: ওসমানীনগর (Zakiganj)
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        'Zakiganj',
        'ওসমানীনগর',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
        updated_at = CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Inserted % districts and % upazilas', 64, 492;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count records
SELECT 'Countries' as table_name, COUNT(*) as count FROM core.countries
UNION ALL
SELECT 'Divisions', COUNT(*) FROM core.divisions
UNION ALL
SELECT 'Districts', COUNT(*) FROM core.districts
UNION ALL
SELECT 'Upazilas', COUNT(*) FROM core.upazilas;
*/

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