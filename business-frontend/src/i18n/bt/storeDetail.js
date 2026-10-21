const storeDetailBt = {
	breadcrumbs: { home: 'ཁྱིམ་', bazars: 'ཚོང་ཟོར་' },
	loading: 'ཚོང་ཁང་གནས་ཚུལ་ལྷོད་སྒོར་འགྲོ་དོ...',
	verified: 'ངོ་སྤྲོད་ཚོང་ཁང་',
	locatedIn: (place) => `📍 ${place} ནང་ཡོད་`,
	tabs: { products: 'ཐེབས་', about: 'སྐོར་ལས་', reviews: 'བསམ་འཆར་' },
	common: { all: 'ཆ་མཉམ་' },
	labels: {
		products: 'ཐེབས་',
		premiumStore: 'དཔེ་རིས་ཚོང་ཁང་',
		stock: 'ཚོང་མང་:',
		totalProducts: 'ཐེབས་གྲ་སྡེ་',
		rating: 'མཐོ་ཚད་',
		reviews: 'བསམ་འཆར་',
		stars: 'སྐར་མ་',
		discount: 'གདམ་ཐོག'
	},
	productsSection: {
		titleWithCount: (count) => `ཐེབས་ (${count})`
	},
	about: {
		title: (name) => `${name} སྐོར་ལས་`,
		productTypes: '🛍️ ཐེབས་དབྱེ་བ་',
		stats: '📊 ཚད་རྩིས་'
	},
	review: {
		heading: 'མཁོ་མང་མིའི་བསམ་འཆར་དང་མཆན་འགྲེལ་',
		write: 'བསམ་འཆར་འབྲི།',
		cancel: 'ཆ་མེད་',
		basedOn: (count) => `${count} བསམ་འཆར་ལུ་གཞི་བཞག`,
		formTitle: 'ཁྱེད་ཀྱི་བསམ་འཆར་འབྲི།',
		yourName: 'མིང་',
		ratingLabel: 'མཐོ་ཚད་བྱིན།',
		ratingHint: 'མཐོ་ཚད་གཏན་ཁེལ་བྱེད་ནི་ལུ་སྐར་མ་གུ་ཧོ་བར་',
		commentPlaceholder: 'ཚོང་ཁང་འདི་སྐོར་ལས་ཉམས་མྱོང་སྐུར།...',
		submit: 'བསམ་འཆར་གཏང་།'
	},
	contact: {
		title: '📞 འབྲེལ་ལམ་གནས་ཚུལ་',
		address: 'ཁ་བྱང་',
		phone: 'ཁ་པར་',
		email: 'ཨེ་མེལ་',
		website: 'ཝེབ་ས་ཁོངས་'
	},
	hours: {
		title: '🕐 ཚོང་ཁང་དུས་ཚོད་',
		weekdaysLabel: 'སྤྱི་གཙུག - གཟའ་པ་སྣོན་',
		saturdayLabel: 'གཟའ་སྤེན་པ་',
		sundayLabel: 'གཟའ་ཉི་མ་'
	},
	buttons: {
		details: 'རྒྱས་པ་',
		addToCart: 'ཀརཊ་ནང་བཙུགས།',
		cancel: 'ཆ་མེད་',
		viewCart: 'ཀརཊ་ལྟ།'
	},
	quickStats: {
		title: 'མགྱོགས་ཚད་རྩིས་',
		products: 'ཐེབས་',
		rating: 'མཐོ་ཚད་'
	},
	tooltips: {
		addToWishlist: 'འདོན་ཐོ་ནང་སྣོན།'
	}
};

export default storeDetailBt;


