const checkoutPk = {
	header: {
		title: '🛒 چیک آؤٹ',
		subtitle: 'اپنا آرڈر مکمل کرنے کے لیے نیچے دیے گئے مراحل فالو کریں'
	},
	steps: ['آرڈر کی تفصیل', 'شپنگ معلومات', 'ادائیگی', 'تصدیق'],
	order: {
		details: 'آرڈر کی تفصیل',
		verify: 'براہ کرم اپنے آرڈر کیے گئے آئٹمز چیک کریں',
		subtotal: 'ذیلی مجموعہ',
		delivery: 'ڈلیوری چارج',
		free: 'فری 🎉',
		total: 'کل',
		goToShipping: 'شپنگ پر جائیں'
	},
	shipping: {
		title: 'شپنگ معلومات',
		desc: 'ڈلیوری کے لیے درست معلومات فراہم کریں',
		fullName: 'پورا نام *',
		email: 'ای میل *',
		phone: 'فون نمبر *',
		district: 'ضلع *',
		noDistrict: 'کوئی ضلع نہیں ملا',
		searchDistrict: 'ضلع تلاش کریں...',
		city: 'شہر/تحصیل *',
		postal: 'پوسٹل کوڈ',
		address: 'مکمل پتہ *',
		addressPh: 'گھر/فلیٹ نمبر، سڑک، علاقہ',
		instruction: 'ڈلیوری ہدایات (اختیاری)',
		instructionPh: 'مثلاً گیٹ پر رکھ دیں، ڈلیوری سے پہلے کال کریں',
		prev: 'واپس',
		goToPayment: 'ادائیگی پر جائیں',
		notice: '📍 Grameenbazar اور Grameen Delivery کے سروس ایریاز کے اندر: چند گھنٹوں میں ڈلیوری؛ باہر (ملک بھر): 2-3 دن میں',
		errors: {
			fullName: 'پورا نام درکار ہے',
			email: 'درست ای میل درکار ہے',
			phone: 'درست فون نمبر درکار ہے',
			address: 'پتہ درکار ہے',
			city: 'شہر درکار ہے',
			district: 'براہ کرم ضلع منتخب کریں'
		}
	},
	payment: {
		title: 'ادائیگی کا طریقہ',
		desc: 'اپنی پسند کا ادائیگی طریقہ منتخب کریں',
		info: 'ادائیگی کی معلومات',
		mobile: 'موبائل نمبر *',
		cardNumber: 'کارڈ نمبر *',
		cardHolder: 'کارڈ ہولڈر کا نام *',
		expiry: 'مدت ختم *',
		cvv: 'CVV *',
		recommended: 'سفارش کردہ',
		cashSelectedTitle: '🎉 کیش آن ڈلیوری منتخب!',
		cashSelectedDesc: 'آرڈر ملنے پر ادائیگی کریں۔ پیشگی ادائیگی کی ضرورت نہیں۔',
		orderSummary: '💰 آرڈر خلاصہ',
		paymentFee: 'ادائیگی فیس',
		labels: {
			mobilePh: '01XXXXXXXXX',
			cardNumberPh: '1234 5678 9012 3456',
			expiryPh: 'MM/YY',
			cvvPh: '123'
		},
		prev: 'واپس',
		confirm: 'آرڈر کنفرم کریں',
		processing: 'آرڈر پروسیس ہو رہا ہے...'
	},
	sidebar: {
		orderSummary: 'آرڈر خلاصہ',
		moreItems: (n) => `+${n} مزید آئٹمز...`,
		notices: {
			securePayment: 'محفوظ ادائیگی',
			fastDelivery: 'تیز ترسیل',
			warranty: 'ضمانت کے ساتھ'
		}
	},
	success: {
		title: 'آرڈر کامیاب!',
		orderNo: (id) => `آرڈر نمبر: #${id}`,
		desc: 'آپ کا آرڈر موصول ہو گیا ہے۔ ہم جلد رابطہ کریں گے۔',
		deliveryInfo: 'ڈلیوری معلومات',
		track: 'آرڈر ٹریک کریں',
		home: 'ہوم پر جائیں',
		fields: {
			name: 'نام',
			phone: 'فون',
			address: 'پتہ',
			payment: 'ادائیگی',
			total: 'کل'
		}
	},
	guards: {
		cartEmpty: 'آپ کی کارٹ خالی ہے۔ براہ کرم پہلے آئٹمز شامل کریں۔',
		startShopping: 'خریداری شروع کریں'
	},
	paymentMethods: {
		cash: { name: 'کیش آن ڈلیوری', desc: 'آرڈر ملنے پر ادائیگی کریں', fee: 0 },
		bkash: { name: 'bKash', desc: 'bKash سے ادائیگی کریں', fee: 0 },
		nagad: { name: 'Nagad', desc: 'Nagad سے ادائیگی کریں', fee: 0 },
		rocket: { name: 'Rocket', desc: 'Rocket سے ادائیگی کریں', fee: 0 },
		card: { name: 'کریڈٹ/ڈیبٹ کارڈ', desc: 'Visa, MasterCard وغیرہ', fee: 25 },
		bank: { name: 'بینک ٹرانسفر', desc: 'بینک اکاؤنٹ میں ٹرانسفر کریں', fee: 15 }
	}
};

export default checkoutPk;


