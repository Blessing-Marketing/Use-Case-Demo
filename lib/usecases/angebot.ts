import type { UseCase } from "./typen";

export const angebot: UseCase = {
  slug: "angebot",
  kicker: "Vertrieb",
  name: "Vom Anruf zum fertigen Angebot",
  versprechen: "Die Anfrage von heute Morgen ist heute Mittag ein prüffähiges Angebot.",
  beschreibung:
    "Aus einer formlosen Anfrage entsteht ein vollständiges Angebot: Positionen aus dem Katalog, Ihre Preislogik, Ihr Layout. Der Vertrieb prüft und gibt frei.",
  ausloeser: "Anfrage per E-Mail, Formular oder Telefonnotiz",
  ergebnis: "Angebots-PDF im Postausgang, Wiedervorlage gesetzt",
  manuellMinuten: 38,
  autoSekunden: 9,
  menge: { proTag: 12, einheit: "Angebote", einheitEinzahl: "Angebot" },
  systeme: ["ERP / Warenwirtschaft", "Preisliste", "CRM", "DMS"],
  vorteile: [
    {
      titel: "Antwort am selben Tag",
      text: "Wer zuerst ein sauberes Angebot auf dem Tisch hat, gewinnt häufiger. Der Ablauf verkürzt das von Tagen auf Stunden.",
    },
    {
      titel: "Keine Rechenfehler",
      text: "Staffelpreise, Kundenrabatte und Zuschläge kommen aus Ihrem System, nicht aus dem Kopf.",
    },
    {
      titel: "Auch bei krummen Anfragen",
      text: "„2 Stück von dem breiten Modell wie letztes Jahr“ wird korrekt zugeordnet, weil die Historie mitgelesen wird.",
    },
  ],
  stationen: [
    {
      id: "anfrage",
      station: "Anfrage",
      titel: "Anfrage aufnehmen",
      detail: "Egal ob Mail, Formular oder abgetippte Telefonnotiz – der Ablauf startet gleich.",
      sekunden: 0.4,
      beleg: {
        art: "mail",
        von: "einkauf@stellwerk-gmbh.de",
        betreff: "Anfrage Ersatzteile + Wartungspaket",
        zeilen: [
          "Hallo zusammen,",
          "wir bräuchten 12 Führungsschienen in der breiten Ausführung wie letztes Jahr, dazu 4 Antriebseinheiten.",
          "Wartungspaket für 12 Monate bitte mit anbieten. Lieferung nach Bremen, Zahlung wie gehabt.",
          "Danke und Gruß",
        ],
      },
    },
    {
      id: "positionen",
      station: "Positionen",
      titel: "Artikel zuordnen",
      detail: "Die Beschreibung wird auf echte Artikelnummern aus Ihrem Katalog übersetzt.",
      sekunden: 2.4,
      beleg: {
        art: "tabelle",
        titel: "Zuordnung aus Katalog und Bestellhistorie",
        kopf: ["Anfrage", "Artikel", "Nr.", "Menge"],
        zeilen: [
          ["„breite Führungsschiene wie letztes Jahr“", "Führungsschiene FS-80 breit", "41-0802", "12"],
          ["„Antriebseinheiten“", "Antrieb AE-2 24V", "52-2401", "4"],
          ["„Wartungspaket 12 Monate“", "Wartung Basis, 12 Mon.", "90-1201", "1"],
        ],
      },
    },
    {
      id: "preis",
      station: "Preis",
      titel: "Konditionen rechnen",
      detail: "Kundenrabatt, Staffelpreis und Zuschläge kommen direkt aus Ihrem System.",
      sekunden: 1.6,
      beleg: {
        art: "felder",
        titel: "Preisfindung",
        zeilen: [
          { feld: "Preisliste", wert: "Gewerbe 2026" },
          { feld: "Kundenrabatt", wert: "−8 %", hinweis: "Rahmenvertrag seit 2021" },
          { feld: "Staffel ab 10 Stück", wert: "−4 % auf Pos. 1" },
          { feld: "Fracht Bremen", wert: "+ 89,00 €" },
          { feld: "Zahlungsziel", wert: "30 Tage netto, 2 % Skonto bei 10 Tagen" },
        ],
      },
    },
    {
      id: "dokument",
      station: "Dokument",
      titel: "Angebot erzeugen",
      detail: "Ihr Layout, Ihre Textbausteine, Ihre Nummernkreise.",
      sekunden: 2.6,
      beleg: {
        art: "dokument",
        titel: "Angebot A-2026-0413",
        untertitel: "Stellwerk GmbH · Bremen · gültig 30 Tage",
        positionen: [
          { text: "12 × Führungsschiene FS-80 breit", wert: "4.464,00 €" },
          { text: "4 × Antrieb AE-2 24V", wert: "2.836,00 €" },
          { text: "Wartung Basis, 12 Monate", wert: "1.140,00 €" },
          { text: "Fracht", wert: "89,00 €" },
        ],
        summe: { text: "Summe netto", wert: "8.529,00 €" },
      },
    },
    {
      id: "freigabe",
      station: "Freigabe",
      titel: "Prüfen lassen",
      detail: "Vor dem Versand schaut ein Mensch drauf – mit allem, was auffällig ist, in einer Liste.",
      sekunden: 1.4,
      beleg: {
        art: "pruefung",
        titel: "Was vor dem Versand geprüft wurde",
        punkte: [
          { text: "Alle Positionen lieferbar", stand: "ok", hinweis: "Bestand geprüft" },
          { text: "Marge über Mindestmarge", stand: "ok", hinweis: "31,4 %" },
          { text: "Antrieb AE-2 mit 3 Wochen Lieferzeit", stand: "warnung", hinweis: "im Angebot vermerkt" },
          { text: "Freigabe durch Vertrieb erforderlich", stand: "info", hinweis: "ab 5.000 €" },
        ],
      },
    },
    {
      id: "versand",
      station: "Versand",
      titel: "Rausschicken und nachfassen",
      detail: "Angebot geht raus, die Wiedervorlage steht automatisch im Kalender.",
      sekunden: 0.8,
      beleg: {
        art: "uebergabe",
        kanal: "E-Mail + CRM",
        ziel: "einkauf@stellwerk-gmbh.de",
        betreff: "Ihr Angebot A-2026-0413",
        hinweis: "Nachfassen am 5. Tag, zweite Erinnerung 3 Tage vor Ablauf",
      },
    },
  ],
};
