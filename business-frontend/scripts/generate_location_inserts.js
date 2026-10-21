const fs = require('fs');
const path = require('path');

// Read the locations JSON file
const locationsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/json/locations_bn.json'), 'utf8')
);

// Division name mapping (Bengali to English)
const divisionMap = {
  'খুলনা': { en: 'Khulna', code: 'KHU' },
  'ঢাকা': { en: 'Dhaka', code: 'DHA' },
  'চট্টগ্রাম': { en: 'Chittagong', code: 'CTG' },
  'রাজশাহী': { en: 'Rajshahi', code: 'RAJ' },
  'বরিশাল': { en: 'Barisal', code: 'BAR' },
  'সিলেট': { en: 'Sylhet', code: 'SYL' },
  'রংপুর': { en: 'Rangpur', code: 'RAN' },
  'ময়মনসিংহ': { en: 'Mymensingh', code: 'MYM' }
};

// Generate SQL file
let sql = `-- ============================================
-- INSERT LOCATIONS DATA FROM locations_bn.json
-- Generated automatically from locations_bn.json
-- ============================================

-- First, ensure we have the country (Bangladesh)
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

`;

// Generate division inserts
const divisions = locationsData.বিভাগ || [];
divisions.forEach((division, divIndex) => {
  const divNameBn = division.নাম;
  const divInfo = divisionMap[divNameBn] || { en: divNameBn, code: `DIV${divIndex + 1}` };
  
  sql += `-- Division: ${divNameBn} (${divInfo.en})
INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    '${divInfo.en}', 
    '${divNameBn}', 
    '${divInfo.code}', 
    true
FROM core.countries WHERE code = 'BGD'
ON CONFLICT (country_uuid, name) DO UPDATE SET 
    name_bn = EXCLUDED.name_bn,
    code = EXCLUDED.code,
    updated_at = CURRENT_TIMESTAMP;

`;
});

sql += `-- ============================================
-- INSERT DISTRICTS AND UPAZILAS
-- ============================================

DO $$
DECLARE
    v_country_uuid UUID;
    v_division_uuid UUID;
    v_district_uuid UUID;
    v_upazila_uuid UUID;
BEGIN
    -- Get Bangladesh UUID
    SELECT country_uuid INTO v_country_uuid FROM core.countries WHERE code = 'BGD';
    
`;

// Generate districts and upazilas
let districtCounter = 0;
let upazilaCounter = 0;

divisions.forEach((division, divIndex) => {
  const divNameBn = division.নাম;
  const divInfo = divisionMap[divNameBn] || { en: divNameBn, code: `DIV${divIndex + 1}` };
  
  sql += `    -- ============================================
    -- Division: ${divNameBn} (${divInfo.en})
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = '${divInfo.code}';
    
`;
  
  const districts = division.জেলা || [];
  districts.forEach((district, distIndex) => {
    districtCounter++;
    const distNameBn = district.নাম;
    const distNameEn = distNameBn; // You may want to add English names mapping
    
    sql += `    -- District: ${distNameBn}
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        '${distNameEn}',
        '${distNameBn}',
        '${divInfo.code}-${String(distIndex + 1).padStart(2, '0')}',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
`;
    
    const upazilas = district.উপজেলা || [];
    upazilas.forEach((upazila, upaIndex) => {
      upazilaCounter++;
      let upazilaNameBn = '';
      let upazilaNameEn = '';
      
      // Handle both string and object formats
      if (typeof upazila === 'string') {
        upazilaNameBn = upazila;
        upazilaNameEn = upazila;
      } else if (upazila.নাম) {
        upazilaNameBn = upazila.নাম;
        upazilaNameEn = upazila.নাম;
      }
      
      // Clean up the name (remove "উপজেলা" suffix if present)
      upazilaNameBn = upazilaNameBn.replace(/\s*উপজেলা\s*$/, '').trim();
      upazilaNameEn = upazilaNameEn.replace(/\s*উপজেলা\s*$/, '').trim();
      
      sql += `    -- Upazila: ${upazilaNameBn}
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        '${upazilaNameEn}',
        '${upazilaNameBn}',
        'upazila',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        updated_at = CURRENT_TIMESTAMP;
    
`;
    });
  });
});

sql += `    RAISE NOTICE 'Inserted % districts and % upazilas', ${districtCounter}, ${upazilaCounter};
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

`;

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'insert_locations_complete.sql'),
  sql,
  'utf8'
);

console.log(`✅ Generated SQL file with:
- 1 Country (Bangladesh)
- ${divisions.length} Divisions
- ${districtCounter} Districts
- ${upazilaCounter} Upazilas
`);
console.log('📄 File saved as: insert_locations_complete.sql');

