const storeDetailAf = {
  breadcrumbs: { home: 'کور', bazars: 'بازارونه' },
  loading: 'د پلورنځي تفصیلات بار کول...',
  verified: 'تصدیق شوی پلورنځی',
  locatedIn: (place) => `📍 په ${place} کې موقعیت لري`,
  tabs: { products: 'محصولات', about: 'د اړه', reviews: 'تبصرې' },
  common: { all: 'ټول' },
  labels: {
    products: 'محصولات',
    premiumStore: 'د لوړ کیفیت پلورنځی',
    stock: 'ذخیره:',
    totalProducts: 'د محصولاتو مجموعه',
    rating: 'درجه بندي',
    reviews: 'تبصرې',
    stars: 'ستوري',
    discount: 'تخفیف'
  },
  productsSection: {
    titleWithCount: (count) => `محصولات (${count})`
  },
  about: {
    title: (name) => `د ${name} په اړه`,
    productTypes: '🛍️ د محصولاتو ډولونه',
    stats: '📊 احصائیه'
  },
  review: {
    heading: 'د پیرودونکو تبصرې او تبصرې',
    write: 'یوه تبصره ولیکئ',
    cancel: 'لغوه کړئ',
    basedOn: (count) => `د ${count} تبصرو پر بنسټ`,
    formTitle: 'خپله تبصره ولیکئ',
    yourName: 'ستاسو نوم',
    ratingLabel: 'یوه درجه بندي ورکړئ',
    ratingHint: 'د دقیق درجه بندي لپاره د ستورو په اوږه کې ځیر شئ',
    commentPlaceholder: 'د دې پلورنځي په اړه خپله تجربه شریک کړئ...',
    submit: 'تبصره وسپارئ'
  },
  contact: {
    title: '📞 د اړیکې معلومات',
    address: 'پته',
    phone: 'تلیفون',
    email: 'بریښنالیک',
    website: 'ویب پاڼه'
  },
  hours: {
    title: '🕐 د پلورنځي ساعتونه',
    weekdaysLabel: 'دوشنبه - جمعه',
    saturdayLabel: 'شنبه',
    sundayLabel: 'یکشنبه'
  },
  buttons: {
    details: 'تفصیلات',
    addToCart: 'په کڅوړه کې اضافه کړئ',
    cancel: 'لغوه کړئ',
    viewCart: 'کڅوړه وګورئ'
  },
  quickStats: {
    title: 'ژر احصائیه',
    products: 'محصولات',
    rating: 'درجه بندي'
  },
  tooltips: {
    addToWishlist: 'په لیست کې اضافه کړئ'
  }
};

export default storeDetailAf;
