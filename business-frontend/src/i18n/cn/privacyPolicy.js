const privacyPolicyCn = {
  breadcrumbs: { home: '首页', title: '隐私政策' },
  hero: {
    title: '隐私政策',
    subtitle: '保护您的个人数据和隐私是我们的首要任务'
  },
  principles: [
    { title: '数据安全', description: '我们以最高级别的安全性存储您的个人信息' },
    { title: '透明度', description: '我们清楚说明我们收集什么以及为什么收集' },
    { title: '用户控制', description: '您对您的信息有完全控制权' },
    { title: '隐私保护', description: '未经您的许可，我们不会分享' }
  ],
  dataTypes: [
    { category: '个人信息', items: ['姓名', '电话号码', '邮箱地址', '出生日期'], purpose: '创建和管理您的账户' },
    { category: '地址信息', items: ['家庭地址', '送货地址', '县', '区'], purpose: '送货和本地服务' },
    { category: '支付信息', items: ['移动银行号码', '银行账户', '交易历史'], purpose: '安全支付处理' },
    { category: '使用信息', items: ['应用使用历史', '搜索记录', '愿望清单'], purpose: '提供个性化体验' }
  ],
  usage: {
    title: '我们如何使用信息',
    primaryTitle: '主要用途',
    primary: ['创建和管理账户', '处理订单和送货', '提供客户支持', '处理支付'],
    improveTitle: '改进用途',
    improve: ['个性化推荐', '服务质量改进', '安全和欺诈预防', '市场研究和分析']
  },
  rights: {
    title: '您的权利',
    items: [
      { right: '访问权', description: '了解我们存储的关于您的信息' },
      { right: '更正权', description: '更正不正确或过时的信息' },
      { right: '删除权', description: '请求删除您的个人信息' },
      { right: '数据可携带权', description: '下载您信息的副本' }
    ]
  },
  security: {
    title: '安全措施',
    intro: '我们实施以下措施来保护您的信息：',
    measures: ['SSL加密', '定期安全审计', '双因素认证', '数据备份和恢复', '访问控制系统', '定期系统更新']
  },
  cookies: {
    title: 'Cookie政策',
    usageTitle: 'Cookie的使用',
    p1: '我们使用Cookie来改善您的浏览体验并个性化我们的服务。Cookie是存储在您设备上的小型文本文件。',
    p2: '您可以在浏览器设置中控制Cookie。禁用Cookie可能导致某些服务无法正常工作。'
  },
  sharing: {
    title: '与第三方分享',
    intro: '我们可能在以下情况下与第三方分享信息：',
    authorizedTitle: '授权分享',
    notDoTitle: '我们不做什么',
    authorized: ['送货合作伙伴（用于地址）', '支付网关（用于交易）', '法律要求（根据法院命令）'],
    notDo: ['向广告商出售', '未经同意用于营销', '与不必要的第三方分享']
  },
  retention: {
    title: '数据保留政策',
    retentionTitle: '保留期限',
    retentionText: '只要您的账户处于活跃状态或需要提供服务，我们就会保留您的个人信息。',
    deleteTitle: '删除',
    deleteText: '账户关闭后，我们会在30天内删除您的个人信息，除非法律另有要求。'
  },
  updates: {
    title: '政策更新',
    alert: '本隐私政策可能会不时更新',
    notify: '我们将通过邮箱或应用通知告知您变更。对于重大变更，我们将获得您的同意。',
    lastUpdatedPrefix: '最后更新：',
    lastUpdatedDate: '2023年12月'
  },
  contact: {
    title: '隐私联系',
    subtitle: '如果您对本政策或您的个人数据有任何问题，请联系我们',
    button: '联系我们',
    email: 'privacy@grameenbazar.com'
  }
};

export default privacyPolicyCn;
