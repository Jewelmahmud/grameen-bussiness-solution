const customerDashboardPk = {
	hero: {
		welcome: (name) => `خوش آمدید، ${name}!`,
		subtitle: 'آپ کا ڈیش بورڈ۔ مزید خریداری کے لیے متعلقہ پروڈکٹ صفحات دیکھیں'
	},
	stats: {
		totalOrders: 'کل آرڈرز',
		totalSpent: 'کل خرچ',
		points: 'پوائنٹس',
		nextReward: 'اگلا انعام'
	},
	labels: {
		memberSinceSuffix: 'سے ممبر',
		order: 'آرڈر',
		itemsSuffix: 'آئٹمز',
		phone: 'فون:',
		default: 'ڈیفالٹ',
		home: 'گھر',
		office: 'دفتر',
		expires: 'میعاد ختم',
		store: 'دکان:',
		orderNumber: 'آرڈر نمبر:',
		orderDate: 'آرڈر کی تاریخ:',
		totalItems: 'کل اشیاء:',
		totalAmount: 'کل رقم:'
	},
	sidebar: {
		title: 'ڈیش بورڈ مینو',
		orders: 'میرے آرڈرز',
		wishlist: 'خواہشات',
		addresses: 'پتے',
		payments: 'ادائیگی کے طریقے',
		editProfile: 'پروفائل ایڈٹ کریں'
	},
	orders: {
		header: 'میرے آرڈرز',
		subheader: 'اپنے تمام آرڈرز اور ان کی حیثیت دیکھیں',
		support: 'کسٹمر سپورٹ',
		status: {
			delivered: 'ڈیلیورڈ',
			shipped: 'شپڈ',
			processing: 'پروسیسنگ',
			pending: 'زیر التواء'
		},
		tracking: 'ٹریکنگ',
		viewDetails: 'تفصیل دیکھیں',
		emptyTitle: 'ابھی تک کوئی آرڈر نہیں',
		emptySubtitle: 'آپ نے ابھی تک کوئی آرڈر نہیں دیا۔ خریداری شروع کریں!',
		startShopping: 'خریداری شروع کریں'
	},
	wishlist: {
		header: 'میری خواہشات',
		subheader: 'بعد میں خریدنے کے لیے محفوظ کردہ اشیاء',
		emptyTitle: 'آپ کی خواہشات خالی ہیں',
		emptySubtitle: 'بعد میں خریداری کے لیے اشیاء خواہشات میں شامل کریں۔',
		viewProducts: 'اشیاء دیکھیں',
		addToCart: 'کارٹ میں شامل کریں',
		view: 'دیکھیں'
	},
	addresses: {
		header: 'میرے پتے',
		subheader: 'ڈلیوری کے لیے محفوظ پتے',
		addNew: 'نیا پتہ شامل کریں',
		edit: 'ترمیم',
		delete: 'حذف کریں'
	},
	payments: {
		header: 'ادائیگی کے طریقے',
		subheader: 'آپ کے محفوظ کردہ ادائیگی کے طریقے',
		addNew: 'نیا ادائیگی طریقہ شامل کریں'
	},
	recommended: {
		header: 'آپ کے لیے تجویز کردہ',
		subheader: 'آپ کی پسند کی بنیاد پر خصوصی طور پر منتخب کردہ مصنوعات',
		product: (n) => `تجویز کردہ پروڈکٹ ${n}`,
		storeName: 'دکان کا نام'
	},
	dialogs: {
		address: {
			title: 'نیا پتہ شامل کریں',
			type: 'پتے کی قسم',
			types: { home: 'گھر', office: 'دفتر' },
			detail: 'مکمل پتہ',
			phone: 'فون نمبر',
			cancel: 'منسوخ کریں',
			save: 'محفوظ کریں'
		},
		payment: {
			title: 'نیا ادائیگی طریقہ شامل کریں',
			type: 'ادائیگی کی قسم',
			types: { card: 'کریڈٹ کارڈ', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
			numberCard: 'کارڈ نمبر',
			numberAccount: 'اکاؤنٹ نمبر',
			expiry: 'میعاد (MM/YY)',
			cancel: 'منسوخ کریں',
			save: 'محفوظ کریں'
		},
		order: {
			title: 'آرڈر کی تفصیل',
			orderId: (id) => `آرڈر آئی ڈی: #${id}`,
			orderInfo: 'آرڈر معلومات',
			deliveryInfo: 'ڈلیوری معلومات',
			status: 'حیثیت:',
			tracking: 'ٹریک کریں',
			trackingNote: 'مزید معلومات کے لیے ٹریک پر کلک کریں',
			summary: 'آرڈر خلاصہ',
			close: 'بند کریں'
		}
	}
};

export default customerDashboardPk;


