const storeDetailCn = {
  breadcrumbs: { home: '首页', bazars: '市场' },
  loading: '加载商店详情...',
  verified: '认证商店',
  locatedIn: (place) => `📍 位于${place}`,
  tabs: { products: '产品', about: '关于', reviews: '评论' },
  common: { all: '全部' },
  labels: {
    products: '产品',
    premiumStore: '优质商店',
    stock: '库存:',
    totalProducts: '产品总数',
    rating: '评分',
    reviews: '评论',
    stars: '星',
    discount: '折扣'
  },
  productsSection: {
    titleWithCount: (count) => `产品 (${count})`
  },
  about: {
    title: (name) => `关于${name}`,
    productTypes: '🛍️ 产品类型',
    stats: '📊 统计'
  },
  review: {
    heading: '客户评论和留言',
    write: '写评论',
    cancel: '取消',
    basedOn: (count) => `基于${count}条评论`,
    formTitle: '写您的评论',
    yourName: '您的姓名',
    ratingLabel: '给出评分',
    ratingHint: '悬停在星星上获得精确评分',
    commentPlaceholder: '分享您对这个商店的体验...',
    submit: '提交评论'
  },
  contact: {
    title: '📞 联系信息',
    address: '地址',
    phone: '电话',
    email: '邮箱',
    website: '网站'
  },
  hours: {
    title: '🕐 营业时间',
    weekdaysLabel: '周一 - 周五',
    saturdayLabel: '周六',
    sundayLabel: '周日'
  },
  buttons: {
    details: '详情',
    addToCart: '加入购物袋',
    cancel: '取消',
    viewCart: '查看购物车'
  },
  quickStats: {
    title: '快速统计',
    products: '产品',
    rating: '评分'
  },
  tooltips: {
    addToWishlist: '添加到愿望清单'
  }
};

export default storeDetailCn;
