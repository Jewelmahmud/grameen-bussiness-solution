const storeDetailDe = {
	breadcrumbs: { home: 'Startseite', bazars: 'Bazare' },
	loading: 'Laden der Shop-Details...',
	verified: 'Verifizierter Shop',
	locatedIn: (place) => `📍 In ${place} gelegen`,
	tabs: { products: 'Produkte', about: 'Über uns', reviews: 'Bewertungen' },
	common: { all: 'Alle' },
	labels: {
		products: 'Produkte',
		premiumStore: 'Premium-Shop',
		stock: 'Bestand:',
		totalProducts: 'Gesamtprodukte',
		rating: 'Bewertung',
		reviews: 'Bewertungen',
		stars: 'Sterne',
		discount: 'RABATT'
	},
	productsSection: {
		titleWithCount: (count) => `Produkte (${count})`
	},
	about: {
		title: (name) => `Über ${name}`,
		productTypes: '🛍️ Produkttypen',
		stats: '📊 Statistiken'
	},
	review: {
		heading: 'Kundenbewertungen & Kommentare',
		write: 'Bewertung schreiben',
		cancel: 'Abbrechen',
		basedOn: (count) => `Basierend auf ${count} Bewertungen`,
		formTitle: 'Ihre Bewertung schreiben',
		yourName: 'Ihr Name',
		ratingLabel: 'Bewertung vergeben',
		ratingHint: 'Für genaue Bewertung über die Sterne fahren',
		commentPlaceholder: 'Teilen Sie Ihre Erfahrung zu diesem Shop...',
		submit: 'Bewertung abschicken'
	},
	contact: {
		title: '📞 Kontaktinformationen',
		address: 'Adresse',
		phone: 'Telefon',
		email: 'E-Mail',
		website: 'Website'
	},
	hours: {
		title: '🕐 Öffnungszeiten',
		weekdaysLabel: 'Montag - Freitag',
		saturdayLabel: 'Samstag',
		sundayLabel: 'Sonntag'
	},
	buttons: {
		details: 'Details',
		addToCart: 'In die Tasche',
		cancel: 'Abbrechen',
		viewCart: 'Warenkorb ansehen'
	},
	quickStats: {
		title: 'Schnelle Statistiken',
		products: 'Produkte',
		rating: 'Bewertung'
	},
	tooltips: {
		addToWishlist: 'Zur Wunschliste hinzufügen'
	}
};

export default storeDetailDe;


