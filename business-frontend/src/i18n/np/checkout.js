const checkoutNp = {
  header: {
    title: '🛒 चेकआउट',
    subtitle: 'तपाईंको अर्डर पूरा गर्न तलका चरणहरू अनुसरण गर्नुहोस्'
  },
  steps: ['अर्डर विवरण', 'शिपिङ जानकारी', 'भुक्तानी', 'पुष्टिकरण'],
  order: {
    details: 'अर्डर विवरण',
    verify: 'कृपया तपाईँले अर्डर गर्नुभएको वस्तुहरू जाँच गर्नुहोस्',
    subtotal: 'उप-योग',
    delivery: 'डेलिभरी शुल्क',
    free: 'फ्री 🎉',
    total: 'जम्मा',
    goToShipping: 'शिपिङमा जानुहोस्'
  },
  shipping: {
    title: 'शिपिङ जानकारी',
    desc: 'डेलिभरीका लागि सही जानकारी दिनुहोस्',
    fullName: 'पूरा नाम *',
    email: 'इमेल *',
    phone: 'फोन नम्बर *',
    district: 'जिल्ला *',
    noDistrict: 'जिल्ला भेटिएन',
    searchDistrict: 'जिल्ला खोज्नुहोस्...',
    city: 'सहर/उपजिल्ला *',
    postal: 'पोस्टल कोड',
    address: 'पूरा ठेगाना *',
    addressPh: 'घर/फ्ल्याट नं, सडक, क्षेत्र',
    instruction: 'डेलिभरी निर्देशन (वैकल्पिक)',
    instructionPh: 'विशेष नोट: गेटमा राखिदिनु, डेलिभरी अघि कल गर्नु आदि',
    prev: 'पछाडि',
    goToPayment: 'भुक्तानीमा जानुहोस्',
    notice: '📍 ग्रामीणबजार र Grameen Delivery सेवाक्षेत्रभित्र: केही घण्टामै डेलिभरी; बाहिर (देशव्यापी): २-३ दिनभित्र',
    errors: {
      fullName: 'पूरा नाम आवश्यक छ',
      email: 'मान्य इमेल आवश्यक छ',
      phone: 'मान्य फोन नम्बर आवश्यक छ',
      address: 'ठेगाना आवश्यक छ',
      city: 'सहर आवश्यक छ',
      district: 'कृपया जिल्ला छान्नुहोस्'
    }
  },
  payment: {
    title: 'भुक्तानी विधि',
    desc: 'आफ्नो रुचिको भुक्तानी विधि छान्नुहोस्',
    info: 'भुक्तानी जानकारी',
    mobile: 'मोबाइल नम्बर *',
    cardNumber: 'कार्ड नम्बर *',
    cardHolder: 'कार्डधारकको नाम *',
    expiry: 'म्याद समाप्ति *',
    cvv: 'CVV *',
    recommended: 'सिफारिस गरिएको',
    cashSelectedTitle: '🎉 क्यास अन डेलिभरी छानिएको!',
    cashSelectedDesc: 'अर्डर आएपछि भुक्तानी गर्नुहोस्। अग्रिम आवश्यक छैन।',
    orderSummary: '💰 अर्डर सारांश',
    paymentFee: 'भुक्तानी शुल्क',
    labels: {
      mobilePh: '01XXXXXXXXX',
      cardNumberPh: '1234 5678 9012 3456',
      expiryPh: 'MM/YY',
      cvvPh: '123'
    },
    prev: 'पछाडि',
    confirm: 'अर्डर पुष्टि गर्नुहोस्',
    processing: 'अर्डर प्रोसेस हुँदै...'
  },
  sidebar: {
    orderSummary: 'अर्डर सारांश',
    moreItems: (n) => `+${n} थप वस्तुहरू...`,
    notices: {
      securePayment: 'सुरक्षित भुक्तानी',
      fastDelivery: 'छिटो डेलिभरी',
      warranty: 'गारन्टी सहित'
    }
  },
  success: {
    title: 'अर्डर सफल!',
    orderNo: (id) => `अर्डर नं: #${id}`,
    desc: 'तपाईंको अर्डर प्राप्त भयो। छिट्टै सम्पर्क गरिनेछ।',
    deliveryInfo: 'डेलिभरी जानकारी',
    track: 'अर्डर ट्र्याक गर्नुहोस्',
    home: 'होममा जानुहोस्',
    fields: {
      name: 'नाम',
      phone: 'फोन',
      address: 'ठेगाना',
      payment: 'भुक्तानी',
      total: 'जम्मा'
    }
  },
  guards: {
    cartEmpty: 'तपाईंको कार्ट खाली छ। कृपया पहिले केही वस्तुहरू थप्नुहोस्।',
    startShopping: 'किनमेल सुरु गर्नुहोस्'
  },
  paymentMethods: {
    cash: { name: 'क्यास अन डेलिभरी', desc: 'अर्डर आएपछि भुक्तानी', fee: 0 },
    bkash: { name: 'bKash', desc: 'bKash बाट भुक्तानी', fee: 0 },
    nagad: { name: 'Nagad', desc: 'Nagad बाट भुक्तानी', fee: 0 },
    rocket: { name: 'Rocket', desc: 'Rocket बाट भुक्तानी', fee: 0 },
    card: { name: 'क्रेडिट/डेबिट कार्ड', desc: 'Visa, MasterCard आदि', fee: 25 },
    bank: { name: 'बैंक ट्रान्सफर', desc: 'बैंक खातामा ट्रान्सफर', fee: 15 }
  }
};

export default checkoutNp;


