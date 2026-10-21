const bazarDetailAf = {
  loading: 'د بازار تفصیلات بار کول...',
  hero: {
    rating: 'درجه بندي',
    established: 'تاسیس شوی',
    shops: 'پلورنځي',
    dailyVisitors: 'ورځني لیدونکي',
    size: 'اندازه'
  },
  specialties: {
    title: 'تخصصونه',
    buyHere: 'په دې بازار کې پیرود وکړئ'
  },
  tabs: {
    overview: 'نظره',
    stores: 'پلورنځي',
    reviews: 'بیاکتنې'
  },
  overview: {
    aboutSuffix: ' په اړه',
    details: 'تفصيلي تشریح',
    contact: 'د اړیکې معلومات',
    address: 'پته',
    phone: 'تلیفون',
    email: 'بریښنالیک',
    openingHours: 'د خلاصیدو ساعتونه',
    location: 'ځای',
    mapLoading: 'نقشه بار کول...',
    rating: 'درجه بندي'
  },
  sidebarInfo: {
    title: 'د بازار معلومات',
    established: 'تاسیس شوی',
    weeklyHoliday: 'د اونۍ رخصتي',
    size: 'د بازار اندازه',
    rating: 'درجه بندي'
  },
  facilities: {
    title: 'تاسیسات',
    parkingYes: 'پارک',
    parkingNo: 'هیڅ پارک نشته',
    atmYes: 'ATM',
    atmNo: 'هیڅ ATM نشته',
    wheelchairYes: 'د ویلچر لپاره مناسب',
    wheelchairNo: 'د ویلچر لپاره مناسب نه دی'
  },
  stores: {
    title: (name) => `په ${name} کې پلورنځي`,
    categoryPrefix: 'کتګوري: ',
    viewStore: 'پلورنځی وګورئ'
  },
  reviews: {
    title: 'د پیرودونکو بیاکتنې',
    loadMore: 'نور بیاکتنې بار کړئ',
    summaryTitle: 'د درجه بندي لنډیز',
    basedOn: (count) => `د ${count} بیاکتنو پر بنسټ`,
    helpful: (n) => `مرسته کوونکی (${n})`,
    reply: 'ځواب'
  },
  writeReview: {
    title: 'بیاکتنه ولیکئ',
    subtitle: 'خپله تجربه له نورو سره شریکه کړئ',
    button: 'بیاکتنه ولیکئ'
  },
  dialog: {
    title: 'بیاکتنه ولیکئ',
    subtitle: (name) => `خپل نظرونه د ${name} په اړه شریکه کړئ`,
    guestToggle: 'د مهم په توګه بیاکتنه',
    nameLabel: 'ستاسو نوم',
    namePh: 'خپل نوم ولیکئ',
    emailLabel: 'بریښنالیک (اختیاري)',
    emailPh: 'خپل بریښنالیک پته ولیکئ',
    ratingLabel: 'درجه بندي ورکړئ',
    commentLabel: 'ستاسو تبصره',
    commentPh: 'خپله تجربه د دې بازار په اړه شریکه کړئ...',
    helper: 'ستاسو به بیاکتنه نورو ته مرسته کوي چې غوره فیصلې وکړي',
    cancel: 'لغوه کول',
    submit: 'بیاکتنه سپارل',
    successSubmit: 'ستاسو بیاکتنه په بریالیتوب سره سپارل شوې!',
    validation: {
      commentRequired: 'مهرباني وکړئ خپله تبصره ولیکئ.',
      nameRequired: 'مهرباني وکړئ خپل نوم ولیکئ.'
    }
  },
  cart: {
    added: (name) => `${name} کارټ ته اضافه شو!`
  },
  locationDialog: {
    title: 'مبارک شه!',
    selected: 'ستاسو بازار غوره شوی دی',
    instruction1: 'دا ستاسو د اوسني بازار په توګه تنظیم شوی دی.',
    instruction2: 'له لاندې هغه کتګوري غوره کړئ چې تاسو یې له هغه پیرود کول غواړئ:',
    categoryPrompt: 'تاسو څه پیرود کول غواړئ؟',
    bottomNotePrefix: 'دا محصولات به له هغه ځایه راشي',
    bottomNoteSuffix: '',
    close: 'شاید وروسته'
  }
};

export default bazarDetailAf;
