const bazarDetailCn = {
  loading: '正在加载集市详情...',
  hero: {
    rating: '评分',
    established: '成立时间',
    shops: '商店',
    dailyVisitors: '每日访客',
    size: '规模'
  },
  specialties: {
    title: '特色',
    buyHere: '在此集市购物'
  },
  tabs: {
    overview: '概览',
    stores: '商店',
    reviews: '评论'
  },
  overview: {
    aboutSuffix: ' 关于',
    details: '详细描述',
    contact: '联系信息',
    address: '地址',
    phone: '电话',
    email: '邮箱',
    openingHours: '营业时间',
    location: '位置',
    mapLoading: '正在加载地图...',
    rating: '评分'
  },
  sidebarInfo: {
    title: '集市信息',
    established: '成立时间',
    weeklyHoliday: '每周休息日',
    size: '集市规模',
    rating: '评分'
  },
  facilities: {
    title: '设施',
    parkingYes: '停车',
    parkingNo: '无停车',
    atmYes: 'ATM',
    atmNo: '无ATM',
    wheelchairYes: '轮椅可通行',
    wheelchairNo: '轮椅不可通行'
  },
  stores: {
    title: (name) => `${name} 的商店`,
    categoryPrefix: '类别: ',
    viewStore: '查看商店'
  },
  reviews: {
    title: '客户评论',
    loadMore: '加载更多评论',
    summaryTitle: '评分摘要',
    basedOn: (count) => `基于 ${count} 条评论`,
    helpful: (n) => `有用 (${n})`,
    reply: '回复'
  },
  writeReview: {
    title: '写评论',
    subtitle: '与他人分享您的体验',
    button: '写评论'
  },
  dialog: {
    title: '写评论',
    subtitle: (name) => `分享您对 ${name} 的看法`,
    guestToggle: '以访客身份评论',
    nameLabel: '您的姓名',
    namePh: '输入您的姓名',
    emailLabel: '邮箱（可选）',
    emailPh: '输入您的邮箱地址',
    ratingLabel: '给出评分',
    commentLabel: '您的评论',
    commentPh: '分享您对此集市的体验...',
    helper: '您的评论将帮助他人做出更好的决定',
    cancel: '取消',
    submit: '提交评论',
    successSubmit: '您的评论已成功提交！',
    validation: {
      commentRequired: '请输入您的评论。',
      nameRequired: '请输入您的姓名。'
    }
  },
  cart: {
    added: (name) => `${name} 已添加到购物车！`
  },
  locationDialog: {
    title: '恭喜！',
    selected: '您的集市已被选择',
    instruction1: '这已被设置为您的当前集市。',
    instruction2: '从下面选择您想要购物的类别：',
    categoryPrompt: '您想要购买什么？',
    bottomNotePrefix: '这些产品将来自',
    bottomNoteSuffix: '',
    close: '稍后再说'
  }
};

export default bazarDetailCn;
