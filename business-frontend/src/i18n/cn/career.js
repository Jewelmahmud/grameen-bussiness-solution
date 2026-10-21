const careerCn = {
	breadcrumbs: { home: '首页', career: '职业' },
	hero: {
		title: '开始您的梦想职业',
		subtitle: '加入乡村集市，帮助将孟加拉国的农村商业转型到数字时代'
	},
	companyStats: [
		{ value: '500+', label: '员工' },
		{ value: '10+', label: '办公室' },
		{ value: '98%', label: '员工满意度' },
		{ value: '100+', label: '培训项目' }
	],
	jobsSection: { title: '空缺职位', subtitle: '与我们合作，发展您的职业生涯' },
	labels: {
		featured: '特色',
		postedSuffix: '发布',
		salary: '薪资',
		deadline: '申请截止日期'
	},
	buttons: {
		viewDetails: '查看详情',
		apply: '申请',
		cancel: '取消',
		submit: '提交申请',
		contact: '联系我们'
	},
	cta: {
		title: '找不到合适的职位？',
		subtitle: '联系我们。我们会通知您新的机会。',
		contact: '联系我们'
	},
	form: {
		titleSuffix: ' - 申请表',
		name: '姓名',
		email: '邮箱',
		phone: '电话',
		education: '教育背景',
		experience: '工作经验',
		uploadResume: '上传简历 (PDF, DOC, DOCX)'
	},
	snackbar: {
		success: '您的申请已提交。我们会尽快联系您。'
	},
	jobs: [
		{
			id: 1,
			title: '高级软件工程师',
			department: 'IT',
			location: '达卡',
			type: '全职',
			experience: '5年以上',
			salary: '80,000 - 120,000 塔卡',
			deadline: '2024年4月30日',
			posted: '5天前',
			description: '加入我们的技术团队。需要React、Node.js和云服务经验。',
			requirements: ['至少5年Web开发经验', '精通React、Node.js', 'AWS/GCP经验', '团队领导经验'],
			benefits: ['有竞争力的薪资', '健康保险', '年终奖金', '灵活工作时间'],
			featured: true
		},
		{
			id: 2,
			title: '营销经理',
			department: '营销',
			location: '达卡',
			type: '全职',
			experience: '3年以上',
			salary: '50,000 - 80,000 塔卡',
			deadline: '2024年4月25日',
			posted: '3天前',
			description: '寻找有经验的营销经理来规划和执行数字营销活动。',
			requirements: ['3年以上数字营销经验', '社交媒体活动运营经验', '团队管理技能', '预算处理经验'],
			benefits: ['有竞争力的薪资', '健康保险', '学习预算'],
			featured: false
		},
		{
			id: 3,
			title: '客户服务专员',
			department: '客户服务',
			location: '达卡',
			type: '全职',
			experience: '1年以上',
			salary: '25,000 - 40,000 塔卡',
			deadline: '2024年4月20日',
			posted: '1天前',
			description: '充满活力且有经验的人员，提供卓越的客户支持。',
			requirements: ['1年以上客户服务经验', '优秀的沟通能力', '流利的孟加拉语和英语', '计算机技能'],
			benefits: ['有竞争力的薪资', '健康保险', '职业发展'],
			featured: false
		}
	]
};

export default careerCn;
