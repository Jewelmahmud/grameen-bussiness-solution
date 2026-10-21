const storeDetailPk = {
	breadcrumbs: { home: 'ہوم', bazars: 'بازار' },
	loading: 'اسٹور کی تفصیلات لوڈ ہو رہی ہیں...',
	verified: 'تصدیق شدہ اسٹور',
	locatedIn: (place) => `📍 ${place} میں واقع`,
	tabs: { products: 'مصنوعات', about: 'متعلق', reviews: 'جائزے' },
	common: { all: 'سب' },
	labels: {
		products: 'مصنوعات',
		premiumStore: 'پریمیم اسٹور',
		stock: 'اسٹاک:',
		totalProducts: 'کل مصنوعات',
		rating: 'ریٹنگ',
		reviews: 'جائزے',
		stars: 'ستارے',
		discount: 'رعایت'
	},
	productsSection: {
		titleWithCount: (count) => `مصنوعات (${count})`
	},
	about: {
		title: (name) => `${name} کے بارے میں`,
		productTypes: '🛍️ مصنوعات کی اقسام',
		stats: '📊 اعداد و شمار'
	},
	review: {
		heading: 'صارفین کے جائزے اور تبصرے',
		write: 'جائزہ لکھیں',
		cancel: 'منسوخ کریں',
		basedOn: (count) => `${count} جائزوں کی بنیاد پر`,
		formTitle: 'اپنا جائزہ لکھیں',
		yourName: 'آپ کا نام',
		ratingLabel: 'ریٹنگ دیں',
		ratingHint: 'درست ریٹنگ کے لیے ستاروں پر ہور کریں',
		commentPlaceholder: 'اس اسٹور کے بارے میں اپنا تجربہ شیئر کریں...',
		submit: 'جائزہ جمع کریں'
	},
	contact: {
		title: '📞 رابطہ کی معلومات',
		address: 'پتہ',
		phone: 'فون',
		email: 'ای میل',
		website: 'ویب سائٹ'
	},
	hours: {
		title: '🕐 اسٹور کے اوقات',
		weekdaysLabel: 'پیر - جمعہ',
		saturdayLabel: 'ہفتہ',
		sundayLabel: 'اتوار'
	},
	buttons: {
		details: 'تفصیلات',
		addToCart: 'بیگ میں شامل کریں',
		cancel: 'منسوخ کریں',
		viewCart: 'کارٹ دیکھیں'
	},
	quickStats: {
		title: 'فوری شماریات',
		products: 'مصنوعات',
		rating: 'ریٹنگ'
	},
	tooltips: {
		addToWishlist: 'پسندیدہ میں شامل کریں'
	}
};

export default storeDetailPk;


