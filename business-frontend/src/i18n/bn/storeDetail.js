const storeDetailBn = {
  breadcrumbs: { home: 'হোম', bazars: 'বাজারসমূহ' },
  loading: 'দোকানের বিবরণ লোড হচ্ছে...',
  verified: 'যাচাইকৃত দোকান',
  locatedIn: (place) => `📍 ${place} এ অবস্থিত`,
  tabs: { products: 'পণ্যসমূহ', about: 'সম্পর্কে', reviews: 'রিভিউ' },
  common: { all: 'সব' },
  labels: {
    products: 'পণ্য',
    premiumStore: 'প্রিমিয়াম দোকান',
    stock: 'স্টক:',
    totalProducts: 'মোট পণ্য',
    rating: 'রেটিং',
    reviews: 'রিভিউ',
    stars: 'স্টার',
    discount: 'ছাড়'
  },
  productsSection: {
    titleWithCount: (count) => `পণ্যসমূহ (${count})`
  },
  about: {
    title: (name) => `${name} সম্পর্কে`,
    productTypes: '🛍️ পণ্যের ধরন',
    stats: '📊 পরিসংখ্যান'
  },
  review: {
    heading: 'গ্রাহক রিভিউ ও মন্তব্য',
    write: 'রিভিউ লিখুন',
    cancel: 'বাতিল করুন',
    basedOn: (count) => `${count} টি রিভিউ এর ভিত্তিতে`,
    formTitle: 'আপনার রিভিউ লিখুন',
    yourName: 'আপনার নাম',
    ratingLabel: 'রেটিং দিন',
    ratingHint: 'সুনির্দিষ্ট রেটিং দিতে তারকার উপর মাউস ঘুরান',
    commentPlaceholder: 'এই দোকান সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন...',
    submit: 'রিভিউ জমা দিন'
  },
  contact: {
    title: '📞 যোগাযোগের তথ্য',
    address: 'ঠিকানা',
    phone: 'ফোন নম্বর',
    email: 'ইমেইল',
    website: 'ওয়েবসাইট'
  },
  hours: {
    title: '🕐 দোকানের সময়',
    weekdaysLabel: 'সোমবার - শুক্রবার',
    saturdayLabel: 'শনিবার',
    sundayLabel: 'রবিবার'
  },
  buttons: {
    details: 'বিস্তারিত',
    addToCart: 'ব্যাগে নিন',
    cancel: 'বাতিল করুন',
    viewCart: 'কার্ট দেখুন'
  },
  quickStats: {
    title: 'দ্রুত পরিসংখ্যান',
    products: 'পণ্য',
    rating: 'রেটিং'
  },
  tooltips: {
    addToWishlist: 'পছন্দের তালিকায় যোগ করুন'
  }
};

export default storeDetailBn;


