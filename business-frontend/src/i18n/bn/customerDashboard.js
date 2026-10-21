const customerDashboardBn = {
  hero: {
    welcome: (name) => `স্বাগতম, ${name}!`,
    subtitle: 'আপনার ড্যাশবোর্ড, আরো কিছু কিনতে রিলেটেড প্রডাক্ট পেজ ভিজিট করুন'
  },
  stats: {
    totalOrders: 'মোট অর্ডার',
    totalSpent: 'মোট খরচ',
    points: 'পয়েন্ট',
    nextReward: 'পরবর্তী রিওয়ার্ড'
  },
  labels: {
    memberSinceSuffix: 'থেকে সদস্য',
    order: 'অর্ডার',
    itemsSuffix: 'টি পণ্য',
    phone: 'ফোন:',
    default: 'ডিফল্ট',
    home: 'বাসা',
    office: 'অফিস',
    expires: 'মেয়াদ শেষ',
    store: 'দোকান:',
    orderNumber: 'অর্ডার নম্বর:',
    orderDate: 'অর্ডারের তারিখ:',
    totalItems: 'মোট পণ্য:',
    totalAmount: 'মোট পরিমাণ:'
  },
  sidebar: {
    title: 'ড্যাশবোর্ড মেনু',
    orders: 'আমার অর্ডার',
    wishlist: 'ইচ্ছেতালিকা',
    addresses: 'ঠিকানাসমূহ',
    payments: 'পেমেন্ট পদ্ধতি',
    editProfile: 'প্রোফাইল সম্পাদনা'
  },
  orders: {
    header: 'আমার অর্ডার',
    subheader: 'আপনার সকল অর্ডারের তালিকা এবং অবস্থা দেখুন',
    support: 'কাস্টমার সাপোর্ট',
    status: {
      delivered: 'ডেলিভারি হয়েছে',
      shipped: 'শিপ করা হয়েছে',
      processing: 'প্রক্রিয়াধীন',
      pending: 'অপেক্ষমান'
    },
    tracking: 'ট্র্যাকিং',
    viewDetails: 'বিস্তারিত দেখুন',
    emptyTitle: 'এখনো কোনো অর্ডার নেই',
    emptySubtitle: 'আপনি এখনো কোনো অর্ডার করেননি। কেনাকাটা শুরু করুন!',
    startShopping: 'কেনাকাটা শুরু করুন'
  },
  wishlist: {
    header: 'আমার ইচ্ছেতালিকা',
    subheader: 'পরে কেনার জন্য সংরক্ষিত পণ্যসমূহ',
    emptyTitle: 'আপনার ইচ্ছেতালিকা খালি',
    emptySubtitle: 'পরে কেনার জন্য পণ্য ইচ্ছেতালিকায় যোগ করুন।',
    viewProducts: 'পণ্য দেখুন',
    addToCart: 'কার্টে যোগ করুন',
    view: 'দেখুন'
  },
  addresses: {
    header: 'আমার ঠিকানাসমূহ',
    subheader: 'ডেলিভারির জন্য সংরক্ষিত ঠিকানা',
    addNew: 'নতুন ঠিকানা যোগ করুন',
    edit: 'সম্পাদনা',
    delete: 'মুছুন'
  },
  payments: {
    header: 'পেমেন্ট পদ্ধতি',
    subheader: 'আপনার সংরক্ষিত পেমেন্ট পদ্ধতিসমূহ',
    addNew: 'নতুন পেমেন্ট পদ্ধতি যোগ করুন'
  },
  recommended: {
    header: 'আপনার জন্য সুপারিশকৃত',
    subheader: 'আপনার পছন্দ অনুযায়ী বিশেষভাবে নির্বাচিত পণ্য',
    product: (n) => `সুপারিশকৃত পণ্য ${n}`,
    storeName: 'দোকানের নাম'
  },
  dialogs: {
    address: {
      title: 'নতুন ঠিকানা যোগ করুন',
      type: 'ঠিকানার ধরন',
      types: { home: 'বাসা', office: 'অফিস' },
      detail: 'বিস্তারিত ঠিকানা',
      phone: 'ফোন নম্বর',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ করুন'
    },
    payment: {
      title: 'নতুন পেমেন্ট পদ্ধতি যোগ করুন',
      type: 'পেমেন্ট পদ্ধতির ধরন',
      types: { card: 'ক্রেডিট কার্ড', bkash: 'বিকাশ', nagad: 'নগদ', rocket: 'রকেট' },
      numberCard: 'কার্ড নম্বর',
      numberAccount: 'অ্যাকাউন্ট নম্বর',
      expiry: 'মেয়াদ শেষ (MM/YY)',
      cancel: 'বাতিল',
      save: 'সংরক্ষণ করুন'
    },
    order: {
      title: 'অর্ডার বিস্তারিত',
      orderId: (id) => `অর্ডার আইডি: #${id}`,
      orderInfo: 'অর্ডার তথ্য',
      deliveryInfo: 'ডেলিভারি তথ্য',
      status: 'অবস্থা:',
      tracking: 'ট্র্যাকিং করুন',
      trackingNote: 'আরো বিস্তারিত তথ্যের জন্য ট্র্যাকিং বাটনে ক্লিক করুন',
      summary: 'অর্ডার সারাংশ',
      close: 'বন্ধ করুন'
    }
  }
};

export default customerDashboardBn;


