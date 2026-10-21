const customerDashboardDe = {
	hero: {
		welcome: (name) => `Willkommen, ${name}!`,
		subtitle: 'Ihr Dashboard. Besuchen Sie Produktseiten, um weiter einzukaufen'
	},
	stats: {
		totalOrders: 'Gesamtbestellungen',
		totalSpent: 'Insgesamt ausgegeben',
		points: 'Punkte',
		nextReward: 'Nächste Belohnung'
	},
	labels: {
		memberSinceSuffix: 'Mitglied seit',
		order: 'Bestellung',
		itemsSuffix: 'Artikel',
		phone: 'Telefon:',
		default: 'Standard',
		home: 'Zuhause',
		office: 'Büro',
		expires: 'Läuft ab',
		store: 'Shop:',
		orderNumber: 'Bestell-Nr:',
		orderDate: 'Bestelldatum:',
		totalItems: 'Gesamtartikel:',
		totalAmount: 'Gesamtbetrag:'
	},
	sidebar: {
		title: 'Dashboard-Menü',
		orders: 'Meine Bestellungen',
		wishlist: 'Wunschliste',
		addresses: 'Adressen',
		payments: 'Zahlungsmethoden',
		editProfile: 'Profil bearbeiten'
	},
	orders: {
		header: 'Meine Bestellungen',
		subheader: 'Liste und Status Ihrer Bestellungen ansehen',
		support: 'Kundensupport',
		status: {
			delivered: 'Geliefert',
			shipped: 'Versandt',
			processing: 'In Bearbeitung',
			pending: 'Ausstehend'
		},
		tracking: 'Verfolgen',
		viewDetails: 'Details ansehen',
		emptyTitle: 'Noch keine Bestellungen',
		emptySubtitle: 'Sie haben noch nichts bestellt. Jetzt einkaufen!',
		startShopping: 'Jetzt einkaufen'
	},
	wishlist: {
		header: 'Meine Wunschliste',
		subheader: 'Für später gespeicherte Artikel',
		emptyTitle: 'Ihre Wunschliste ist leer',
		emptySubtitle: 'Fügen Sie Produkte hinzu, um sie später zu kaufen.',
		viewProducts: 'Produkte ansehen',
		addToCart: 'In den Warenkorb',
		view: 'Ansehen'
	},
	addresses: {
		header: 'Meine Adressen',
		subheader: 'Gespeicherte Lieferadressen',
		addNew: 'Neue Adresse hinzufügen',
		edit: 'Bearbeiten',
		delete: 'Löschen'
	},
	payments: {
		header: 'Zahlungsmethoden',
		subheader: 'Ihre gespeicherten Zahlungsmethoden',
		addNew: 'Neue Zahlungsmethode hinzufügen'
	},
	recommended: {
		header: 'Für Sie empfohlen',
		subheader: 'Sorgfältig ausgewählte Produkte basierend auf Ihren Vorlieben',
		product: (n) => `Empfohlenes Produkt ${n}`,
		storeName: 'Shop-Name'
	},
	dialogs: {
		address: {
			title: 'Neue Adresse hinzufügen',
			type: 'Adresstyp',
			types: { home: 'Zuhause', office: 'Büro' },
			detail: 'Vollständige Adresse',
			phone: 'Telefonnummer',
			cancel: 'Abbrechen',
			save: 'Speichern'
		},
		payment: {
			title: 'Neue Zahlungsmethode hinzufügen',
			type: 'Zahlungsart',
			types: { card: 'Kreditkarte', bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' },
			numberCard: 'Kartennummer',
			numberAccount: 'Kontonummer',
			expiry: 'Ablauf (MM/JJ)',
			cancel: 'Abbrechen',
			save: 'Speichern'
		},
		order: {
			title: 'Bestelldetails',
			orderId: (id) => `Bestell-ID: #${id}`,
			orderInfo: 'Bestellinformationen',
			deliveryInfo: 'Lieferinformationen',
			status: 'Status:',
			tracking: 'Verfolgen',
			trackingNote: 'Klicken Sie auf Verfolgen für Details',
			summary: 'Bestellübersicht',
			close: 'Schließen'
		}
	}
};

export default customerDashboardDe;


