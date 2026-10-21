const customerDashboardBt = {
	hero: {
		welcome: (name) => `འབྱོར་བར་དགའ་པོ་ ${name}!`,
		subtitle: 'ཁྱེད་ཀྱི་ཌེ་ཤོབ་བོཌ། ཐེབས་མང་བ་ཉོ་བའི་ཆེད་དུ་འབྲེལ་ཡོད་པའི་ཤོག་ལེབ་ལྟ།'
	},
	stats: {
		totalOrders: 'བསྒྲུབས་ཚར་གནང་བ་',
		totalSpent: 'བསྐྱར་སྤྲོད་བསྡོམས་',
		points: 'ཡིད་འོངས་',
		nextReward: 'ཤུལ་མམ་རྩེད་བསྟེན་'
	},
	labels: {
		memberSinceSuffix: 'ལས་མཐུན་པར་གྱུར་པས་',
		order: 'གནང་བ་',
		itemsSuffix: 'ཐེབས་',
		phone: 'ཁ་པར་:',
		default: 'ཀྱི་ཐོག་བཀོད་',
		home: 'ཁྱིམ་',
		office: 'ཡར་ཁུལ་',
		expires: 'དུས་ཡུན་རྫོགས་',
		store: 'ཚོང་ཁང་:',
		orderNumber: 'གནང་ཨང་:',
		orderDate: 'གནང་ཚེས་:',
		totalItems: 'ཐེབས་དགུ་བསྡོམས་:',
		totalAmount: 'དངུལ་བསྡོམས་:'
	},
	sidebar: {
		title: 'ཌེ་ཤོབ་བོཌ་དྲིལ་བུ་',
		orders: 'ངའི་གནང་བ་',
		wishlist: 'འདོན་ཐོ་',
		addresses: 'ཁ་བྱང་',
		payments: 'དངུལ་སྤྲོད་ཐབས་',
		editProfile: 'གསལ་སྒྲགས་ཞུན་དག'
	},
	orders: {
		header: 'ངའི་གནང་བ་',
		subheader: 'ཁྱེད་ཀྱི་གནང་བ་ཚང་མའི་ཐོ་ཡིག་དང་གནས་ཚད་ལྟ།',
		support: 'མི་དམངས་ཞབས་ཞུ་',
		status: {
			delivered: 'གཏོང་ལེན་གྲུབ་',
			shipped: 'གཏོང་བཤུད་',
			processing: 'ལས་སྦྱོར་འབད་དོ་',
			pending: 'བསྣར་བཞག'
		},
		tracking: 'རྗེས་འཚོལ་',
		viewDetails: 'རྒྱས་པ་ལེན།',
		emptyTitle: 'ད་ཚུན་གནང་བ་མེད།',
		emptySubtitle: 'ད་ཚུན་ཁྱེད་ཀྱིས་གནང་བ་མ་བཙུགས་པས། ཉོ་ཚོང་འགོ་འབྱེད།',
		startShopping: 'ཉོ་ཚོང་འགོ་འབྱེད།'
	},
	wishlist: {
		header: 'ངའི་འདོན་ཐོ་',
		subheader: 'ཤུལ་མམ་ཉོ་བའི་ཐེབས་སྲུངས།',
		emptyTitle: 'ཁྱེད་ཀྱི་འདོན་ཐོ་སྟོང་པ།',
		emptySubtitle: 'ཤུལ་མམ་ཉོ་བའི་ཆེད་དུ་ཐེབས་འདོན་ཐོ་ནང་སྣོན།',
		viewProducts: 'ཐེབས་ལྟ།',
		addToCart: 'ཀརཊ་ནང་བཙུགས།',
		view: 'ལྟ།'
	},
	addresses: {
		header: 'ངའི་ཁ་བྱང་',
		subheader: 'གཏོང་ལེན་གི་ཆེད་དུ་སྲུངས་པའི་ཁ་བྱང་',
		addNew: 'ཁ་བྱང་གསརཔ་སྣོན།',
		edit: 'ཞུན་དག',
		delete: 'བསུབས།'
	},
	payments: {
		header: 'དངུལ་སྤྲོད་ཐབས་',
		subheader: 'ཁྱེད་ཀྱིས་སྲུངས་པའི་དངུལ་སྤྲོད་ཐབས་',
		addNew: 'ཐབས་ལམ་གསརཔ་སྣོན།'
	},
	recommended: {
		header: 'ཁྱེད་ལུ་འོས་སྦྱོར་བྱས་པ་',
		subheader: 'ཁྱེད་ཀྱི་དགའ་གདམ་ལག་ལེན་གིས་འདེམས་པའི་ཐེབས་',
		product: (n) => `འོས་སྦྱོར་ཐེབས་ ${n}`,
		storeName: 'ཚོང་ཁང་མིང་'
	},
	dialogs: {
		address: {
			title: 'ཁ་བྱང་གསརཔ་སྣོན།',
			type: 'ཁ་བྱང་དབྱེ་བ་',
			types: { home: 'ཁྱིམ་', office: 'ཡར་ཁུལ་' },
			detail: 'ཁ་བྱང་ཆ་ཚང་',
			phone: 'ཁ་པར་ཨང་',
			cancel: 'ཆ་མེད་',
			save: 'སྲུངས།'
		},
		payment: {
			title: 'དངུལ་སྤྲོད་ཐབས་གསརཔ་སྣོན།',
			type: 'དངུལ་སྤྲོད་དབྱེ་བ་',
			types: { card: 'ཤོག་བྱང་', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
			numberCard: 'ཤོག་བྱང་ཨང་',
			numberAccount: 'རྩིས་ཨང་',
			expiry: 'དུས་ཡུན་ (MM/YY)',
			cancel: 'ཆ་མེད་',
			save: 'སྲུངས།'
		},
		order: {
			title: 'གནང་བ་ཞིབ་བརྗོད་',
			orderId: (id) => `གནང་ཨང་: #${id}`,
			orderInfo: 'གནང་བ་གནས་ཚུལ་',
			deliveryInfo: 'གཏོང་ལེན་གནས་ཚུལ་',
			status: 'གནས་ཚད་:',
			tracking: 'རྗེས་འཚོལ།',
			trackingNote: 'རྗེས་འཚོལ་སྒྲོམ་ལུ་ཨེབ་གཏང་ དེ་ལས་རྒྱས་བཤད་',
			summary: 'གནང་བ་གནས་བསྡུས་',
			close: 'ཁ་བསྡམས།'
		}
	}
};

export default customerDashboardBt;


