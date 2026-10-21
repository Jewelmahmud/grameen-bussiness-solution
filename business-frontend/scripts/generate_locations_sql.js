const fs = require('fs');
const path = require('path');

// Read both Bengali and English location files
const locationsBn = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/json/locations_bn.json'), 'utf8')
);

const locationsEn = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/json/locations_en.json'), 'utf8')
);

// Division name mapping (Bengali to English and code)
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

// Helper function to find English name by matching structure
function findEnglishName(bnName, bnArray, enArray, level = 'upazila') {
  // Try to find by index first (assuming same order)
  if (bnArray && enArray && bnArray.length === enArray.length) {
    const index = bnArray.findIndex(item => {
      if (level === 'upazila') {
        const name = typeof item === 'string' ? item : item.নাম;
        return name === bnName || name.replace(/\s*উপজেলা\s*$/, '') === bnName.replace(/\s*উপজেলা\s*$/, '');
      } else if (level === 'district') {
        return item.নাম === bnName;
      }
      return false;
    });
    
    if (index !== -1 && enArray[index]) {
      if (level === 'upazila') {
        const enItem = enArray[index];
        if (typeof enItem === 'string') {
          return enItem.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        } else if (enItem.name) {
          return enItem.name.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        }
      } else if (level === 'district') {
        return enArray[index].name || enArray[index];
      }
    }
  }
  
  // Fallback: transliterate common patterns
  const transliterationMap = {
    'সদর': 'Sadar',
    'উপজেলা': '',
    'থানা': 'Thana'
  };
  
  let transliterated = bnName;
  for (const [bn, en] of Object.entries(transliterationMap)) {
    transliterated = transliterated.replace(new RegExp(bn, 'g'), en).trim();
  }
  
  // If no match found, return transliterated version (will be improved)
  return transliterated || bnName;
}

let sql = `-- ============================================
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

`;

// Generate division inserts
const divisionsBn = locationsBn.বিভাগ || [];
const divisionsEn = locationsEn.divisions || [];

divisionsBn.forEach((divisionBn, divIndex) => {
  const divNameBn = divisionBn.নাম;
  const divInfo = divisionMap[divNameBn] || { en: divNameBn, code: `DIV${divIndex + 1}` };
  
  // Find corresponding English division
  const divEn = divisionsEn.find(d => 
    d.name === divInfo.en || 
    (divInfo.en === 'Barisal' && d.name === 'Barishal') ||
    (divInfo.en === 'Chittagong' && d.name === 'Chattogram')
  );
  
  const divNameEn = divEn ? divEn.name : divInfo.en;
  
  sql += `INSERT INTO core.divisions (division_uuid, country_uuid, name, name_bn, code, is_active)
SELECT 
    gen_random_uuid(), 
    country_uuid, 
    '${divNameEn}', 
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
    v_district_counter INTEGER := 0;
    v_upazila_counter INTEGER := 0;
BEGIN
    -- Get Bangladesh UUID
    SELECT country_uuid INTO v_country_uuid FROM core.countries WHERE code = 'BGD';
    
`;

// Generate districts and upazilas
let districtCounter = 0;
let upazilaCounter = 0;

divisionsBn.forEach((divisionBn, divIndex) => {
  const divNameBn = divisionBn.নাম;
  const divInfo = divisionMap[divNameBn] || { en: divNameBn, code: `DIV${divIndex + 1}` };
  
  // Find corresponding English division
  const divEn = divisionsEn.find(d => 
    d.name === divInfo.en || 
    (divInfo.en === 'Barisal' && d.name === 'Barishal') ||
    (divInfo.en === 'Chittagong' && d.name === 'Chattogram')
  );
  
  sql += `    -- ============================================
    -- Division: ${divNameBn} (${divInfo.en})
    -- ============================================
    SELECT division_uuid INTO v_division_uuid FROM core.divisions WHERE code = '${divInfo.code}';
    
`;
  
  const districtsBn = divisionBn.জেলা || [];
  const districtsEn = divEn ? (divEn.districts || []) : [];
  
  districtsBn.forEach((districtBn, distIndex) => {
    districtCounter++;
    const distNameBn = districtBn.নাম;
    const distNameBnEscaped = distNameBn.replace(/'/g, "''");
    
    // Find corresponding English district - try by index first, then by name matching
    let distEn = null;
    if (districtsEn[distIndex]) {
      distEn = districtsEn[distIndex];
    } else {
      // Try to find by matching name patterns
      distEn = districtsEn.find(d => {
        if (typeof d === 'object' && d.name) {
          const enName = d.name.toLowerCase();
          // Common name mappings
          const nameMap = {
            'বাগেরহাট': ['bagerhat', 'bagherhat'],
            'চুয়াডাঙ্গা': ['chuadanga', 'chuadanga'],
            'যশোর': ['jessore', 'jashore'],
            'ঝিনাইদহ': ['jhenaidah', 'jhenaidah'],
            'খুলনা': ['khulna'],
            'কুষ্টিয়া': ['kushtia', 'kushtia'],
            'মাগুরা': ['magura'],
            'মেহেরপুর': ['meherpur'],
            'নড়াইল': ['narail', 'narayal'],
            'সাতক্ষীরা': ['satkhira', 'satkhira']
          };
          const possibleNames = nameMap[distNameBn] || [];
          return possibleNames.some(n => enName.includes(n));
        }
        return false;
      });
    }
    
    let distNameEn = '';
    if (distEn) {
      distNameEn = typeof distEn === 'string' ? distEn : (distEn.name || '');
    }
    
    // If no match, use transliteration mapping
    if (!distNameEn) {
      const districtTransMap = {
        'বাগেরহাট': 'Bagerhat',
        'চুয়াডাঙ্গা': 'Chuadanga',
        'যশোর': 'Jessore',
        'ঝিনাইদহ': 'Jhenaidah',
        'খুলনা': 'Khulna',
        'কুষ্টিয়া': 'Kushtia',
        'মাগুরা': 'Magura',
        'মেহেরপুর': 'Meherpur',
        'নড়াইল': 'Narail',
        'সাতক্ষীরা': 'Satkhira',
        'ঢাকা': 'Dhaka',
        'গাজীপুর': 'Gazipur',
        'নারায়ণগঞ্জ': 'Narayanganj',
        'টাঙ্গাইল': 'Tangail',
        'কিশোরগঞ্জ': 'Kishoreganj',
        'মানিকগঞ্জ': 'Manikganj',
        'মুন্সীগঞ্জ': 'Munshiganj',
        'রাজবাড়ী': 'Rajbari',
        'শরীয়তপুর': 'Shariatpur',
        'ফরিদপুর': 'Faridpur',
        'গোপালগঞ্জ': 'Gopalganj',
        'মাদারীপুর': 'Madaripur',
        'চট্টগ্রাম': 'Chittagong',
        'কক্সবাজার': 'Cox\'s Bazar',
        'রাঙ্গামাটি': 'Rangamati',
        'বান্দরবান': 'Bandarban',
        'খাগড়াছড়ি': 'Khagrachhari',
        'ফেনী': 'Feni',
        'লক্ষ্মীপুর': 'Lakshmipur',
        'নোয়াখালী': 'Noakhali',
        'কুমিল্লা': 'Comilla',
        'ব্রাহ্মণবাড়িয়া': 'Brahmanbaria',
        'চাঁদপুর': 'Chandpur',
        'সিলেট': 'Sylhet',
        'মৌলভীবাজার': 'Moulvibazar',
        'হবিগঞ্জ': 'Habiganj',
        'সুনামগঞ্জ': 'Sunamganj',
        'রাজশাহী': 'Rajshahi',
        'বগুড়া': 'Bogra',
        'জয়পুরহাট': 'Joypurhat',
        'নওগাঁ': 'Naogaon',
        'নাটোর': 'Natore',
        'চাঁপাইনবাবগঞ্জ': 'Chapainawabganj',
        'পাবনা': 'Pabna',
        'সিরাজগঞ্জ': 'Sirajganj',
        'রংপুর': 'Rangpur',
        'দিনাজপুর': 'Dinajpur',
        'গাইবান্ধা': 'Gaibandha',
        'কুড়িগ্রাম': 'Kurigram',
        'লালমনিরহাট': 'Lalmonirhat',
        'নীলফামারী': 'Nilphamari',
        'পঞ্চগড়': 'Panchagarh',
        'ঠাকুরগাঁও': 'Thakurgaon',
        'বরিশাল': 'Barisal',
        'ভোলা': 'Bhola',
        'ঝালকাঠি': 'Jhalokathi',
        'পটুয়াখালী': 'Patuakhali',
        'পিরোজপুর': 'Pirojpur',
        'বরগুনা': 'Barguna',
        'ময়মনসিংহ': 'Mymensingh',
        'জামালপুর': 'Jamalpur',
        'নেত্রকোণা': 'Netrokona',
        'শেরপুর': 'Sherpur'
      };
      distNameEn = districtTransMap[distNameBn] || distNameBn;
    }
    
    const distNameEnEscaped = distNameEn.replace(/'/g, "''");
    
    sql += `    -- District: ${distNameBn} (${distNameEn})
    INSERT INTO core.districts (district_uuid, division_uuid, name, name_bn, code, is_active)
    VALUES (
        gen_random_uuid(),
        v_division_uuid,
        '${distNameEnEscaped}',
        '${distNameBnEscaped}',
        '${divInfo.code}-${String(distIndex + 1).padStart(2, '0')}',
        true
    )
    ON CONFLICT (division_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        code = EXCLUDED.code,
        updated_at = CURRENT_TIMESTAMP
    RETURNING district_uuid INTO v_district_uuid;
    
`;
    
    const upazilasBn = districtBn.উপজেলা || [];
    const upazilasEn = distEn ? (distEn.upazilas || []) : [];
    
    upazilasBn.forEach((upazilaBn, upaIndex) => {
      upazilaCounter++;
      let upazilaNameBn = '';
      
      // Handle both string and object formats
      if (typeof upazilaBn === 'string') {
        upazilaNameBn = upazilaBn;
      } else if (upazilaBn.নাম) {
        upazilaNameBn = upazilaBn.নাম;
      }
      
      // Clean up the name (remove "উপজেলা" suffix if present)
      upazilaNameBn = upazilaNameBn.replace(/\s*উপজেলা\s*$/, '').trim();
      
      // Find corresponding English upazila - try by index first
      let upazilaNameEn = '';
      if (upazilasEn[upaIndex]) {
        const upaEn = upazilasEn[upaIndex];
        if (typeof upaEn === 'string') {
          upazilaNameEn = upaEn.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        } else if (upaEn.name) {
          upazilaNameEn = upaEn.name.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        }
      }
      
      // If no match, transliterate from Bengali
      if (!upazilaNameEn) {
        // Remove "উপজেলা" suffix
        let cleanBn = upazilaNameBn.replace(/\s*উপজেলা\s*$/g, '').trim();
        
        // Handle "সদর" (Sadar)
        if (cleanBn.includes('সদর')) {
          const baseName = cleanBn.replace(/\s*সদর\s*/g, '').trim();
          upazilaNameEn = baseName ? `${baseName} Sadar` : 'Sadar';
        } else {
          // Common transliterations for upazilas
          const upazilaTransMap = {
            'সাভার': 'Savar',
            'গুলশান': 'Gulshan',
            'ধানমন্ডি': 'Dhanmondi',
            'উত্তরা': 'Uttara',
            'কেরানীগঞ্জ': 'Keraniganj',
            'দোহার': 'Dohar',
            'কচুয়া': 'Kachua',
            'চিতলমারী': 'Chitalmari',
            'ফকিরহাট': 'Fakirhat',
            'মোংলা': 'Mongla',
            'মোড়েলগঞ্জ': 'Morelganj',
            'মোল্লাহাট': 'Mollahat',
            'রামপাল': 'Rampal',
            'শরণখোলা': 'Sharonkhola'
          };
          
          // Try direct mapping first
          upazilaNameEn = upazilaTransMap[cleanBn];
          
          // If not found, try to transliterate common patterns
          if (!upazilaNameEn) {
            // Simple transliteration - keep original if no match
            // In production, you might want to use a proper transliteration library
            upazilaNameEn = cleanBn;
          }
        }
      }
      
      // Escape single quotes
      const upazilaNameBnEscaped = upazilaNameBn.replace(/'/g, "''");
      const upazilaNameEnEscaped = upazilaNameEn.replace(/'/g, "''");
      
      // Determine if it's a thana (metropolitan area) or upazila
      const isThana = upazilaNameBn.includes('সদর') || 
                      upazilaNameBn.includes('থানা') ||
                      upazilaNameBn.includes('মহানগর');
      const upazilaType = isThana ? 'thana' : 'upazila';
      
      sql += `    -- Upazila: ${upazilaNameBn} (${upazilaNameEn})
    INSERT INTO core.upazilas (upazila_uuid, district_uuid, name, name_bn, upazila_type, is_active)
    VALUES (
        gen_random_uuid(),
        v_district_uuid,
        '${upazilaNameEnEscaped}',
        '${upazilaNameBnEscaped}',
        '${upazilaType}',
        true
    )
    ON CONFLICT (district_uuid, name) DO UPDATE SET 
        name_bn = EXCLUDED.name_bn,
        upazila_type = EXCLUDED.upazila_type,
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

// Write to file with proper UTF-8 encoding (BOM for better compatibility)
const BOM = '\uFEFF';
fs.writeFileSync(
  path.join(__dirname, 'insert_locations_complete.sql'),
  BOM + sql,
  { encoding: 'utf8' }
);

console.log(`✅ Generated SQL file with:
- 1 Country (Bangladesh)
- ${divisionsBn.length} Divisions
- ${districtCounter} Districts
- ${upazilaCounter} Upazilas
`);
console.log('📄 File saved as: insert_locations_complete.sql');
console.log('✅ English names in "name" field, Bengali names in "name_bn" field');
console.log('\n📋 Next step: Copy the SQL content and add it to schema.sql after the table creation section.');

