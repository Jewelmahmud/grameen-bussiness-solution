const checkoutSl = {
	header: {
		title: '🛒 ගෙවීම්',
		subtitle: 'ඇණවුම සම්පූර්ණ කිරීමට පහත පියවර අනුසරණය කරන්න'
	},
	steps: ['ඇණවුම් විස්තර', 'බෙදාහරිම් තොරතුරු', 'ගෙවීම්', 'තහවුරු කිරීම'],
	order: {
		details: 'ඇණවුම් විස්තර',
		verify: 'ඔබ ඇණවුම් කළ භාණ්ඩ පරීක්ෂා කරන්න',
		subtotal: 'උප සමස්තය',
		delivery: 'බෙදාහැරීම',
		free: 'නොමිලේ 🎉',
		total: 'සම්පූර්ණය',
		goToShipping: 'බෙදාහරිමට යන්න'
	},
	shipping: {
		title: 'බෙදාහරිම් තොරතුරු',
		desc: 'ලබාදීමට නිවැරදි තොරතුරු ලබා දෙන්න',
		fullName: 'සම්පූර්ණ නාමය *',
		email: 'විද්‍යුත් තැපෑල *',
		phone: 'දුරකථන අංකය *',
		district: 'දිස්ත්‍රික්කය *',
		noDistrict: 'දිස්ත්‍රික්කයක් හමු නොවිනි',
		searchDistrict: 'දිස්ත්‍රික්කය සෙවීම...',
		city: 'නගරය/උපසිලාව *',
		postal: 'තැපැල් කේතය',
		address: 'සම්පූර්ණ ලිපිනය *',
		addressPh: 'නිවස/අංකය, වීදිය, ප්‍රදේශය',
		instruction: 'බෙදාහැරීමේ උපදෙස් (විකල්ප)',
		instructionPh: 'විශේෂ සටහන් උදා: ගේට්ටුවේ තබන්න, පෙර ඇමතුමක්',
		prev: 'ආපසු',
		goToPayment: 'ගෙවීම් වෙත',
		notice: '📍 Grameenbazar & Grameen Delivery ප්‍රදේශ අභ්‍යන්තරයේ: පැය කිහිපයකි; පිටත (රට පුරා): දින 2-3',
		errors: {
			fullName: 'සම්පූර්ණ නාමය අවශ්‍යය',
			email: 'වලංගු විද්‍යුත් තැපැල් ලිපිනය අවශ්‍යය',
			phone: 'වලංගු දුරකථන අංකය අවශ්‍යය',
			address: 'ලිපිනය අවශ්‍යය',
			city: 'නගරය අවශ්‍යය',
			district: 'කරුණාකර දිස්ත්‍රික්කයක් තෝරන්න'
		}
	},
	payment: {
		title: 'ගෙවීම් ක්‍රමය',
		desc: 'ඔබ කැමති ගෙවීම් ක්‍රමය තෝරන්න',
		info: 'ගෙවීම් තොරතුරු',
		mobile: 'ජංගම අංකය *',
		cardNumber: 'කාඩ්පත් අංකය *',
		cardHolder: 'කාඩ්පත් හිමියන්ගේ නාමය *',
		expiry: 'කල් ඉකුත් වීම *',
		cvv: 'CVV *',
		recommended: 'නිර්දේශිත',
		cashSelectedTitle: '🎉 ලැබිලිදී ගෙවීම තෝරාගෙන ඇත!',
		cashSelectedDesc: 'ඇණවුම ලැබිලීදී ගෙවන්න. විද්‍යුත් පෙරගෙවීම් නොදරන්න.',
		orderSummary: '💰 ඇණවුම් සාරාංශය',
		paymentFee: 'ගෙවීම් ගාස්තු',
		labels: {
			mobilePh: '01XXXXXXXXX',
			cardNumberPh: '1234 5678 9012 3456',
			expiryPh: 'MM/YY',
			cvvPh: '123'
		},
		prev: 'ආපසු',
		confirm: 'ඇණවුම තහවුරු කරන්න',
		processing: 'ඇණවුම සැකසുന്നു...'
	},
	sidebar: {
		orderSummary: 'ඇණවුම් සාරාංශය',
		moreItems: (n) => `+තවත් අයිතම ${n}...`,
		notices: { securePayment: 'ආරක්ෂිත ගෙවීම්', fastDelivery: 'වේගවත් බෙදාහැරීම', warranty: 'සහතික සමඟ' }
	},
	success: {
		title: 'ඇණවුම සාර්ථකයි!',
		orderNo: (id) => `ඇණවුම් අංකය: #${id}`,
		desc: 'ඔබගේ ඇණවුම ලැබී ඇත. ළඟදීම අප එක්වනු ඇත.',
		deliveryInfo: 'බෙදාහැරීමේ තොරතුරු',
		track: 'ස්ථානය පරීක්ෂා කරන්න',
		home: 'මුලපිට',
		fields: { name: 'නාමය', phone: 'දුරකථන', address: 'ලිපිනය', payment: 'ගෙවීම්', total: 'සම්පූර්ණය' }
	},
	guards: { cartEmpty: 'ඔබගේ කර්ට් හිස්ය. කරුණාකර පළමුව භාණ්ඩ එකතු කරන්න.', startShopping: 'මිලදී ගැනීම prārambha କරන්න' },
	paymentMethods: {
		cash: { name: 'ලැබිලිදී ගෙවීම', desc: 'ඇණවුම ලැබිලීදී ගෙවන්න', fee: 0 },
		bkash: { name: 'bKash', desc: 'bKash මඟින් ගෙවන්න', fee: 0 },
		nagad: { name: 'Nagad', desc: 'Nagad මඟින් ගෙවන්න', fee: 0 },
		rocket: { name: 'Rocket', desc: 'Rocket මඟින් ගෙවන්න', fee: 0 },
		card: { name: 'ක්‍රෙඩිට්/ඩෙබිට් කාඩ්පත', desc: 'Visa, MasterCard ආදිය', fee: 25 },
		bank: { name: 'බැංකු මාරු කිරීම', desc: 'බැංකු ගිණුමට මාරු කරන්න', fee: 15 }
	}
};

export default checkoutSl;


