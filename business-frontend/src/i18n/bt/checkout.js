const checkoutBt = {
	header: {
		title: '🛒 ཞབས་ཞུ་མཇུག་བསྡུས།',
		subtitle: 'གནང་བ་མཇུག་བསྡུས་ལེན་ནིའི་རིམ་པ་འོག་ལུ་འགྲུབ་གནང་།'
	},
	steps: ['གནང་བའི་གསལ་བཤད་', 'གཏོང་ལེན་གནས་ཚུལ་', 'དངུལ་སྤྲོད་', 'ངེས་གཏན་'],
	order: {
		details: 'གནང་བའི་གསལ་བཤད་',
		verify: 'ཁྱེད་ཀྱིས་བསྒྲུབས་ཡོད་པའི་ཐེབས་ཚུ་ལྟ་བཤེར་འབད།',
		subtotal: 'བསྡུས་རྩིས་',
		delivery: 'གཏོང་ལེན་གློག་འཕྲིན་',
		free: 'རིན་མེད་ 🎉',
		total: 'བསྡུས་བཅད་',
		goToShipping: 'གཏོང་ལེན་ལུ་འགྱོ།'
	},
	shipping: {
		title: 'གཏོང་ལེན་གནས་ཚུལ་',
		desc: 'གཏོང་ལེན་ལེགས་ཤོས་བྱེད་ནིའི་ཆེད་དུ་ངེས་པའི་གནས་ཚུལ་བྱིན།',
		fullName: 'མིང་ཆ་ *',
		email: 'ཨེ་མེལ *',
		phone: 'ཁ་པར་ཨང་ *',
		district: 'ལྷོད་ཁུལ་ *',
		noDistrict: 'ལྷོད་ཁུལ་མ་པ་ཐོབ།',
		searchDistrict: 'ལྷོད་ཁུལ་འཚོལ།...',
		city: 'གྲོང་ཁྱེར/ཡུལ་ཚོམ་ *',
		postal: 'འགྲེམས་ཨང་',
		address: 'གནས་ཡུལ་ཆ་ཚང་ *',
		addressPh: 'ཁྱིམ/ཨፍ་ལེབ་ཨང་ སྐོར་ལམ་ ཁྲོམ་སྡེ་',
		instruction: 'གཏོང་ལེན་བསམ་བཀོད་ (གདམ་ཁ)',
		instructionPh: 'དཔེར་ན་ལྕགས་འདབ་ལུ་བཞག་ གཏོང་ལེན་སྔ་གོང་ལས་སྐུ་ཞབས་འབོད་',
		prev: 'རྒྱབར་',
		goToPayment: 'དངུལ་སྤྲོད་ལུ་འགྱོ།',
		notice: '📍 Grameenbazar དང་ Grameen Delivery ཞབས་ཞུའི་ཁུལ་ནང་: ཆུ་ཚོད་ནང་དུ་གཏོང་ལེན། ཁུལ་ཕྱི་ནང་ (རྒྱལ་ཡོངས་): ཉིན་ 2-3 ནང་',
		errors: {
			fullName: 'མིང་ཆ་དགོས།',
			email: 'ནུས་ལྡན་ཨེ་མེལ་དགོས།',
			phone: 'ནུས་ལྡན་ཁ་པར་ཨང་དགོས།',
			address: 'ཁ་བྱང་དགོས།',
			city: 'གྲོང་ཁྱེར་དགོས།',
			district: 'ལྷོད་ཁུལ་གདམ་ཁ་རྐྱབས།'
		}
	},
	payment: {
		title: 'དངུལ་སྤྲོད་ཐབས་ལམ་',
		desc: 'ཁྱེད་རང་ལྟེར་སྐྱེལ་བྱེད་སྲིད་པའི་ཐབས་ལམ་གདམ།',
		info: 'དངུལ་སྤྲོད་གནས་ཚུལ་',
		mobile: 'ཁ་པར་ཨང་ *',
		cardNumber: 'ཤོག་བྱང་ཨང་ *',
		cardHolder: 'ཤོག་བྱང་བདག་ *',
		expiry: 'དུས་ཚོད་རྫོགས་ *',
		cvv: 'CVV *',
		recommended: 'གདམ་ཁ་ཁྱབ་',
		cashSelectedTitle: '🎉 འབྲིང་ལས་དངུལ་གདམ་ཁ་རྐྱབས་ཡོད! ',
		cashSelectedDesc: 'ཐེབས་འབྱོར་སྐབས་སྤྲོད་དངུལ་འབད། སྔོན་སྤྲོད་མི་དགོས།',
		orderSummary: '💰 གནང་བ་གནས་བསྡུས་',
		paymentFee: 'དངུལ་སྤྲོད་བཅའ་གཏན་',
		labels: {
			mobilePh: '01XXXXXXXXX',
			cardNumberPh: '1234 5678 9012 3456',
			expiryPh: 'MM/YY',
			cvvPh: '123'
		},
		prev: 'རྒྱབར་',
		confirm: 'གནང་བ་ངེས་གཏན་འབད།',
		processing: 'གནང་བ་ལས་སྦྱོར་འབད་དོ་...'
	},
	sidebar: {
		orderSummary: 'གནང་བ་གནས་བསྡུས་',
		moreItems: (n) => `+${n} ཐེབས་ཧེང་བཀལ་...`,
		notices: {
			securePayment: 'མཐའ་བཙན་དངུལ་སྤྲོད་',
			fastDelivery: 'མྱུར་མགྱོགས་གཏོང་ལེན་',
			warranty: 'གཏོང་སྲོལ་གཏུག་རྒྱུད་དང་བཅས་'
		}
	},
	success: {
		title: 'གནང་བ་མཐར་འཁྱོལ་བྱུང་! ',
		orderNo: (id) => `གནང་ཨང་: #${id}`,
		desc: 'ཁྱེད་ཀྱི་གནང་བ་ཐོབ་ཡོད། ང་ཚོས་དེ་མགྱོགས་སུ་འབྲེལ་བ་འབད་ནི་ཨིན།',
		deliveryInfo: 'གཏོང་ལེན་གནས་ཚུལ་',
		track: 'གནང་བ་རྗེས་འཚོལ།',
		home: 'ཁྱིམ་ལུ་འགྱོ།',
		fields: {
			name: 'མིང་',
			phone: 'ཁ་པར་',
			address: 'ཁ་བྱང་',
			payment: 'དངུལ་སྤྲོད་',
			total: 'བསྡུས་བཅད་'
		}
	},
	guards: {
		cartEmpty: 'ཁྱེད་ཀྱི་ཀརཊ་སྟོང་པ་རེད། ཐེབས་ཁ་ཤས་སྣ་ཚོགས་སྣོན་གནང་།',
		startShopping: 'ཉོ་ཚོང་འགོ་འབྱེད།'
	},
	paymentMethods: {
		cash: { name: 'འབྲིང་ལས་དངུལ་', desc: 'ཐེབས་འབྱོར་སྐབས་སྤྲོད་དངུལ་', fee: 0 },
		bkash: { name: 'bKash', desc: 'bKash གྱིས་སྤྲོད་དངུལ་', fee: 0 },
		nagad: { name: 'Nagad', desc: 'Nagad གྱིས་སྤྲོད་དངུལ་', fee: 0 },
		rocket: { name: 'Rocket', desc: 'Rocket གྱིས་སྤྲོད་དངུལ་', fee: 0 },
		card: { name: 'ཤོག་བྱང་', desc: 'Visa, MasterCard སོགས་', fee: 25 },
		bank: { name: 'དངུལ་ཁང་', desc: 'དངུལ་ཁང་ལུ་སྤྲོད་', fee: 15 }
	}
};

export default checkoutBt;


