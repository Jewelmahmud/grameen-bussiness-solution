const emergencyDe = {
	buttons: {
		gas: 'Gaszylinder',
		medicine: 'Notfall-Medizin',
	},
	common: {
		nameLabel: 'Ihr Name',
		phoneLabel: 'Mobilnummer',
		villageLabel: 'Dorf/Gebiet',
		houseNumberLabel: 'Hausnummer',
		detailsLabel: 'Weitere Infos',
		detailsPlaceholder: 'Besondere Hinweise',
		districtLabel: 'Bezirk',
		upazillaLabel: 'Upazila',
		cancel: 'Abbrechen',
	},
	gas: {
		title: 'Gaszylinder-Nachfüllung',
		companyLabel: 'Gasanbieter',
		cylinderSizeLabel: 'Zylindergröße',
		cylinderSizePlaceholder: 'Zylindergröße wählen',
		quantityLabel: 'Menge',
		companies: {
			bashundhara: 'Bashundhara Gas',
			jamuna: 'Jamuna Gas',
			omera: 'Omera Gas',
			beximco: 'Beximco Gas',
			fresh: 'Fresh Gas',
			totalgaz: 'Totalgaz',
			others: 'Andere',
		},
		cylinderSizeOptions: {
			"12kg": '12 kg',
			"33kg": '33 kg',
			"45kg": '45 kg',
		},
		price: {
			header: 'Preisdetails',
			unitPrice: 'Stückpreis',
			subtotal: 'Zwischensumme',
			delivery: 'Liefergebühr',
			total: 'Gesamtsumme',
			note: '* Nachnahme möglich',
			unitSuffix: 'Stk.',
		},
		orderNow: 'Jetzt bestellen',
	},
	medicine: {
		title: 'Notdienst Medizin',
		medicineNameLabel: 'Medikamentenname',
		medicineNamePlaceholder: 'Welches Medikament wird benötigt?',
		urgencyLabel: 'Dringlichkeit',
		urgencyOptions: {
			normal: 'Normal',
			urgent: 'Dringend',
			emergency: 'Notfall',
		},
		prescriptionLabel: 'Rezept (falls vorhanden)',
		prescriptionPlaceholder: 'Ärztliches Rezept oder Details',
		uploadNote: 'Der Upload des Rezepts ist optional; Bild oder PDF möglich.',
		uploadButton: 'Rezept hochladen (optional)',
		selectedFilePrefix: 'Ausgewählte Datei:',
		submit: 'Notfallbestellung aufgeben',
	}
};

export default emergencyDe;


