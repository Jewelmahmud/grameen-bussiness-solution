const customerDashboardCn = {
  hero: {
    welcome: (name) => `欢迎，${name}！`,
    subtitle: '您的仪表板。访问相关产品页面购买更多商品'
  },
  stats: {
    totalOrders: '总订单',
    totalSpent: '总消费',
    points: '积分',
    nextReward: '下一个奖励'
  },
  labels: {
    memberSinceSuffix: '会员自',
    order: '订单',
    itemsSuffix: '件商品',
    phone: '电话：',
    default: '默认',
    home: '家庭',
    office: '办公室',
    expires: '到期',
    store: '商店：',
    orderNumber: '订单号：',
    orderDate: '订单日期：',
    totalItems: '总商品数：',
    totalAmount: '总金额：'
  },
  sidebar: {
    title: '仪表板菜单',
    orders: '我的订单',
    wishlist: '愿望清单',
    addresses: '地址',
    payments: '支付方式',
    editProfile: '编辑资料'
  },
  orders: {
    header: '我的订单',
    subheader: '查看所有订单的列表和状态',
    support: '客户支持',
    status: {
      delivered: '已送达',
      shipped: '已发货',
      processing: '处理中',
      pending: '待处理'
    },
    tracking: '跟踪',
    viewDetails: '查看详情',
    emptyTitle: '暂无订单',
    emptySubtitle: '您还没有下过任何订单。开始购物吧！',
    startShopping: '开始购物'
  },
  wishlist: {
    header: '我的愿望清单',
    subheader: '保存的商品，稍后购买',
    emptyTitle: '您的愿望清单是空的',
    emptySubtitle: '将产品添加到您的愿望清单中，稍后购买。',
    viewProducts: '查看产品',
    addToCart: '添加到购物车',
    view: '查看'
  },
  addresses: {
    header: '我的地址',
    subheader: '保存的送货地址',
    addNew: '添加新地址',
    edit: '编辑',
    delete: '删除'
  },
  payments: {
    header: '支付方式',
    subheader: '您保存的支付方式',
    addNew: '添加新支付方式'
  },
  recommended: {
    header: '为您推荐',
    subheader: '根据您的偏好特别策划的产品',
    product: (n) => `推荐产品 ${n}`,
    storeName: '商店名称'
  },
  dialogs: {
    address: {
      title: '添加新地址',
      type: '地址类型',
      types: { home: '家庭', office: '办公室' },
      detail: '完整地址',
      phone: '电话号码',
      cancel: '取消',
      save: '保存'
    },
    payment: {
      title: '添加新支付方式',
      type: '支付类型',
      types: { card: '信用卡', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
      numberCard: '卡号',
      numberAccount: '账号',
      expiry: '到期时间 (月/年)',
      cancel: '取消',
      save: '保存'
    },
    order: {
      title: '订单详情',
      orderId: (id) => `订单ID：#${id}`,
      orderInfo: '订单信息',
      deliveryInfo: '送货信息',
      status: '状态：',
      tracking: '跟踪',
      trackingNote: '点击跟踪获取更多详情',
      summary: '订单摘要',
      close: '关闭'
    }
  }
};

export default customerDashboardCn;
