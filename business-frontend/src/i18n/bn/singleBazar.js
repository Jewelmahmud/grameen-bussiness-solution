const singleBazarBn = {
  backTo: (title) => `${title} এ ফিরে যান`,
  badges: {
    discount: (percent) => `${percent}% ছাড়`
  },
  reviews: 'রিভিউ',
  availability: {
    inStock: 'স্টকে আছে'
  },
  storeLabel: 'দোকান',
  addToCart: 'কার্টে যোগ করুন',
  delivery: 'ডেলিভারি: ২৪ ঘন্টার মধ্যে',
  guarantee: '১০০% অরিজিনাল পণ্যের গ্যারান্টি',
  tabs: {
    description: 'বিবরণ',
    specs: 'স্পেসিফিকেশন'
  },
  sections: {
    productDescription: 'পণ্যের বিবরণ',
    productSpecs: 'পণ্যের স্পেসিফিকেশন'
  },
  table: {
    category: 'ক্যাটেগরি',
    store: 'দোকান',
    stockStatus: 'স্টক স্ট্যাটাস'
  },
  description: (name) => `এটি একটি উচ্চ মানের ${name} যা আমাদের বিশ্বস্ত সরবরাহকারীদের কাছ থেকে সংগ্রহ করা হয়েছে।`
};

export default singleBazarBn;


