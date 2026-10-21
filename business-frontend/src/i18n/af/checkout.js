const checkoutAf = {
  header: {
    title: '🛒 تادیه',
    subtitle: 'د خپل امر د بشپړولو لپاره لاندې ګامونه تعقیب کړئ'
  },
  steps: ['د امر تفصیلات', 'د لېږد معلومات', 'تادیه', 'تصدیق'],
  order: {
    details: 'د امر تفصیلات',
    verify: 'مهرباني وکړئ هغه توکي بیاکتنه کړئ چې تاسو یې امر کړي دي',
    subtotal: 'فرعي مجموعه',
    delivery: 'د لېږد چارج',
    free: 'وړیا 🎉',
    total: 'مجموعه',
    goToShipping: 'د لېږد ته تلل'
  },
  shipping: {
    title: 'د لېږد معلومات',
    desc: 'د لېږد لپاره دقیق معلومات ورکړئ',
    fullName: 'بشپړ نوم *',
    email: 'بریښنالیک *',
    phone: 'د تلیفون شمیره *',
    district: 'ولایت *',
    noDistrict: 'هیڅ ولایت و نه موندل شو',
    searchDistrict: 'ولایت ولټوئ...',
    city: 'ښار/وړاندیز *',
    postal: 'د پوستې کوډ',
    address: 'بشپړ پته *',
    addressPh: 'کور/فلت شمیره، سړک، ساحه',
    instruction: 'د لېږد لارښوونې (اختیاري)',
    instructionPh: 'ځانګړي یادښتونه لکه: په دروازه کې پرېږدئ، د لېږد دمخه تلیفون وکړئ',
    prev: 'شاته',
    goToPayment: 'د تادیې ته تلل',
    notice: '📍 د ګرامین بازار او ګرامین لېږد د خدمت ساحو دننه: په ساعتونو کې لېږد؛ بهر (ملکی): په 2-3 ورځو کې',
    errors: {
      fullName: 'بشپړ نوم اړین دی',
      email: 'معتبر بریښنالیک اړین دی',
      phone: 'د بنګله دېش معتبر تلیفون شمیره اړینه ده',
      address: 'پته اړینه ده',
      city: 'ښار اړین دی',
      district: 'مهرباني وکړئ ولایت غوره کړئ'
    }
  },
  payment: {
    title: 'د تادیې طریقه',
    desc: 'خپله غوره تادیې طریقه غوره کړئ',
    info: 'د تادیې معلومات',
    mobile: 'د موبایل شمیره *',
    cardNumber: 'د کارت شمیره *',
    cardHolder: 'د کارت د لرونکي نوم *',
    expiry: 'د پای نیټه *',
    cvv: 'CVV *',
    recommended: 'سړیر شوی',
    cashSelectedTitle: '🎉 د لېږد په وخت کې پیسې غوره شوي!',
    cashSelectedDesc: 'کله چې امر راشي نو تادیه وکړئ. هیڅ مخکې تادیه نه ده اړینه.',
    orderSummary: '💰 د امر لنډیز',
    paymentFee: 'د تادیې فیس',
    labels: {
      mobilePh: '01XXXXXXXXX',
      cardNumberPh: '1234 5678 9012 3456',
      expiryPh: 'MM/YY',
      cvvPh: '123'
    },
    prev: 'شاته',
    confirm: 'امر تصدیق کول',
    processing: 'امر په پروسه کې دی...'
  },
  sidebar: {
    orderSummary: 'د امر لنډیز',
    moreItems: (n) => `+${n} نور توکي...`,
    notices: {
      securePayment: 'سالم تادیه',
      fastDelivery: 'ګړندي لېږد',
      warranty: 'د تضمین سره'
    }
  },
  success: {
    title: 'امر بریالی شو!',
    orderNo: (id) => `د امر شمیره: #${id}`,
    desc: 'ستاسو امر ترلاسه شوی دی. موږ به ژر تاسو سره اړیکه ونیسو.',
    deliveryInfo: 'د لېږد معلومات',
    track: 'امر تعقیب کول',
    home: 'کور ته تلل',
    fields: {
      name: 'نوم',
      phone: 'تلیفون',
      address: 'پته',
      payment: 'تادیه',
      total: 'مجموعه'
    }
  },
  guards: {
    cartEmpty: 'ستاسو کڅوړه تشه ده. مهرباني وکړئ لومړی ځینې توکي اضافه کړئ.',
    startShopping: 'د پیرود پیل'
  },
  paymentMethods: {
    cash: { name: 'د لېږد په وخت کې پیسې', desc: 'کله چې ستاسو امر راشي نو تادیه وکړئ', fee: 0 },
    bkash: { name: 'bKash', desc: 'د bKash سره تادیه', fee: 0 },
    nagad: { name: 'Nagad', desc: 'د Nagad سره تادیه', fee: 0 },
    rocket: { name: 'Rocket', desc: 'د Rocket سره تادیه', fee: 0 },
    card: { name: 'د کریډیټ/ډیبټ کارت', desc: 'Visa، MasterCard او نور', fee: 25 },
    bank: { name: 'د بانک تحویل', desc: 'د بانک حساب ته تحویل', fee: 15 }
  }
};

export default checkoutAf;
