const checkoutDe = {
	header: {
		title: '🛒 Zur Kasse',
		subtitle: 'Folgen Sie den Schritten, um Ihre Bestellung abzuschließen'
	},
	steps: ['Bestellung', 'Lieferadresse', 'Zahlung', 'Bestätigung'],
	order: {
		details: 'Bestelldetails',
		verify: 'Bitte prüfen Sie die von Ihnen bestellten Artikel',
		subtotal: 'Zwischensumme',
		delivery: 'Liefergebühr',
		free: 'Gratis 🎉',
		total: 'Gesamt',
		goToShipping: 'Zur Lieferung'
	},
	shipping: {
		title: 'Lieferinformationen',
		desc: 'Bitte geben Sie korrekte Lieferinformationen an',
		fullName: 'Vollständiger Name *',
		email: 'E-Mail *',
		phone: 'Telefonnummer *',
		district: 'Bezirk *',
		noDistrict: 'Kein Bezirk gefunden',
		searchDistrict: 'Bezirk suchen...',
		city: 'Stadt/Upazila *',
		postal: 'Postleitzahl',
		address: 'Vollständige Adresse *',
		addressPh: 'Haus-/Wohnungsnr., Straße, Gebiet',
		instruction: 'Lieferhinweise (optional)',
		instructionPh: 'Hinweise z. B. am Tor ablegen, vorher anrufen',
		prev: 'Zurück',
		goToPayment: 'Weiter zur Zahlung',
		notice: '📍 Innerhalb der Grameenbazar & Grameen Delivery Gebiete: Lieferung innerhalb von Stunden; außerhalb (landesweit): innerhalb von 2-3 Tagen',
		errors: {
			fullName: 'Vollständiger Name ist erforderlich',
			email: 'Gültige E-Mail ist erforderlich',
			phone: 'Gültige bangladeschische Telefonnummer erforderlich',
			address: 'Adresse ist erforderlich',
			city: 'Stadt ist erforderlich',
			district: 'Bitte Bezirk auswählen'
		}
	},
	payment: {
		title: 'Zahlungsmethode',
		desc: 'Wählen Sie Ihre bevorzugte Zahlungsmethode',
		info: 'Zahlungsinformationen',
		mobile: 'Mobilnummer *',
		cardNumber: 'Kartennummer *',
		cardHolder: 'Karteninhaber *',
		expiry: 'Ablauf *',
		cvv: 'CVV *',
		recommended: 'Empfohlen',
		cashSelectedTitle: '🎉 Nachnahme ausgewählt!',
		cashSelectedDesc: 'Bezahlen Sie bei Lieferung. Keine Vorauszahlung nötig.',
		orderSummary: '💰 Bestellübersicht',
		paymentFee: 'Zahlungsgebühr',
		labels: {
			mobilePh: '01XXXXXXXXX',
			cardNumberPh: '1234 5678 9012 3456',
			expiryPh: 'MM/JJ',
			cvvPh: '123'
		},
		prev: 'Zurück',
		confirm: 'Bestellung bestätigen',
		processing: 'Bestellung wird verarbeitet...'
	},
	sidebar: {
		orderSummary: 'Bestellübersicht',
		moreItems: (n) => `+${n} weitere Artikel...`,
		notices: {
			securePayment: 'Sichere Zahlung',
			fastDelivery: 'Schnelle Lieferung',
			warranty: 'Mit Garantie'
		}
	},
	success: {
		title: 'Bestellung erfolgreich!',
		orderNo: (id) => `Bestellnr.: #${id}`,
		desc: 'Ihre Bestellung ist eingegangen. Wir melden uns in Kürze.',
		deliveryInfo: 'Lieferinformationen',
		track: 'Bestellung verfolgen',
		home: 'Zur Startseite',
		fields: {
			name: 'Name',
			phone: 'Telefon',
			address: 'Adresse',
			payment: 'Zahlung',
			total: 'Gesamt'
		}
	},
	guards: {
		cartEmpty: 'Ihr Warenkorb ist leer. Bitte fügen Sie zuerst Artikel hinzu.',
		startShopping: 'Jetzt einkaufen'
	},
	paymentMethods: {
		cash: { name: 'Nachnahme', desc: 'Zahlen Sie bei Lieferung', fee: 0 },
		bkash: { name: 'bKash', desc: 'Mit bKash bezahlen', fee: 0 },
		nagad: { name: 'Nagad', desc: 'Mit Nagad bezahlen', fee: 0 },
		rocket: { name: 'Rocket', desc: 'Mit Rocket bezahlen', fee: 0 },
		card: { name: 'Kredit-/Debitkarte', desc: 'Visa, MasterCard u.a.', fee: 25 },
		bank: { name: 'Banküberweisung', desc: 'Auf Bankkonto überweisen', fee: 15 }
	}
};

export default checkoutDe;


