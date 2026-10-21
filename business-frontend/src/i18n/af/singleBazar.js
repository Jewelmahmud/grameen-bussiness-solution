const singleBazarAf = {
  backTo: (title) => `بیرته ${title} ته`,
  badges: {
    discount: (percent) => `${percent}% تخفیف`
  },
  reviews: 'تبصرې',
  availability: {
    inStock: 'په ذخیره کې'
  },
  storeLabel: 'پلورنځی',
  addToCart: 'په کڅوړه کې اضافه کړئ',
  delivery: 'لېږد: په 24 ساعتونو کې',
  guarantee: '100% اصلي محصول تضمین',
  tabs: {
    description: 'تفصیل',
    specs: 'مشخصات'
  },
  sections: {
    productDescription: 'د محصول تفصیل',
    productSpecs: 'د محصول مشخصات'
  },
  table: {
    category: 'کټګوري',
    store: 'پلورنځی',
    stockStatus: 'د ذخیرې حالت'
  },
  description: (name) => `دا د زموږ د باور وړ عرضه کوونکو څخه یو لوړ کیفیت ${name} دی.`
};

export default singleBazarAf;
