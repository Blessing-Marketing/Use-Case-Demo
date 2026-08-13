import type { UseCase } from "./typen";

export const onboarding: UseCase = {
  slug: "onboarding",
  kicker: "Personal & IT",
  name: "Der erste Arbeitstag steht von selbst",
  versprechen: "Unterschriebener Vertrag am Montag, komplett eingerichteter Arbeitsplatz am Dienstag.",
  beschreibung:
    "Aus einem unterschriebenen Vertrag entstehen Zugänge, Hardware-Bestellung, Einarbeitungsplan und Erinnerungen – abgestimmt auf die Rolle.",
  ausloeser: "Vertrag unterschrieben zurück",
  ergebnis: "Zugänge, Technik und Einarbeitungsplan vorbereitet",
  manuellMinuten: 210,
  autoSekunden: 12,
  menge: { proTag: 1, einheit: "Eintritte", einheitEinzahl: "Eintritt" },
  systeme: ["Personalsystem", "Active Directory", "Bestellwesen", "Kalender"],
  vorteile: [
    {
      titel: "Kein Fehlstart",
      text: "Der schlechteste erste Eindruck ist ein Arbeitsplatz ohne Laptop. Der Ablauf verhindert genau das.",
    },
    {
      titel: "Rechte nach Rolle, nicht nach Zuruf",
      text: "Wer welchen Zugang bekommt, folgt einem hinterlegten Profil – dokumentiert und beim Austritt genauso wieder abgeräumt.",
    },
    {
      titel: "Entlastet zwei Abteilungen",
      text: "Personal und IT arbeiten dieselbe Liste ab, ohne sie sich gegenseitig hinterherzutragen.",
    },
  ],
  stationen: [
    {
      id: "ausloeser",
      station: "Auslöser",
      titel: "Vertrag kommt zurück",
      detail: "Der unterschriebene Vertrag startet alles Weitere.",
      sekunden: 0.5,
      beleg: {
        art: "felder",
        titel: "Aus dem Personalsystem",
        zeilen: [
          { feld: "Name", wert: "Jonas Weber" },
          { feld: "Rolle", wert: "Servicetechniker Außendienst" },
          { feld: "Abteilung", wert: "Service Nord" },
          { feld: "Eintritt", wert: "Mo, 01.04.2026" },
          { feld: "Führungskraft", wert: "S. Petrov" },
          { feld: "Arbeitsort", wert: "Standort Hamburg, überwiegend beim Kunden" },
        ],
      },
    },
    {
      id: "profil",
      station: "Profil",
      titel: "Rollenprofil ableiten",
      detail: "Aus der Rolle ergibt sich, was diese Person braucht – und was nicht.",
      sekunden: 1.8,
      beleg: {
        art: "pruefung",
        titel: "Profil „Servicetechniker Außendienst“",
        punkte: [
          { text: "Mobiler Arbeitsplatz statt Bürorechner", stand: "ok" },
          { text: "Zugriff auf Serviceaufträge und Ersatzteilkatalog", stand: "ok" },
          { text: "Kein Zugriff auf Personal- und Finanzdaten", stand: "info" },
          { text: "Führerschein und Fahrzeugzuteilung erforderlich", stand: "warnung", hinweis: "Fuhrpark informieren" },
          { text: "Sicherheitsunterweisung vor erstem Kundeneinsatz", stand: "warnung" },
        ],
      },
    },
    {
      id: "zugaenge",
      station: "Zugänge",
      titel: "Konten und Rechte anlegen",
      detail: "Alle Systeme in einem Durchgang – nach Profil, nicht nach Zuruf.",
      sekunden: 3.2,
      beleg: {
        art: "tabelle",
        titel: "Angelegt und dokumentiert",
        kopf: ["System", "Zugang", "Rechte", "Status"],
        zeilen: [
          ["Microsoft 365", "j.weber@…", "Standard + Teams Service", "angelegt"],
          ["Serviceportal", "j.weber", "Techniker mobil", "angelegt"],
          ["Ersatzteilkatalog", "j.weber", "Lesen + Bestellen bis 500 €", "angelegt"],
          ["Zeiterfassung", "Personalnr. 4471", "Außendienst", "angelegt"],
          ["Gebäudezutritt HH", "Karte 0-4471", "Werkstatt, Lager", "beantragt"],
        ],
      },
    },
    {
      id: "technik",
      station: "Technik",
      titel: "Ausstattung bestellen",
      detail: "Bestellt mit Liefertermin vor dem ersten Arbeitstag.",
      sekunden: 2.4,
      beleg: {
        art: "dateien",
        titel: "Bestellung B-2026-1140 · Liefertermin 27.03.",
        eintraege: [
          { name: "Notebook 14″ robust", typ: "1 Stück", hinweis: "vorkonfiguriert nach Profil" },
          { name: "Diensthandy", typ: "1 Stück", hinweis: "Nummer bereits reserviert" },
          { name: "Werkzeugkoffer Service", typ: "1 Satz" },
          { name: "Arbeitskleidung Gr. 52", typ: "3 Sätze", hinweis: "Größe aus Vertragsanlage" },
        ],
      },
    },
    {
      id: "plan",
      station: "Plan",
      titel: "Einarbeitung planen",
      detail: "Die erste Woche steht als Kalender – mit Personen, nicht nur mit Themen.",
      sekunden: 3.4,
      beleg: {
        art: "dokument",
        titel: "Einarbeitungsplan Woche 1",
        untertitel: "Jonas Weber · Service Nord · ab 01.04.",
        positionen: [
          { text: "Mo 09:00 · Begrüßung, Rundgang, Technik", wert: "S. Petrov" },
          { text: "Mo 13:00 · Sicherheitsunterweisung", wert: "Pflicht" },
          { text: "Di 09:00 · Serviceportal und Auftragsablauf", wert: "M. Ott" },
          { text: "Mi ganztags · Mitfahrt beim Kundeneinsatz", wert: "T. Kranz" },
          { text: "Fr 14:00 · Rückblick erste Woche", wert: "S. Petrov" },
        ],
      },
    },
    {
      id: "erinnerung",
      station: "Erinnerung",
      titel: "Nachhalten",
      detail: "Die Termine, die sonst untergehen, stehen jetzt fest im Kalender.",
      sekunden: 0.7,
      beleg: {
        art: "felder",
        titel: "Automatische Wiedervorlagen",
        zeilen: [
          { feld: "27.03.", wert: "Technik-Lieferung prüfen" },
          { feld: "31.03.", wert: "Zutrittskarte abholbereit?" },
          { feld: "01.04.", wert: "Begrüßungsnachricht ans Team" },
          { feld: "29.04.", wert: "Feedbackgespräch nach 4 Wochen" },
          { feld: "01.10.", wert: "Ende Probezeit – Entscheidung" },
        ],
      },
    },
  ],
};
