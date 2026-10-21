const storeDetailSl = {
  breadcrumbs: { home: 'මුල් පිටුව', bazars: 'බසාර්' },
  loading: 'සාප්පු විස්තර පැටවෙමින්...',
  verified: 'තහවුරු කළ සාප්පු',
  locatedIn: (place) => `📍 ${place} තුළ පිහිටා ඇත`,
  tabs: { products: 'නිෂ්පාදන', about: 'පිළිබඳව', reviews: 'විචාර' },
  common: { all: 'සියල්ල' },
  labels: {
    products: 'නිෂ්පාදන',
    premiumStore: 'ප්‍රමිඛ සාප්පු',
    stock: 'තොග:',
    totalProducts: 'මුළු නිෂ්පාදන',
    rating: 'ඇගැයුම',
    reviews: 'විචාර',
    stars: 'ස්ටාර්',
    discount: 'කඩාවැට්'
  },
  productsSection: { titleWithCount: (count) => `නිෂ්පාදන (${count})` },
  about: { title: (name) => `${name} ගැන`, productTypes: '🛍️ නිෂ්පාදන වර්ග', stats: '📊 සංඛ්‍යාත්මක තොරතුරු' },
  review: {
    heading: 'පාරිභෝගික විචාර හා අදහස්',
    write: 'විචාරයක් ලියන්න',
    cancel: 'අවලංගු',
    basedOn: (count) => `${count} විචාර මත`,
    formTitle: 'ඔබගේ විචාරය ලියන්න',
    yourName: 'ඔබගේ නාමය',
    ratingLabel: 'ඇගැයුම දෙන්න',
    ratingHint: 'නිවැරදි ඇගැයුමක් සඳහා ස්ටාර් මත හවර කරන්න',
    commentPlaceholder: 'මේ සාප්පුව පිළිබඳ ඔබගේ අත්දැකීම බෙදා ගන්න...',
    submit: 'සැපයුම් කරන්න'
  },
  contact: { title: '📞 සම්බන්ධතා තොරතුරු', address: 'ලිපිනය', phone: 'දුරකථන', email: 'ඊමේල්', website: 'වෙබ් අඩවිය' },
  hours: { title: '🕐 සාප්පු වේලාවන්', weekdaysLabel: 'සඳුදා - සිකුරාදා', saturdayLabel: 'සෙනසුරාදා', sundayLabel: 'ඉරිදා' },
  buttons: { details: 'විස්තර', addToCart: 'බෑගයට', cancel: 'අවලංගු', viewCart: 'බෑගය බලන්න' },
  quickStats: { title: 'ඉක්මන් සංඛ්‍යානය', products: 'නිෂ්පාදන', rating: 'ඇගැයුම' },
  tooltips: { addToWishlist: 'අකැමති ලැයිස්තුවට එකතු කරන්න' }
};

export default storeDetailSl;


