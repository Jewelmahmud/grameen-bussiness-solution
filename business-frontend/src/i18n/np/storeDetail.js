const storeDetailNp = {
  breadcrumbs: { home: 'होम', bazars: 'बजारहरू' },
  loading: 'स्टोर विवरण लोड हुँदैछ...',
  verified: 'प्रमाणित स्टोर',
  locatedIn: (place) => `📍 ${place} मा अवस्थित`,
  tabs: { products: 'वस्तुहरू', about: 'बारेमा', reviews: 'समीक्षा' },
  common: { all: 'सबै' },
  labels: {
    products: 'वस्तु',
    premiumStore: 'प्रिमियम स्टोर',
    stock: 'स्टक:',
    totalProducts: 'कुल वस्तु',
    rating: 'रेटिङ',
    reviews: 'समीक्षा',
    stars: 'ताराहरू',
    discount: 'छुट'
  },
  productsSection: {
    titleWithCount: (count) => `वस्तुहरू (${count})`
  },
  about: {
    title: (name) => `${name} बारेमा`,
    productTypes: '🛍️ वस्तुका प्रकार',
    stats: '📊 तथ्याङ्क'
  },
  review: {
    heading: 'ग्राहक समीक्षा र टिप्पणी',
    write: 'समीक्षा लेख्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    basedOn: (count) => `${count} समीक्षाको आधारमा`,
    formTitle: 'आफ्नो समीक्षा लेख्नुहोस्',
    yourName: 'तपाईंको नाम',
    ratingLabel: 'रेटिङ दिनुहोस्',
    ratingHint: 'सटीक रेटिङका लागि तारा माथि होभर गर्नुहोस्',
    commentPlaceholder: 'यो स्टोरबारे आफ्नो अनुभव साझेदारी गर्नुहोस्...',
    submit: 'समीक्षा पठाउनुहोस्'
  },
  contact: {
    title: '📞 सम्पर्क जानकारी',
    address: 'ठेगाना',
    phone: 'फोन',
    email: 'इमेल',
    website: 'वेबसाइट'
  },
  hours: {
    title: '🕐 स्टोर समय',
    weekdaysLabel: 'सोमबार - शुक्रबार',
    saturdayLabel: 'शनिबार',
    sundayLabel: 'आइतबार'
  },
  buttons: {
    details: 'विवरण',
    addToCart: 'ब्यागमा हाल्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    viewCart: 'कार्ट हेर्नुहोस्'
  },
  quickStats: {
    title: 'छिटो तथ्याङ्क',
    products: 'वस्तु',
    rating: 'रेटिङ'
  },
  tooltips: {
    addToWishlist: 'इच्छा-सूचीमा थप्नुहोस्'
  }
};

export default storeDetailNp;


