const customerDashboardAf = {
  hero: {
    welcome: (name) => `ښه راغلاست، ${name}!`,
    subtitle: 'ستاسو ډاشبورډ. د نورو توکو د پلورلو لپاره د اړونده محصولاتو پاڼې وګورئ'
  },
  stats: {
    totalOrders: 'ټول امرونه',
    totalSpent: 'ټول مصرف شوی',
    points: 'نقطې',
    nextReward: 'راتلونکی انعام'
  },
  labels: {
    memberSinceSuffix: 'له هغه وخته غړی',
    order: 'امر',
    itemsSuffix: 'توکي',
    phone: 'تلیفون:',
    default: 'ډیفالټ',
    home: 'کور',
    office: 'دفتر',
    expires: 'منځه ځي',
    store: 'پلورنځی:',
    orderNumber: 'د امر شمیره:',
    orderDate: 'د امر نیټه:',
    totalItems: 'ټول توکي:',
    totalAmount: 'ټول مقدار:'
  },
  sidebar: {
    title: 'د ډاشبورډ مینو',
    orders: 'زما امرونه',
    wishlist: 'د خوښې لیست',
    addresses: 'پتې',
    payments: 'د تادیه کولو طریقې',
    editProfile: 'پروفایل سم کول'
  },
  orders: {
    header: 'زما امرونه',
    subheader: 'د ټولو امرونو د لیست او حالت وګورئ',
    support: 'د پیرودونکو ملاتړ',
    status: {
      delivered: 'رسول شوی',
      shipped: 'لېږل شوی',
      processing: 'په پروسه کې',
      pending: 'په تمه کې'
    },
    tracking: 'تعقیب',
    viewDetails: 'تفصیلات وګورئ',
    emptyTitle: 'تر اوسه هیڅ امرونه نشته',
    emptySubtitle: 'تاسو تر اوسه هیڅ امرونه نه دی کړي. پلورل پیل کړئ!',
    startShopping: 'پلورل پیل کړئ'
  },
  wishlist: {
    header: 'زما د خوښې لیست',
    subheader: 'د وروسته د پلورلو لپاره خوندي شوي توکي',
    emptyTitle: 'ستاسو د خوښې لیست تش دی',
    emptySubtitle: 'د خپل د خوښې لیست ته محصولات اضافه کړئ ترڅو وروسته یې وپلورئ.',
    viewProducts: 'محصولات وګورئ',
    addToCart: 'په کڅوړه کې اضافه کړئ',
    view: 'وګورئ'
  },
  addresses: {
    header: 'زما پتې',
    subheader: 'د رسولو لپاره خوندي شوي پتې',
    addNew: 'نوې پته اضافه کړئ',
    edit: 'سم کول',
    delete: 'ړنګول'
  },
  payments: {
    header: 'د تادیه کولو طریقې',
    subheader: 'ستاسو خوندي شوي د تادیه کولو طریقې',
    addNew: 'نوې د تادیه کولو طریقه اضافه کړئ'
  },
  recommended: {
    header: 'ستاسو لپاره منل شوی',
    subheader: 'د ستاسو د غوره توبونو پر بنسټ ځانګړي چمتو شوي محصولات',
    product: (n) => `منل شوی محصول ${n}`,
    storeName: 'د پلورنځي نوم'
  },
  dialogs: {
    address: {
      title: 'نوې پته اضافه کړئ',
      type: 'د پتې ډول',
      types: { home: 'کور', office: 'دفتر' },
      detail: 'بشپړه پته',
      phone: 'د تلیفون شمیره',
      cancel: 'لغوه کول',
      save: 'خوندي کول'
    },
    payment: {
      title: 'نوې د تادیه کولو طریقه اضافه کړئ',
      type: 'د تادیه کولو ډول',
      types: { card: 'کریډیټ کارت', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
      numberCard: 'د کارت شمیره',
      numberAccount: 'د حساب شمیره',
      expiry: 'د منځه تللو (میاشت/کال)',
      cancel: 'لغوه کول',
      save: 'خوندي کول'
    },
    order: {
      title: 'د امر تفصیلات',
      orderId: (id) => `د امر ID: #${id}`,
      orderInfo: 'د امر معلومات',
      deliveryInfo: 'د رسولو معلومات',
      status: 'حالت:',
      tracking: 'تعقیب',
      trackingNote: 'د نورو تفصیلاتو لپاره تعقیب کلیک کړئ',
      summary: 'د امر لنډیز',
      close: 'تړل'
    }
  }
};

export default customerDashboardAf;
