-- ============================================
-- Database Initialization Script
-- This script runs automatically when PostgreSQL container starts
-- ============================================

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'Asia/Dhaka';

-- Create a function to check if schema exists
CREATE OR REPLACE FUNCTION schema_exists(p_schema_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.schemata s
        WHERE s.schema_name = p_schema_name
    );
END;
$$ LANGUAGE plpgsql;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization started at %', NOW();
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
END $$;

