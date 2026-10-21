// Bengali numeral conversion utility

// Convert Bengali digits to English digits for calculations
export const convertBengaliToEnglish = (str) => {
  if (!str) return str;
  
  // Convert Bengali digits to English using the provided function
  const converted = str.toString().replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d));
  return converted;
};

// Convert English digits to Bengali digits for display
export const convertEnglishToBengali = (str) => {
  if (!str) return str;
  
  const converted = str.toString().replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
  return converted;
};

// Extract numeric value from price string for calculations
export const parsePrice = (price) => {
  
  if (price === null || price === undefined || price === '') {
    return 0;
  }
  
  if (typeof price === 'number' && !isNaN(price)) {
    return price;
  }
  
  if (typeof price === 'string') {
    // Convert Bengali digits to English for calculation
    let cleanPrice = convertBengaliToEnglish(price);
    
    // Remove currency symbols and whitespace
    cleanPrice = cleanPrice.replace(/[৳$,\s]/g, '').trim();
    
    if (cleanPrice === '' || cleanPrice === 'undefined' || cleanPrice === 'null') {
      return 0;
    }
    
    const numPrice = parseFloat(cleanPrice);
    if (isNaN(numPrice)) {
      console.warn('Failed to parse price:', cleanPrice, 'from original:', price);
      return 0;
    }
    
    return numPrice;
  }
  
  const parsed = parseFloat(price);
  return isNaN(parsed) ? 0 : parsed;
};

// Format price for display (keeping Bengali digits)
export const formatPriceForDisplay = (price, showCurrency = true) => {
  const numPrice = parsePrice(price);
  const formatted = Math.round(numPrice).toLocaleString('en-US');
  
  if (showCurrency) {
    return `৳${formatted}`;
  }
  return formatted;
};

// Format price with Bengali digits for display
export const formatPriceWithBengaliDigits = (price, showCurrency = true) => {
  const numPrice = parsePrice(price);
  const formatted = Math.round(numPrice).toString();
  const bengaliFormatted = convertEnglishToBengali(formatted);
  
  if (showCurrency) {
    return `৳${bengaliFormatted}`;
  }
  return bengaliFormatted;
};

// Test function to verify Bengali numeral conversion
export const testBengaliNumerals = () => {
  const testCases = [
    '৳১৮০.০০',
    '৳৬৫.০০', 
    '৳৩৫.০০',
    '৭৫.০০',
    '২৫.০০',
    '৪৫.০০',
    '১২০.০০',
    '৩০.০০',
    '১৫০.০০'
  ];
  
  console.log('=== Bengali Numeral Test ===');
  testCases.forEach(testCase => {
    const parsed = parsePrice(testCase);
    const displayFormat = formatPriceForDisplay(testCase);
    const bengaliFormat = formatPriceWithBengaliDigits(testCase);
    
    console.log(`Testing: ${testCase}`);
    console.log(`  - Parsed for calculation: ${parsed}`);
    console.log(`  - Display format (English): ${displayFormat}`);
    console.log(`  - Display format (Bengali): ${bengaliFormat}`);
    console.log('---');
  });
}; 