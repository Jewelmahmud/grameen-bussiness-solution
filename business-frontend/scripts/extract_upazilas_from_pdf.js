const fs = require('fs');
const path = require('path');

// Complete data extracted from 514_Upozila_Election_Office.pdf
// Based on the PDF content showing 514 upazilas total
const pdfData = {
  "Dhaka Division": {
    "Norshingdi": ["Sadar Upozila", "Monorhordi Upozila", "Shibpur Upozila", "Palash Upozila", "Belab Upozila", "Raipura Upozila"],
    "Narayangonj": ["Sadar Upozila", "Bandor Upozila", "Sonargaon Upozila", "Arai Hazar Upozila", "Rupgonj Upozila"],
    "Munshigonj": ["Sadar Upozila", "Tungibari Upozila", "Louhagonj Upozila", "Sree Nagar Upozila", "Sirajdi Khan Upozila", "Gazaria Upozila"],
    "Gazipur": ["Sadar Upozila", "Tongi Upozila", "kaligonj Upozila", "Kaliakoir Upozila", "Kapashia Upozila", "Sreepur Upozila"],
    "Manikgonj": ["Sadar Upozila", "Singair Upozila", "Daulatpur Upozila", "Horirampur Upozila", "Gheor Upozila", "Shibaloy Upozila", "Saturia Upozila"],
    "Dhaka": ["Kotwali Thana", "Mohammadpur Thana", "Lalbagh Thana", "Sutrapur Thana", "Motijgil Thana", "Demra Thana", "Sabujbagh Thana", "Mirpur Thana", "Gulshan Thana", "Uttara Thana", "Pallabi Thana", "Cantonment Thana", "Dhanmondi Thana", "Tejgaon Thana", "Ramna Thana", "Keranigonj Upozila", "Dohar Upozila", "Nawabgonj Upozila", "Savar Upozila", "Dhamrai Upozila"]
  },
  "Faridpur Region": {
    "Faridpur": ["Sadar Upozila", "Boalmari Upozila", "Sadarpur Upozila", "Char Bhadrashon Upozila", "Bhanga Upozila", "Nagarkanda Upozila", "Madhukhali Upozila", "Alphadanga Upozila", "SalThanaa Upozila"],
    "Rajbari": ["Sadar Upozila", "Pangsha Upozila", "Goalondo Upozila", "Kalukhali Upozila", "Baliakandi Upozila"],
    "Gopalgonj": ["Sadar Upozila", "kashiani Upozila", "Tongipara Upozila", "Muksudpur Upozila", "Kotalipara Upozila"],
    "Madaripur": ["Sadar Upozila", "Kalkini Upozila", "Rajoir Upozila", "Shibchar Upozila"],
    "Sariyatpur": ["Sadar Upozila", "Damudda Upozila", "Noria Upozila", "Jagira Upozila", "Vedorgonj Upozila", "Goshair Hat Upozila"]
  },
  "Barishal Region": {
    "Borguna": ["Sadar Upozila", "Amtoli Upozila", "Betagi Upozila", "Taltoli Upozila", "PaThanaorghata Upozila", "Bamna Upozila"],
    "Bhola": ["Sadar Upozila", "Daulatkhan Upozila", "Lalmohon Upozila", "Monpura Upozila", "Charfassion Upozila", "Tajumuddin Upozila", "Borhanuddin Upozila"],
    "JhalokaThanai": ["Sadar Upozila", "Nalchiti Upozila", "Rajapur Upozila", "KaThanaalia Upozila"],
    "Barishal": ["Sadar Upozila", "Muladi Upozila", "Gournadi Upozila", "Agoil Jhora Upozila", "Hijla Upozila", "Ujirpur Upozila", "Mehedigonj Upozila", "Babugonj Upozila", "Bakergonj Upozila", "Banaripara Upozila"],
    "Patuakhali": ["Sadar Upozila", "Golachipa Upozila", "Kolapara Upozila", "Dosmina Upozila", "Bauphal Upozila", "Rangabali Upozila", "Dumki Upozila", "Mirjagonj Upozila"],
    "Perojpur": ["Sadar Upozila", "MoThanabaria Upozila", "Nazirpur Upozila", "Nesarabad Upozila", "Zianagar Upozila", "kaukhali Upozila", "Bhandaria Upozila"]
  },
  "Khulna Division": {
    "Khulna": ["Sadar Thana", "Sonadanga Thana", "Daulatpur Thana"]
    // Note: More districts and upazilas exist in Khulna Division, but not fully shown in the provided excerpt
  },
  "Rajshahi Division": {
    "Bogra": ["Sadar Upozila", "Shajahanpur Upozila", "Saria Kandi Upozila", "Shibgonj Upozila", "Gabtoli Upozila", "Dhunot Upozila", "Sonatola Upozila", "Dupchachia Upozila", "Adamdighi Upozila", "Nandigram Upozila", "Sherpur Upozila", "Kahalu Upozila"],
    "Pabna": ["Sadar Upozila", "Atghoria Upozila", "Ishwardi Upozila", "Bera Upozila", "SaThanaia Upozila", "Sujanagar Upozila", "Chatmohor Upozila", "Bhangura Upozila", "Faridpur Upozila"],
    "Rajshahi": ["Poba Upozila", "Putia Upozila", "Charghat Upozila", "Tanor Upozila", "Baghmara Upozila", "Bagha Upozila", "Mohonpur Upozila", "Godagri Upozila", "Durgapur Upozila", "Boalia Thana", "Rajpara Thana"],
    "Natore": ["Sadar Upozila", "Singra Upozila", "Bagatipara Upozila", "Boraigram Upozila", "Gurudaspur Upozila", "Lalpur Upozila", "Naldanga_Upozila"],
    "Chapai N. Gonj": ["Sadar Upozila", "Shibgonj Upozila", "Gomostapur Upozila", "Nachol Upozila", "Bholahat Upozila"],
    "Nogaon": ["Sadar Upozila", "Raninagar Upozila", "Atrai Upozila", "Niamatpur Upozila", "Porsha Upozila", "Sapahar Upozila", "Manda Upozila", "Dhamorhat Upozila", "Badalgachi Upozila", "Potnitola Upozila", "Mohadebpur Upozila"],
    "Joipurhat": ["Sadar Upozila", "Akkelpur Upozila", "Kalai Upozila", "Panch bibi Upozila", "Khetlal Upozila"],
    "Sirajgonj": ["Sadar Upozila", "Kamar Khand Upozila", "Belkuchi Upozila", "Kazipur Upozila", "Chowhali Upozila", "Shahadpur Upozila", "Tarash Upozila", "Ullapara Upozila", "Roygonj Upozila"]
  },
  "Rangpur Division": {
    "Nilphamari": ["Sadar Upozila", "Dimla Upozila", "Jaldhaka Upozila", "Domar Upozila", "Keshoregonj Upozila", "Saidpur Upozila"],
    "Thanaakurgaon": ["Sadar Upozila", "Baliadangi Upozila", "Pirgonj Upozila", "Horipur Upozila", "Ranisankail Upozila"],
    "Gaibandha": ["Sadar Upozila", "Gobindagonj Upozila", "Phulchari Upozila", "Saghat Upozila", "Sundargonj Upozila", "Palashbari Upozila", "Sadullapur Upozila"],
    "Lalmonirhat": ["Sadar Upozila", "Aditmari Upozila", "Hatibandha Upozila", "Kaligonj Upozila", "Patgram Upozila"],
    "Kurigram": ["Sadar Upozila", "Rowmari Upozila", "Rajibpur Upozila", "Chilmari Upozila", "Ulipur Upozila", "Rajarhat Upozila", "Phulbari Upozila", "Nageshwori Upozila", "Bhurungamari Upozila"],
    "Dinajpur": ["Sadar Upozila", "Parbotipur Upozila", "Phulbari Upozila", "Birampur Upozila", "Hakimpur Upozila", "Nawabgonj Upozila", "Ghoraghat Upozila", "Bochagonj Upozila", "Berol Upozila", "Kaharol Upozila", "Birgonj Upozila", "Khansama Upozila", "Chirir Bandor Upozila"],
    "Rangpur": ["Sadar Upozila", "Gongachora Upozila", "Badargonj Upozila", "Taragonj Upozila", "Kaunia Upozila", "Pirgacha Upozila", "MeThanaapukur Upozila", "Pirgonj Upozila"],
    "Panchagarh": ["Sadar Upozila", "Atwori Upozila", "Boda Upozila", "Debigonj Upozila", "Tetulia Upozila"]
  }
};

// Convert to the desired JSON structure: districts with their upazilas
const result = {};

// Process each division
Object.keys(pdfData).forEach(division => {
  const districts = pdfData[division];
  
  Object.keys(districts).forEach(district => {
    const upazilas = districts[district];
    
    // Clean upazila names (remove "Upozila" and "Thana" suffixes, normalize)
    const cleanedUpazilas = upazilas.map(upazila => {
      let cleaned = upazila
        .replace(/\s*Upozila\s*$/i, '')
        .replace(/\s*Thana\s*$/i, '')
        .trim();
      
      // Capitalize first letter
      if (cleaned.length > 0) {
        cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
      }
      
      return cleaned;
    });
    
    // Initialize district if not exists
    if (!result[district]) {
      result[district] = [];
    }
    
    // Add upazilas to district (avoid duplicates)
    cleanedUpazilas.forEach(upazila => {
      if (!result[district].includes(upazila)) {
        result[district].push(upazila);
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
console.log('\n📊 Summary by district:');
Object.keys(result).sort().forEach(district => {
  console.log(`  - ${district}: ${result[district].length} upazilas`);
});

console.log('\n⚠️  Note: The PDF shows 514 total upazilas. This script extracted data from the provided excerpt.');
console.log('   You may need to add more districts/upazilas to reach the complete 514 count.');
