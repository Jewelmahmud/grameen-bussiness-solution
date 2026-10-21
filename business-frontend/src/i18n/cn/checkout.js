const checkoutCn = {
  header: {
    title: '🛒 结账',
    subtitle: '按照以下步骤完成您的订单'
  },
  steps: ['订单详情', '配送信息', '支付', '确认'],
  order: {
    details: '订单详情',
    verify: '请检查您订购的商品',
    subtotal: '小计',
    delivery: '配送费',
    free: '免费 🎉',
    total: '总计',
    goToShipping: '前往配送'
  },
  shipping: {
    title: '配送信息',
    desc: '提供准确的配送信息',
    fullName: '全名 *',
    email: '邮箱 *',
    phone: '电话号码 *',
    district: '地区 *',
    noDistrict: '未找到地区',
    searchDistrict: '搜索地区...',
    city: '城市/县 *',
    postal: '邮政编码',
    address: '详细地址 *',
    addressPh: '房屋/公寓号、街道、区域',
    instruction: '配送说明（可选）',
    instructionPh: '特殊说明，例如：放在门口、配送前打电话',
    prev: '返回',
    goToPayment: '前往支付',
    notice: '📍 在乡村集市和乡村配送服务区域内：几小时内配送；外部（全国）：2-3天内',
    errors: {
      fullName: '需要全名',
      email: '需要有效的邮箱',
      phone: '需要有效的孟加拉国电话号码',
      address: '需要地址',
      city: '需要城市',
      district: '请选择地区'
    }
  },
  payment: {
    title: '支付方式',
    desc: '选择您首选的支付方式',
    info: '支付信息',
    mobile: '手机号码 *',
    cardNumber: '卡号 *',
    cardHolder: '持卡人姓名 *',
    expiry: '有效期 *',
    cvv: 'CVV *',
    recommended: '推荐',
    cashSelectedTitle: '🎉 已选择货到付款！',
    cashSelectedDesc: '订单到达时付款。无需预付款。',
    orderSummary: '💰 订单摘要',
    paymentFee: '支付手续费',
    labels: {
      mobilePh: '01XXXXXXXXX',
      cardNumberPh: '1234 5678 9012 3456',
      expiryPh: 'MM/YY',
      cvvPh: '123'
    },
    prev: '返回',
    confirm: '确认订单',
    processing: '正在处理订单...'
  },
  sidebar: {
    orderSummary: '订单摘要',
    moreItems: (n) => `+${n} 更多商品...`,
    notices: {
      securePayment: '安全支付',
      fastDelivery: '快速配送',
      warranty: '有保障'
    }
  },
  success: {
    title: '订单成功！',
    orderNo: (id) => `订单号: #${id}`,
    desc: '您的订单已收到。我们会尽快联系您。',
    deliveryInfo: '配送信息',
    track: '跟踪订单',
    home: '返回首页',
    fields: {
      name: '姓名',
      phone: '电话',
      address: '地址',
      payment: '支付',
      total: '总计'
    }
  },
  guards: {
    cartEmpty: '您的购物袋是空的。请先添加一些商品。',
    startShopping: '开始购物'
  },
  paymentMethods: {
    cash: { name: '货到付款', desc: '订单到达时付款', fee: 0 },
    bkash: { name: 'bKash', desc: '使用bKash支付', fee: 0 },
    nagad: { name: 'Nagad', desc: '使用Nagad支付', fee: 0 },
    rocket: { name: 'Rocket', desc: '使用Rocket支付', fee: 0 },
    card: { name: '信用卡/借记卡', desc: 'Visa、MasterCard等', fee: 25 },
    bank: { name: '银行转账', desc: '转账到银行账户', fee: 15 }
  }
};

export default checkoutCn;
