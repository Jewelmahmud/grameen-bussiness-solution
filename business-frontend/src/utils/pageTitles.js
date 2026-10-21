export function getPageTitle(pathname, language = 'bn') {
    const t = {
        bn: {
            login: 'লগইন',
            businessSetup: 'ব্যবসা সেটআপ',
            inventoryDashboard: 'ইনভেন্টরি ড্যাশবোর্ড',
            products: 'পণ্য ব্যবস্থাপনা',
            categories: 'ক্যাটাগরি ব্যবস্থাপনা',
            brands: 'ব্র্যান্ড ব্যবস্থাপনা',
            units: 'ইউনিট ব্যবস্থাপনা',
            variations: 'ভ্যারিয়েশন ব্যবস্থাপনা',
            stock: 'স্টক ব্যবস্থাপনা',
            sales: 'বিক্রয়',
            purchase: 'ক্রয়',
            returns: 'ফেরত',
            warranty: 'ওয়ারেন্টি',
            contacts: 'পরিচিতি',
            analysis: 'বিশ্লেষণ',
            report: 'রিপোর্ট',
            settings: 'সেটিংস',
            posSystem: 'POS সিস্টেম',
            posSales: 'POS বিক্রয়',
            transactionHistory: 'লেনদেনের ইতিহাস',
            posAnalytics: 'POS বিশ্লেষণ',
            posConfiguration: 'POS কনফিগারেশন',
            posSettings: 'POS সেটিংস',
        },
        en: {
            login: 'Login',
            businessSetup: 'Business Setup',
            inventoryDashboard: 'Inventory Dashboard',
            products: 'Products Management',
            categories: 'Categories Management',
            brands: 'Brands Management',
            units: 'Units Management',
            variations: 'Variations Management',
            stock: 'Stock Management',
            sales: 'Sales',
            purchase: 'Purchase',
            returns: 'Returns',
            warranty: 'Warranty',
            contacts: 'Contacts',
            analysis: 'Analysis',
            report: 'Report',
            settings: 'Settings',
            posSystem: 'POS System',
            posSales: 'POS Sales',
            transactionHistory: 'Transaction History',
            posAnalytics: 'POS Analytics',
            posConfiguration: 'POS Configuration',
            posSettings: 'POS Settings',
        },
        np: {
            home: 'ग्रामीण बजार - होम',
            bazars: 'बजारहरूको सूची',
            daily: 'किराना',
            medicine: 'औषधि बजार',
            food: 'ताजा खाना',
            grains: 'अन्न',
            national: 'राष्ट्रिय बजार',
            garments: 'कपडा',
            cosmetics: 'सौन्दर्य',
            books: 'पुस्तक',
            nursery: 'नर्सरी',
            electronics: 'इलेक्ट्रोनिक्स',
            chemical: 'रासायनिक',
            hardware: 'हार्डवेयर',
            service: 'सेवा बजार',
            feed: 'पशु आहार',
            cart: 'कार्ट',
            checkout: 'चेकआउट',
            search: 'खोज परिणाम',
            privacy: 'गोपनीयता नीति',
            about: 'हाम्रो बारे',
            help: 'सहायता',
            contact: 'सम्पर्क',
            career: 'क्यारियर',
            becomeSeller: 'विक्रेता बन्नुहोस्',
            store: 'स्टोर',
            product: 'वस्तुको विवरण',
        },
        de: {
            home: 'Grameen Bazar - Startseite',
            bazars: 'Basare',
            daily: 'Täglicher Basar',
            medicine: 'Medizin-Basar',
            food: 'Frische Lebensmittel',
            grains: 'Getreide',
            national: 'Nationaler Basar',
            garments: 'Bekleidung',
            cosmetics: 'Kosmetik',
            books: 'Bücher',
            nursery: 'Gärtnerei',
            electronics: 'Elektronik',
            chemical: 'Chemikalien',
            hardware: 'Hardware',
            service: 'Service-Basar',
            feed: 'Tierfutter',
            cart: 'Warenkorb',
            checkout: 'Kasse',
            search: 'Suchergebnisse',
            privacy: 'Datenschutz',
            about: 'Über uns',
            help: 'Hilfe',
            contact: 'Kontakt',
            career: 'Karriere',
            becomeSeller: 'Verkäufer werden',
            store: 'Geschäft',
            product: 'Produktdetails',
        },
        pk: {
            home: 'گرامین بازار - ہوم',
            bazars: 'بازاروں کی فہرست',
            daily: 'روزمرہ بازار',
            medicine: 'ادویات بازار',
            food: 'تازہ کھانا',
            grains: 'اناج',
            national: 'قومی بازار',
            garments: 'گارمنٹس',
            cosmetics: 'کاسمیٹکس',
            books: 'کتابیں',
            nursery: 'نرسری',
            electronics: 'الیکٹرانکس',
            chemical: 'کیمیکل',
            hardware: 'ہارڈ ویئر',
            service: 'سروس بازار',
            feed: 'جانوروں کی خوراک',
            cart: 'کارٹ',
            checkout: 'چیک آؤٹ',
            search: 'تلاش کے نتائج',
            privacy: 'پرائیویسی پالیسی',
            about: 'ہمارے بارے میں',
            help: 'مدد',
            contact: 'رابطہ',
            career: 'کیریئر',
            becomeSeller: 'سیلر بنیں',
            store: 'اسٹور',
            product: 'مصنوعات کی تفصیل',
        },
        af: {
            home: 'ګرامین بازار - کور',
            bazars: 'د بازارونو لیست',
            daily: 'روزانه بازار',
            medicine: 'د دواګانو بازار',
            food: 'تازه خواړه',
            grains: 'غله جات',
            national: 'ملکی بازار',
            garments: 'جامې',
            cosmetics: 'کاسمیټیک',
            books: 'کتابونه',
            nursery: 'نرسري',
            electronics: 'برقی توکي',
            chemical: 'کیمیاوي توکي',
            hardware: 'هارډویر',
            service: 'خدمتونه',
            feed: 'د حیواناتو خواړه',
            cart: 'کارټ',
            checkout: 'چیک آؤټ',
            search: 'د لټون پایلې',
            privacy: 'د خصوصیت پالیسي',
            about: 'زموږ په اړه',
            help: 'مرسته',
            contact: 'اړیکه',
            career: 'مسلک',
            becomeSeller: 'پلورونکی شئ',
            store: 'پلورنځی',
            product: 'د محصول تفصیلات',
        },
        cn: {
            home: '乡村集市 - 首页',
            bazars: '集市列表',
            daily: '日常集市',
            medicine: '药品集市',
            food: '新鲜食品',
            grains: '谷物',
            national: '全国集市',
            garments: '服装',
            cosmetics: '化妆品',
            books: '书籍',
            nursery: '苗圃',
            electronics: '电子产品',
            chemical: '化学品',
            hardware: '五金',
            service: '服务集市',
            feed: '动物饲料',
            cart: '购物车',
            checkout: '结账',
            search: '搜索结果',
            privacy: '隐私政策',
            about: '关于我们',
            help: '帮助',
            contact: '联系',
            career: '职业',
            becomeSeller: '成为卖家',
            store: '商店',
            product: '产品详情',
        },
	};

    const L = t[language] || t.bn;

	// Dynamic route checks first
	if (/^\/upazila-admin\/dashboard/.test(pathname)) {
		return L.upazilaAdminDashboard;
	}
	if (/^\/[\w-]+\/product\//.test(pathname)) {
		return L.product;
	}
	if (/^\/medicine-bazar\/product\//.test(pathname)) {
		return L.product;
	}
	if (/^\/stores\//.test(pathname)) {
		return L.store;
	}

	// Business Dashboard routes (check before static mappings)
	if (/^\/business\/dashboard\/products\/categories/.test(pathname)) {
		return L.categories;
	}
	if (/^\/business\/dashboard\/products\/brands/.test(pathname)) {
		return L.brands;
	}
	if (/^\/business\/dashboard\/products\/units/.test(pathname)) {
		return L.units;
	}
	if (/^\/business\/dashboard\/products\/variations/.test(pathname)) {
		return L.variations;
	}
	if (/^\/business\/dashboard\/products/.test(pathname)) {
		return L.products;
	}
	if (/^\/business\/pos-system\/sales/.test(pathname)) {
		return L.posSales;
	}
	if (/^\/business\/pos-system\/transaction-history/.test(pathname)) {
		return L.transactionHistory;
	}
	if (/^\/business\/pos-system\/analytics/.test(pathname)) {
		return L.posAnalytics;
	}
	if (/^\/business\/pos-system\/configuration/.test(pathname)) {
		return L.posConfiguration;
	}
	if (/^\/business\/pos-system\/settings/.test(pathname)) {
		return L.posSettings;
	}
	if (/^\/business\/pos-system/.test(pathname)) {
		return L.posSystem;
	}

	// Static mappings
	const map = new Map([
		['/', L.home],
		['/login', L.login],
		['/business/setup', L.businessSetup],
		['/business/dashboard', L.inventoryDashboard],
		['/business/dashboard/stock', L.stock],
		['/business/dashboard/sales', L.sales],
		['/business/dashboard/purchase', L.purchase],
		['/business/dashboard/returns', L.returns],
		['/business/dashboard/warranty', L.warranty],
		['/business/dashboard/contacts', L.contacts],
		['/business/dashboard/customers', L.contacts],
		['/business/dashboard/analysis', L.analysis],
		['/business/dashboard/report', L.report],
		['/business/dashboard/settings', L.settings],
		['/bazars', L.bazars],
		['/daily-bazar', L.daily],
		['/medicine-bazar', L.medicine],
		['/food-bazar', L.food],
		['/grains', L.grains],
		['/national-bazar', L.national],
		['/garments-bazar', L.garments],
		['/cosmetics-bazar', L.cosmetics],
		['/book-bazar', L.books],
		['/nursery-bazar', L.nursery],
		['/electronics-bazar', L.electronics],
		['/chemical-bazar', L.chemical],
		['/hardware-bazar', L.hardware],
		['/service-bazar', L.service],
		['/feed-bazar', L.feed],
		['/cart', L.cart],
		['/checkout', L.checkout],
		['/search', L.search],
		['/privacy-policy', L.privacy],
		['/about', L.about],
		['/help', L.help],
		['/contact', L.contact],
		['/career', L.career],
		['/become-seller', L.becomeSeller],
		['/upazila-admin/dashboard', L.upazilaAdminDashboard],
	]);

    return map.get(pathname) || L.home;
}


