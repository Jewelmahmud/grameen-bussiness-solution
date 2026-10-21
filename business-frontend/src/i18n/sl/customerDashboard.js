const customerDashboardSl = {
  hero: {
    welcome: (name) => `සාදරයෙන් පිළිගනිමු, ${name}!`,
    subtitle: 'ඔබගේ ඩැෂ්බෝර්ඩය. තවත් මිලදී ගැනීමට අදාල නිෂ්පාදන පිටු වෙත පිවිසෙන්න'
  },
  stats: {
    totalOrders: 'මුළු ඇණවුම්',
    totalSpent: 'මුළු වියදම',
    points: 'ලකුණු',
    nextReward: 'ඊළඟ සම්මානය'
  },
  labels: {
    memberSinceSuffix: 'සිට සාමාජිකයි',
    order: 'ඇණවුම',
    itemsSuffix: 'අයිතම',
    phone: 'දුරකථන:',
    default: 'පෙරනිමිය',
    home: 'නිවස',
    office: ' කාර්යාලය',
    expires: 'කල් ඉකුත් වන දිනය',
    store: 'සාප්පුව:',
    orderNumber: 'ඇණවුම් අංකය:',
    orderDate: 'දිනය:',
    totalItems: 'මුළු අයිතම:',
    totalAmount: 'මුළු මුදල:'
  },
  sidebar: {
    title: 'ඩැෂ්බෝර්ඩ මෙනුව',
    orders: 'මගේ ඇණවුම්',
    wishlist: 'අකැමති ලැයිස්තුව',
    addresses: 'ලිපින',
    payments: 'ගෙවීම් ක්‍රම',
    editProfile: 'පැතිකඩ සංස්කරණය'
  },
  orders: {
    header: 'මගේ ඇණවුම්',
    subheader: 'ඔබගේ සියලු ඇණවුම් ලැයිස්තුව සහ තත්ත්වය බලන්න',
    support: 'පාරිභෝගික සහාය',
    status: {
      delivered: 'බැරෑරුමක්',
      shipped: 'කල් මාරු',
      processing: 'සැකසෙමින්',
      pending: 'බලාපොරොත්තුවෙන්'
    },
    tracking: 'ට්‍රැකින්',
    viewDetails: 'විස්තර බලන්න',
    emptyTitle: 'තවම ඇණවුම් නැත',
    emptySubtitle: 'ඔබ තවම කිසිදු ඇණවුමක් කර නොමැත. මිලදී ගැනීම අරඹන්න!',
    startShopping: 'මිලදී ගැනීම අරඹන්න'
  },
  wishlist: {
    header: 'මගේ අකැමති ලැයිස්තුව',
    subheader: 'පසුව මිලදී ගැනීමට සුරැකි අයිතම',
    emptyTitle: 'අකැමති ලැයිස්තුව හිස්ය',
    emptySubtitle: 'පසුව මිලදී ගැනීමට නිෂ්පාදන එකතු කරන්න.',
    viewProducts: 'නිෂ්පාදන බලන්න',
    addToCart: ' කර්ට් එකට',
    view: 'බලන්න'
  },
  addresses: {
    header: 'මගේ ලිපින',
    subheader: 'බෙදාහැරීමට සුරැකි ලිපින',
    addNew: 'නව ලිපිනයක් ඇතුලත් කරන්න',
    edit: 'සංස්කරණය',
    delete: 'ඉවත් කරන්න'
  },
  payments: {
    header: 'ගෙවීම් ක්‍රම',
    subheader: 'ඔබගේ සුරැකි ගෙවීම් ක්‍රම',
    addNew: 'නව ගෙවීම් ක්‍රමයක් එකතු කරන්න'
  },
  recommended: {
    header: 'ඔබ සඳහා නිර්දේශිත',
    subheader: 'ඔබගේ රුචි අනුව විශේෂයෙන් තෝරාගත් නිෂ්පාදන',
    product: (n) => `නිර්දේශිත නිෂ්පාදනය ${n}`,
    storeName: 'සාප්පු නාමය'
  },
  dialogs: {
    address: {
      title: 'නව ලිපිනයක් එකතු කරන්න',
      type: 'ලිපිනයේ වර්ගය',
      types: { home: 'නිවස', office: ' කාර්යාලය' },
      detail: 'පූර්ණ ලිපිනය',
      phone: 'දුරකථන අංකය',
      cancel: 'එපා',
      save: 'සුරකින්න'
    },
    payment: {
      title: 'නව ගෙවීම් ක්‍රමයක් එකතු කරන්න',
      type: 'ගෙවීම් වර්ගය',
      types: { card: 'ක්‍රෙඩිට් කාඩ්පත', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
      numberCard: 'කාඩ්පත් අංකය',
      numberAccount: 'ගිණුම් අංකය',
      expiry: 'කල් ඉකුත් වීම (MM/YY)',
      cancel: 'එපා',
      save: 'සුරකින්න'
    },
    order: {
      title: 'ඇණවුම් විස්තර',
      orderId: (id) => `ඇණවුම් ID: #${id}`,
      orderInfo: 'ඇණවුම් තොරතුරු',
      deliveryInfo: 'බෙදාහැරීමේ තොරතුරු',
      status: 'තත්ත්වය:',
      tracking: 'ට්‍රැකින්',
      trackingNote: 'තවත් විස්තර සඳහා ට්‍රැකින් තෝරන්න',
      summary: 'සාරාංශය',
      close: 'වසන්න'
    }
  }
};

export default customerDashboardSl;


