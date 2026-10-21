const customerDashboardNp = {
  hero: {
    welcome: (name) => `स्वागत छ, ${name}!`,
    subtitle: 'तपाईंको ड्यासबोर्ड। थप किनमेलका लागि सम्बन्धित प्रोडक्ट पेज हेर्नुहोस्'
  },
  stats: {
    totalOrders: 'कुल अर्डर',
    totalSpent: 'कुल खर्च',
    points: 'प्वाइन्ट्स',
    nextReward: 'अर्को रिवार्ड'
  },
  labels: {
    memberSinceSuffix: 'देखी सदस्य',
    order: 'अर्डर',
    itemsSuffix: 'वस्तु',
    phone: 'फोन:',
    default: 'डिफल्ट',
    home: 'घर',
    office: 'अफिस',
    expires: 'म्याद समाप्त',
    store: 'स्टोर:',
    orderNumber: 'अर्डर नं:',
    orderDate: 'अर्डर मिति:',
    totalItems: 'जम्मा वस्तु:',
    totalAmount: 'जम्मा रकम:'
  },
  sidebar: {
    title: 'ड्यासबोर्ड मेनु',
    orders: 'मेरो अर्डर',
    wishlist: 'इच्छा-सूची',
    addresses: 'ठेगानाहरू',
    payments: 'भुक्तानी विधिहरू',
    editProfile: 'प्रोफाइल सम्पादन'
  },
  orders: {
    header: 'मेरो अर्डर',
    subheader: 'तपाईंका सबै अर्डर र तिनको स्थिति हेर्नुहोस्',
    support: 'कस्टमर सपोर्ट',
    status: {
      delivered: 'डेलिभरी भयो',
      shipped: 'शिप गरियो',
      processing: 'प्रोसेसिङ',
      pending: 'पेन्डिङ'
    },
    tracking: 'ट्र्याकिङ',
    viewDetails: 'विवरण हेर्नुहोस्',
    emptyTitle: 'अहिलेसम्म कुनै अर्डर छैन',
    emptySubtitle: 'तपाईंले अहिलेसम्म अर्डर गर्नुभएको छैन। किनमेल सुरु गर्नुहोस्!',
    startShopping: 'किनमेल सुरु गर्नुहोस्'
  },
  wishlist: {
    header: 'मेरो इच्छा-सूची',
    subheader: 'पछि किन्नका लागि सुरक्षित गरिएका वस्तु',
    emptyTitle: 'तपाईंको इच्छा-सूची खाली छ',
    emptySubtitle: 'पछि किन्नका लागि वस्तुहरू इच्छा-सूचीमा थप्नुहोस्।',
    viewProducts: 'वस्तुहरू हेर्नुहोस्',
    addToCart: 'कार्टमा राख्नुहोस्',
    view: 'हेर्नुहोस्'
  },
  addresses: {
    header: 'मेरो ठेगानाहरू',
    subheader: 'डेलिभरीका लागि सुरक्षित ठेगाना',
    addNew: 'नयाँ ठेगाना थप्नुहोस्',
    edit: 'सम्पादन',
    delete: 'मेटाउनुहोस्'
  },
  payments: {
    header: 'भुक्तानी विधिहरू',
    subheader: 'तपाईंका सुरक्षित भुक्तानी विधिहरू',
    addNew: 'नयाँ भुक्तानी विधि थप्नुहोस्'
  },
  recommended: {
    header: 'तपाईंका लागि सिफारिस',
    subheader: 'तपाईंको रोजाइअनुसार चयन गरिएका वस्तु',
    product: (n) => `सिफारिस गरिएको वस्तु ${n}`,
    storeName: 'स्टोरको नाम'
  },
  dialogs: {
    address: {
      title: 'नयाँ ठेगाना थप्नुहोस्',
      type: 'ठेगानाको प्रकार',
      types: { home: 'घर', office: 'अफिस' },
      detail: 'पूरा ठेगाना',
      phone: 'फोन नम्बर',
      cancel: 'रद्द',
      save: 'सेभ'
    },
    payment: {
      title: 'नयाँ भुक्तानी विधि थप्नुहोस्',
      type: 'भुक्तानी प्रकार',
      types: { card: 'क्रेडिट कार्ड', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
      numberCard: 'कार्ड नम्बर',
      numberAccount: 'खाता नम्बर',
      expiry: 'म्याद (MM/YY)',
      cancel: 'रद्द',
      save: 'सेभ'
    },
    order: {
      title: 'अर्डर विवरण',
      orderId: (id) => `अर्डर आइडी: #${id}`,
      orderInfo: 'अर्डर जानकारी',
      deliveryInfo: 'डेलिभरी जानकारी',
      status: 'स्थिति:',
      tracking: 'ट्र्याक गर्नुहोस्',
      trackingNote: 'थप जानकारीका लागि ट्र्याकिङ बटन थिच्नुहोस्',
      summary: 'अर्डर सारांश',
      close: 'बन्द गर्नुहोस्'
    }
  }
};

export default customerDashboardNp;


