const medicineBazarCn = {
  search: {
    placeholders: [
      '输入药品名称...',
      '输入通用名称...',
      '输入公司名称...',
      '输入品牌名称...',
      '输入商店名称...'
    ]
  },
  sidebar: {
    categoriesTitle: '分类',
    storesTitle: '商店'
  },
  upload: {
    title: '上传处方',
    subtitle: '上传您的医生处方，轻松订购药品',
    uploadedPrefix: '✓ 文件已上传：',
    chooseFile: '选择文件',
    replaceFile: '上传新文件'
  },
  store: {
    serviceAreaLabel: '服务区域',
    nationwide: '全国',
    medicineCountLabel: '药品',
    close: '关闭',
    productsOfSuffix: '药品',
    descriptionPrefix: '以下是来自',
    descriptionSuffix: '药房的所有可用药品。您可以按分类筛选。'
  },
  card: {
    addToCart: '添加到购物袋'
  },
  empty: {
    title: '未找到药品',
    subtitle: '请选择其他分类或药房'
  },
  prescriptionFlow: {
    successTitle: '处方上传成功！',
    instruction: '请填写以下详细信息以提交您的药品订单',
    step1: {
      title: '选择药房',
      subtitle: '您想从哪家药房购买？',
      next: '下一步'
    },
    step2: {
      title: '选择疗程时长',
      subtitle: '您需要多少天的药品？',
      fullCourse: '完整疗程',
      fiveDays: '5天',
      tenDays: '10天',
      customDays: '自定义天数',
      customDaysLabel: '多少天？',
      customDaysPlaceholder: '例如：15',
      back: '返回',
      next: '下一步'
    },
    step3: {
      title: '确认订单',
      summaryTitle: '您的订单摘要：',
      pharmacyLabel: '药房',
      durationLabel: '疗程时长',
      prescriptionLabel: '处方',
      back: '返回',
      confirm: '确认订单'
    },
    snackbar: {
      successTitle: '🎉 订单提交成功！',
      message: '您选择的药房将很快联系您，提供价格和详细信息。'
    }
  }
};

export default medicineBazarCn;
