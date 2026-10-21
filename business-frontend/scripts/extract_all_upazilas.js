const fs = require('fs');
const path = require('path');

// Read the Bengali locations file which has complete data
const locationsBn = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/json/locations_bn.json'), { encoding: 'utf8' })
);

// Read the English locations file for English names
const locationsEn = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src/json/locations_en.json'), { encoding: 'utf8' })
);

// Division name mapping
const divisionMap = {
  'খুলনা': 'Khulna',
  'ঢাকা': 'Dhaka',
  'চট্টগ্রাম': 'Chittagong',
  'রাজশাহী': 'Rajshahi',
  'বরিশাল': 'Barisal',
  'সিলেট': 'Sylhet',
  'রংপুর': 'Rangpur',
  'ময়মনসিংহ': 'Mymensingh'
};

// District name mapping (Bengali to English)
const districtNameMap = {
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
  'শেরপুর': 'Sherpur',
  'নরসিংদী': 'Narsingdi'
};

// Result structure: { "District Name": ["Upazila1", "Upazila2", ...] }
const result = {};

// Process Bengali locations data
const divisionsBn = locationsBn.বিভাগ || [];
const divisionsEn = locationsEn.divisions || [];

divisionsBn.forEach((divisionBn, divIndex) => {
  const divNameBn = divisionBn.নাম;
  const divNameEn = divisionMap[divNameBn] || divNameBn;
  
  // Find corresponding English division
  const divEn = divisionsEn.find(d => 
    d.name === divNameEn || 
    (divNameEn === 'Barisal' && d.name === 'Barishal') ||
    (divNameEn === 'Chittagong' && d.name === 'Chattogram')
  );
  
  const districtsBn = divisionBn.জেলা || [];
  const districtsEn = divEn ? (divEn.districts || []) : [];
  
  districtsBn.forEach((districtBn, distIndex) => {
    const distNameBn = districtBn.নাম;
    
    // Get English district name
    let distNameEn = districtNameMap[distNameBn];
    if (!distNameEn && districtsEn[distIndex]) {
      const distEn = districtsEn[distIndex];
      distNameEn = typeof distEn === 'string' ? distEn : (distEn.name || '');
    }
    if (!distNameEn) {
      distNameEn = distNameBn; // Fallback to Bengali if no English name found
    }
    
    // Initialize district if not exists
    if (!result[distNameEn]) {
      result[distNameEn] = [];
    }
    
    // Process upazilas
    const upazilasBn = districtBn.উপজেলা || [];
    const upazilasEn = districtsEn[distIndex] ? (districtsEn[distIndex].upazilas || []) : [];
    
    upazilasBn.forEach((upazilaBn, upaIndex) => {
      let upazilaNameBn = '';
      
      // Handle both string and object formats
      if (typeof upazilaBn === 'string') {
        upazilaNameBn = upazilaBn;
      } else if (upazilaBn.নাম) {
        upazilaNameBn = upazilaBn.নাম;
      }
      
      // Clean up the name (remove "উপজেলা" suffix if present)
      upazilaNameBn = upazilaNameBn.replace(/\s*উপজেলা\s*$/, '').trim();
      
      // Find corresponding English upazila name
      let upazilaNameEn = '';
      if (upazilasEn[upaIndex]) {
        const upaEn = upazilasEn[upaIndex];
        if (typeof upaEn === 'string') {
          upazilaNameEn = upaEn.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        } else if (upaEn.name) {
          upazilaNameEn = upaEn.name.replace(/\s*Sadar\s*$/i, '').replace(/\s*-S\s*$/i, '').trim();
        }
      }
      
      // If no English name found, use transliteration
      if (!upazilaNameEn) {
        // Handle "সদর" (Sadar)
        if (upazilaNameBn.includes('সদর')) {
          const baseName = upazilaNameBn.replace(/\s*সদর\s*/g, '').trim();
          upazilaNameEn = baseName ? `${baseName} Sadar` : 'Sadar';
        } else {
          // Common transliterations
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
          upazilaNameEn = upazilaTransMap[upazilaNameBn] || upazilaNameBn;
        }
      }
      
      // Add to result (avoid duplicates)
      if (!result[distNameEn].includes(upazilaNameEn)) {
        result[distNameEn].push(upazilaNameEn);
      }
    });
  });
});

// Sort upazilas within each district
Object.keys(result).forEach(district => {
  result[district].sort();
});

// Write to JSON file
const outputPath = path.join(__dirname, 'src/json/upazilas_by_district.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(result, null, 2),
  { encoding: 'utf8' }
);

// Count totals
let totalUpazilas = 0;
Object.keys(result).forEach(district => {
  totalUpazilas += result[district].length;
});

console.log(`✅ Created JSON file with ${Object.keys(result).length} districts and ${totalUpazilas} upazilas`);
console.log(`📄 File saved as: ${outputPath}`);
console.log('\n📊 Summary by district (first 20):');
Object.keys(result).sort().slice(0, 20).forEach(district => {
  console.log(`  - ${district}: ${result[district].length} upazilas`);
});
if (Object.keys(result).length > 20) {
  console.log(`  ... and ${Object.keys(result).length - 20} more districts`);
}


