const singleBazarCn = {
  backTo: (title) => `返回${title}`,
  badges: {
    discount: (percent) => `${percent}% 折扣`
  },
  reviews: '评论',
  availability: {
    inStock: '有库存'
  },
  storeLabel: '商店',
  addToCart: '加入购物车',
  delivery: '配送: 24小时内',
  guarantee: '100%正品保证',
  tabs: {
    description: '描述',
    specs: '规格'
  },
  sections: {
    productDescription: '产品描述',
    productSpecs: '产品规格'
  },
  table: {
    category: '类别',
    store: '商店',
    stockStatus: '库存状态'
  },
  description: (name) => `这是来自我们可信供应商的高质量${name}。`
};

export default singleBazarCn;
