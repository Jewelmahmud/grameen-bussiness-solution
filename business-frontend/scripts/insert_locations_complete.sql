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

