const bazarDetailBn = {
  loading: 'বাজারের বিবরণ লোড হচ্ছে...',
  hero: {
    rating: 'রেটিং',
    established: 'প্রতিষ্ঠিত',
    shops: 'দোকান',
    dailyVisitors: 'দৈনিক দর্শক',
    size: 'আকার'
  },
  specialties: {
    title: 'বিশেষত্ব',
    buyHere: 'এই বাজারে কেনাকাটা করুন'
  },
  tabs: {
    overview: 'সংক্ষিপ্ত বিবরণ',
    stores: 'দোকানসমূহ',
    reviews: 'রিভিউ'
  },
  overview: {
    aboutSuffix: ' সম্পর্কে',
    details: 'বিস্তারিত বিবরণ',
    contact: 'যোগাযোগের তথ্য',
    address: 'ঠিকানা',
    phone: 'ফোন',
    email: 'ইমেইল',
    openingHours: 'খোলার সময়',
    location: 'অবস্থান',
    mapLoading: 'মানচিত্র লোড হচ্ছে...',
    rating: 'রেটিং'
  },
  sidebarInfo: {
    title: 'বাজারের তথ্য',
    established: 'প্রতিষ্ঠিত',
    weeklyHoliday: 'সাপ্তাহিক বন্ধ',
    size: 'বাজারের আকার',
    rating: 'রেটিং'
  },
  facilities: {
    title: 'সুবিধাসমূহ',
    parkingYes: 'পার্কিং',
    parkingNo: 'পার্কিং নেই',
    atmYes: 'ATM',
    atmNo: 'ATM নেই',
    wheelchairYes: 'হুইলচেয়ার প্রবেশযোগ্য',
    wheelchairNo: 'হুইলচেয়ার প্রবেশযোগ্য নয়'
  },
  stores: {
    title: (name) => `${name} এর দোকানসমূহ`,
    categoryPrefix: 'ক্যাটাগরি: ',
    viewStore: 'দোকান দেখুন'
  },
  reviews: {
    title: 'গ্রাহক রিভিউ',
    loadMore: 'আরও রিভিউ দেখুন',
    summaryTitle: 'রেটিং সারাংশ',
    basedOn: (count) => `${count}টি রিভিউর ভিত্তিতে`,
    helpful: (n) => `সহায়ক (${n})`,
    reply: 'উত্তর দিন'
  },
  writeReview: {
    title: 'রিভিউ লিখুন',
    subtitle: 'আপনার অভিজ্ঞতা অন্যদের সাথে শেয়ার করুন',
    button: 'রিভিউ লিখুন'
  },
  dialog: {
    title: 'রিভিউ লিখুন',
    subtitle: (name) => `${name} সম্পর্কে আপনার মতামত দিন`,
    guestToggle: 'গেস্ট হিসেবে রিভিউ করুন',
    nameLabel: 'আপনার নাম',
    namePh: 'আপনার নাম লিখুন',
    emailLabel: 'ইমেইল (ঐচ্ছিক)',
    emailPh: 'আপনার ইমেইল ঠিকানা',
    ratingLabel: 'রেটিং দিন',
    commentLabel: 'আপনার মতামত',
    commentPh: 'এই বাজার সম্পর্কে আপনার অভিজ্ঞতা শেয়ার করুন...',
    helper: 'আপনার রিভিউ অন্যদের সাহায্য করবে সঠিক সিদ্ধান্ত নিতে',
    cancel: 'বাতিল',
    submit: 'রিভিউ জমা দিন',
    successSubmit: 'আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে!',
    validation: {
      commentRequired: 'দয়া করে আপনার মতামত লিখুন।',
      nameRequired: 'দয়া করে আপনার নাম লিখুন।'
    }
  },
  cart: {
    added: (name) => `${name} কার্টে যোগ করা হয়েছে!`
  },
  locationDialog: {
    title: 'অভিনন্দন!',
    selected: 'আপনার  বাজার সিলেক্ট হয়েছে',
    instruction1: 'এখন আপনার বর্তমান বাজার হিসেবে নির্বাচিত হয়েছে।',
    instruction2: 'আপনি যে ধরনের পণ্য কিনতে চান, নিচে থেকে সেই ক্যাটাগরি নির্বাচন করুন:',
    categoryPrompt: 'আপনি কি কেনাকাটা করতে চান?',
    bottomNotePrefix: 'এই পণ্যগুলি',
    bottomNoteSuffix: 'থেকে সংগ্রহ করা হবে',
    close: 'পরে দেখব'
  }
};

export default bazarDetailBn;


