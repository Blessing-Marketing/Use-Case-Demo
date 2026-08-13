import type { UseCase } from "./typen";

export const lead: UseCase = {
  slug: "lead",
  kicker: "Marketing & Vertrieb",
  name: "Leads kommen vorqualifiziert an",
  versprechen: "Der Vertrieb sieht nicht 40 Formulareinträge, sondern die vier, die sich lohnen.",
  beschreibung:
    "Jede Anfrage über die Website wird angereichert, bewertet und mit Gesprächseinstieg im CRM abgelegt. Passt sie, geht direkt ein Terminvorschlag raus.",
  ausloeser: "Formular auf der Website ausgefüllt",
  ergebnis: "Bewerteter Lead im CRM, Termin vorgeschlagen",
  manuellMinuten: 22,
  autoSekunden: 9,
  menge: { proTag: 18, einheit: "Anfragen", einheitEinzahl: "Anfrage" },
  systeme: ["Website-Formular", "CRM", "Handelsregister", "Kalender"],
  vorteile: [
    {
      titel: "Reaktion in Minuten statt Tagen",
      text: "Wer innerhalb der ersten Stunde antwortet, kommt deutlich häufiger ins Gespräch. Der Ablauf schafft das rund um die Uhr.",
    },
    {
      titel: "Recherche schon erledigt",
      text: "Firmengröße, Branche, Standorte und bisheriger Kontakt stehen im Lead, bevor jemand zum Hörer greift.",
    },
    {
      titel: "Klare Priorität",
      text: "Die Bewertung folgt Ihren Kriterien und ist nachvollziehbar begründet – nicht nach Bauchgefühl.",
    },
  ],
  stationen: [
    {
      id: "eingang",
      station: "Eingang",
      titel: "Formular kommt rein",
      detail: "Sechs Felder, mehr will man einem Interessenten nicht zumuten.",
      sekunden: 0.4,
      beleg: {
        art: "felder",
        titel: "Formular „Beratung anfragen“",
        zeilen: [
          { feld: "Name", wert: "Dr. Petra Lindner" },
          { feld: "Firma", wert: "Vollmer Kunststofftechnik" },
          { feld: "E-Mail", wert: "p.lindner@vollmer-kt.de" },
          { feld: "Anliegen", wert: "Wir suchen eine Lösung für die Auftragserfassung, aktuell alles per Excel." },
          { feld: "Zeitrahmen", wert: "Im nächsten Quartal" },
          { feld: "Eingang", wert: "Sa, 22:14 Uhr" },
        ],
      },
    },
    {
      id: "anreichern",
      station: "Anreichern",
      titel: "Firmendaten ergänzen",
      detail: "Öffentlich verfügbare Informationen werden ergänzt, damit das Gespräch fundiert startet.",
      sekunden: 2.6,
      beleg: {
        art: "felder",
        titel: "Ergänzt aus öffentlichen Quellen",
        zeilen: [
          { feld: "Rechtsform", wert: "GmbH & Co. KG", hinweis: "Handelsregister" },
          { feld: "Mitarbeitende", wert: "ca. 140" },
          { feld: "Branche", wert: "Kunststoffverarbeitung, Automotive-Zulieferer" },
          { feld: "Standorte", wert: "Schwäbisch Gmünd, Plzeň (CZ)" },
          { feld: "Position", wert: "Kaufmännische Leitung", hinweis: "Website Impressum" },
          { feld: "Bisheriger Kontakt", wert: "Messebesuch 09/2025", hinweis: "aus CRM" },
        ],
      },
    },
    {
      id: "bewerten",
      station: "Bewerten",
      titel: "Passung einschätzen",
      detail: "Nach Ihren Kriterien – und die Begründung steht dabei.",
      sekunden: 1.6,
      beleg: {
        art: "bewertung",
        text: "Passung zum Zielkundenprofil",
        wert: 84,
        max: 100,
        faktoren: [
          { text: "Unternehmensgröße im Zielkorridor", delta: "+25" },
          { text: "Konkreter Anlass genannt (Excel-Ablösung)", delta: "+22" },
          { text: "Entscheidungsbefugte Position", delta: "+20" },
          { text: "Zeitrahmen im nächsten Quartal", delta: "+17" },
          { text: "Kein Budget genannt", delta: "−10" },
        ],
      },
    },
    {
      id: "crm",
      station: "CRM",
      titel: "Lead anlegen",
      detail: "Vollständiger Datensatz statt Notizzettel – inklusive Gesprächseinstieg.",
      sekunden: 1.2,
      beleg: {
        art: "felder",
        titel: "Neuer Lead im CRM",
        zeilen: [
          { feld: "Stufe", wert: "Qualifiziert – A" },
          { feld: "Zuständig", wert: "Vertrieb Süd · T. Ahrens" },
          { feld: "Quelle", wert: "Website / Beratungsformular" },
          { feld: "Gesprächseinstieg", wert: "Excel-Ablösung in der Auftragserfassung, zwei Standorte" },
          { feld: "Nächster Schritt", wert: "Erstgespräch 20 Min." },
        ],
      },
    },
    {
      id: "termin",
      station: "Termin",
      titel: "Termin vorschlagen",
      detail: "Die Antwort geht direkt raus – mit freien Zeiten aus dem echten Kalender.",
      sekunden: 2.2,
      beleg: {
        art: "dialog",
        beitraege: [
          {
            rolle: "system",
            text: "Guten Tag Frau Dr. Lindner,\n\nvielen Dank für Ihre Anfrage. Die Ablösung einer gewachsenen Excel-Lösung in der Auftragserfassung ist ein Thema, das wir häufig begleiten – gerade bei zwei Standorten.\n\nFür ein kurzes Erstgespräch von 20 Minuten hätte ich Zeit am Dienstag 10:00 oder Mittwoch 14:30. Passt Ihnen einer der Termine?",
            quellen: ["Kalender T. Ahrens", "Referenzfälle Kunststoffverarbeitung"],
          },
        ],
      },
    },
    {
      id: "hinweis",
      station: "Hinweis",
      titel: "Vertrieb informieren",
      detail: "Kurze Nachricht ins Team-Chat, damit niemand das Postfach beobachten muss.",
      sekunden: 0.6,
      beleg: {
        art: "uebergabe",
        kanal: "Teams",
        ziel: "#vertrieb-sued",
        betreff: "Neuer A-Lead: Vollmer Kunststofftechnik (84/100)",
        hinweis: "Terminvorschlag ist raus, Antwort läuft auf T. Ahrens",
      },
    },
  ],
};
