const emergencyCn = {
  buttons: {
    gas: '煤气罐',
    medicine: '紧急药品',
  },
  common: {
    nameLabel: '您的姓名',
    phoneLabel: '手机号码',
    villageLabel: '村庄/地区',
    houseNumberLabel: '房屋号码',
    detailsLabel: '附加信息',
    detailsPlaceholder: '任何特殊说明',
    districtLabel: '区',
    upazillaLabel: '县',
    cancel: '取消',
  },
  gas: {
    title: '煤气罐充气',
    companyLabel: '煤气公司',
    cylinderSizeLabel: '气罐尺寸',
    cylinderSizePlaceholder: '选择气罐尺寸',
    quantityLabel: '数量',
    companies: {
      bashundhara: 'Bashundhara煤气',
      jamuna: 'Jamuna煤气',
      omera: 'Omera煤气',
      beximco: 'Beximco煤气',
      fresh: 'Fresh煤气',
      totalgaz: 'Totalgaz',
      others: '其他',
    },
    cylinderSizeOptions: {
      "12kg": '12公斤',
      "33kg": '33公斤',
      "45kg": '45公斤',
    },
    price: {
      header: '价格详情',
      unitPrice: '单价',
      subtotal: '小计',
      delivery: '送货费',
      total: '总计',
      note: '* 支持货到付款',
      unitSuffix: '件',
    },
    orderNow: '立即订购',
  },
  medicine: {
    title: '紧急药品服务',
    medicineNameLabel: '药品名称',
    medicineNamePlaceholder: '需要什么药品？',
    urgencyLabel: '紧急程度',
    urgencyOptions: {
      normal: '普通',
      urgent: '紧急',
      emergency: '非常紧急',
    },
    prescriptionLabel: '处方（如有）',
    prescriptionPlaceholder: '医生处方或药品详情',
    uploadNote: '处方上传是可选的；您可以上传图片或PDF。',
    uploadButton: '上传处方（可选）',
    selectedFilePrefix: '已选择文件：',
    submit: '下紧急订单',
  }
};

export default emergencyCn;
