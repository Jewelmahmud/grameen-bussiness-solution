const privacyPolicyDe = {
	breadcrumbs: { home: 'Startseite', title: 'Datenschutzrichtlinie' },
	hero: {
		title: 'Datenschutzrichtlinie',
		subtitle: 'Der Schutz Ihrer personenbezogenen Daten und Privatsphäre hat für uns Priorität'
	},
	principles: [
		{ title: 'Datensicherheit', description: 'Wir speichern Ihre persönlichen Daten mit höchster Sicherheit' },
		{ title: 'Transparenz', description: 'Wir erklären klar, was wir sammeln und warum' },
		{ title: 'Nutzerkontrolle', description: 'Sie haben die volle Kontrolle über Ihre Informationen' },
		{ title: 'Privatsphärenschutz', description: 'Ohne Ihre Zustimmung teilen wir nicht' }
	],
	dataTypes: [
		{ category: 'Personenbezogene Daten', items: ['Name', 'Telefonnummer', 'E-Mail-Adresse', 'Geburtsdatum'], purpose: 'Konto erstellen und verwalten' },
		{ category: 'Adressdaten', items: ['Heimatadresse', 'Lieferadresse', 'Upazila', 'Bezirk'], purpose: 'Lieferung und lokale Dienste' },
		{ category: 'Zahlungsdaten', items: ['Mobile-Banking-Nr.', 'Bankkonto', 'Transaktionsverlauf'], purpose: 'Sichere Zahlungsabwicklung' },
		{ category: 'Nutzungsdaten', items: ['App-Nutzungshistorie', 'Suchvorgänge', 'Wunschliste'], purpose: 'Personalisierte Erfahrungen bieten' }
	],
	usage: {
		title: 'Wie wir Informationen verwenden',
		primaryTitle: 'Primäre Verwendungen',
		primary: ['Konto erstellen und verwalten', 'Bestellungen und Lieferungen abwickeln', 'Kundensupport bereitstellen', 'Zahlungen verarbeiten'],
		improveTitle: 'Verbesserungszwecke',
		improve: ['Personalisierte Empfehlungen', 'Verbesserung der Servicequalität', 'Sicherheit und Betrugsprävention', 'Marktforschung und Analytik']
	},
	rights: {
		title: 'Ihre Rechte',
		items: [
			{ right: 'Recht auf Auskunft', description: 'Erfahren Sie, welche Daten wir über Sie speichern' },
			{ right: 'Recht auf Berichtigung', description: 'Falsche oder veraltete Daten korrigieren' },
			{ right: 'Recht auf Löschung', description: 'Löschung Ihrer personenbezogenen Daten verlangen' },
			{ right: 'Recht auf Datenübertragbarkeit', description: 'Eine Kopie Ihrer Daten herunterladen' }
		]
	},
	security: {
		title: 'Sicherheitsmaßnahmen',
		intro: 'Wir setzen folgende Maßnahmen zum Schutz Ihrer Daten um:',
		measures: ['SSL-Verschlüsselung', 'Regelmäßige Sicherheitsaudits', 'Zwei-Faktor-Authentifizierung', 'Datensicherung und Wiederherstellung', 'Zugriffskontrollsysteme', 'Regelmäßige Systemupdates']
	},
	cookies: {
		title: 'Cookie-Richtlinie',
		usageTitle: 'Verwendung von Cookies',
		p1: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern und unsere Dienste zu personalisieren. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden.',
		p2: 'Sie können Cookies in den Browsereinstellungen steuern. Das Deaktivieren kann dazu führen, dass einige Dienste nicht richtig funktionieren.'
	},
	sharing: {
		title: 'Weitergabe an Dritte',
		intro: 'Wir können Informationen in folgenden Fällen an Dritte weitergeben:',
		authorizedTitle: 'Autorisierte Weitergabe',
		notDoTitle: 'Was wir nicht tun',
		authorized: ['Lieferpartner (für Adressen)', 'Zahlungsanbieter (für Transaktionen)', 'Gesetzliche Anforderungen (per Gerichtsbeschluss)'],
		notDo: ['Verkauf an Werbetreibende', 'Nutzung für Marketing ohne Zustimmung', 'Weitergabe an unnötige Dritte']
	},
	retention: {
		title: 'Aufbewahrungsrichtlinie',
		retentionTitle: 'Aufbewahrungszeitraum',
		retentionText: 'Wir bewahren Ihre personenbezogenen Daten so lange auf, wie Ihr Konto aktiv ist oder wie es zur Bereitstellung der Dienste erforderlich ist.',
		deleteTitle: 'Löschung',
		deleteText: 'Nach Schließung des Kontos löschen wir Ihre personenbezogenen Daten innerhalb von 30 Tagen, sofern gesetzlich nichts anderes vorgeschrieben ist.'
	},
	updates: {
		title: 'Aktualisierung der Richtlinie',
		alert: 'Diese Datenschutzrichtlinie kann von Zeit zu Zeit aktualisiert werden',
		notify: 'Wir informieren Sie per E-Mail oder App-Benachrichtigungen über Änderungen. Bei wesentlichen Änderungen holen wir Ihre Zustimmung ein.',
		lastUpdatedPrefix: 'Zuletzt aktualisiert:',
		lastUpdatedDate: 'Dezember 2023'
	},
	contact: {
		title: 'Kontakt Datenschutz',
		subtitle: 'Kontaktieren Sie uns bei Fragen zu dieser Richtlinie oder Ihren personenbezogenen Daten',
		button: 'Kontaktieren Sie uns',
		email: 'privacy@grameenbazar.com'
	}
};

export default privacyPolicyDe;


