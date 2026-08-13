import type { UseCase } from "./typen";

export const posteingang: UseCase = {
  slug: "posteingang",
  kicker: "Kundenkommunikation",
  name: "Der Posteingang sortiert sich selbst",
  versprechen: "Jede Anfrage ist gelesen, zugeordnet und beantwortet, bevor jemand das Postfach öffnet.",
  beschreibung:
    "Anfragen an die zentrale Adresse werden gelesen, dem richtigen Vorgang zugeordnet und mit einem fertigen Antwortentwurf weitergereicht. Ihr Team entscheidet nur noch, ob es passt.",
  ausloeser: "Neue E-Mail an die zentrale Adresse",
  ergebnis: "Zugeordnet, beantwortet, als Aufgabe hinterlegt",
  manuellMinuten: 9,
  autoSekunden: 6,
  menge: { proTag: 45, einheit: "E-Mails", einheitEinzahl: "E-Mail" },
  systeme: ["Microsoft 365", "CRM", "Ticketsystem"],
  vorteile: [
    {
      titel: "Nichts bleibt liegen",
      text: "Jede Mail bekommt binnen Sekunden eine Zuordnung und eine Frist. Auch die, die freitags um 17:40 kommt.",
    },
    {
      titel: "Gleiche Antwortqualität",
      text: "Der Entwurf greift auf Ihre Textbausteine und den bisherigen Schriftverkehr zurück – unabhängig davon, wer gerade Dienst hat.",
    },
    {
      titel: "Der Mensch entscheidet",
      text: "Nichts geht ungesehen raus. Das Team prüft den Entwurf und schickt ihn mit einem Klick.",
    },
  ],
  stationen: [
    {
      id: "eingang",
      station: "Eingang",
      titel: "E-Mail trifft ein",
      detail: "Eine Anfrage landet im zentralen Postfach – so wie jeden Tag rund 45 andere.",
      sekunden: 0.3,
      beleg: {
        art: "mail",
        von: "m.kessler@baumann-hoch.de",
        betreff: "Rückfrage zu Lieferung – Auftrag 2024-1187",
        zeilen: [
          "Guten Morgen,",
          "wir hatten letzte Woche die Erweiterung bestellt. Auf dem Lieferschein fehlen zwei Positionen und der Termin für die Montage ist noch offen.",
          "Können Sie mir bis Freitag Bescheid geben? Es hängt eine Abnahme dran.",
          "Viele Grüße, M. Keßler",
        ],
        anhang: "Lieferschein_LS-88421.pdf",
      },
    },
    {
      id: "verstehen",
      station: "Verstehen",
      titel: "Anliegen erkennen",
      detail: "Das System liest die Mail und hält fest, worum es geht, wie dringend es ist und wer schreibt.",
      sekunden: 1.4,
      beleg: {
        art: "felder",
        titel: "Aus der Mail gelesen",
        zeilen: [
          { feld: "Anliegen", wert: "Reklamation Lieferumfang + offener Montagetermin" },
          { feld: "Auftrag", wert: "2024-1187", hinweis: "im Text gefunden" },
          { feld: "Absender", wert: "Baumann Hochbau GmbH", hinweis: "Bestandskunde seit 2019" },
          { feld: "Dringlichkeit", wert: "Hoch – Frist Freitag" },
          { feld: "Stimmung", wert: "Sachlich, leicht angespannt" },
        ],
      },
    },
    {
      id: "abgleich",
      station: "Abgleich",
      titel: "Mit Ihren Systemen abgleichen",
      detail: "Kundenakte, Auftrag und Lieferschein werden geprüft, bevor irgendjemand antwortet.",
      sekunden: 1.2,
      beleg: {
        art: "pruefung",
        titel: "Abgleich mit ERP und CRM",
        punkte: [
          { text: "Kunde in der Kundenakte gefunden", stand: "ok", hinweis: "Kd.-Nr. 40218" },
          { text: "Auftrag 2024-1187 existiert, Status: teilgeliefert", stand: "ok" },
          { text: "Zwei Positionen tatsächlich offen", stand: "warnung", hinweis: "Pos. 4 und 7" },
          { text: "Montagetermin nicht eingetragen", stand: "warnung" },
          { text: "Keine offene Beschwerde, keine Mahnung", stand: "info" },
        ],
      },
    },
    {
      id: "zuordnen",
      station: "Zuordnen",
      titel: "An die richtige Stelle geben",
      detail: "Die Mail geht dorthin, wo sie hingehört – mit Priorität und Frist.",
      sekunden: 0.8,
      beleg: {
        art: "uebergabe",
        kanal: "Ticketsystem",
        ziel: "Vertriebsinnendienst · Team Nord",
        betreff: "Teillieferung 2024-1187 klären + Montagetermin",
        hinweis: "Priorität hoch, Frist Donnerstag 12:00 – ein Tag vor der Kundenfrist",
      },
    },
    {
      id: "antwort",
      station: "Antwort",
      titel: "Antwortentwurf schreiben",
      detail: "Der Entwurf steht im Postausgang und wartet auf Ihr Okay.",
      sekunden: 1.8,
      beleg: {
        art: "dialog",
        beitraege: [
          {
            rolle: "system",
            text: "Sehr geehrter Herr Keßler,\n\nvielen Dank für Ihre Nachricht. Sie haben recht: Zu Auftrag 2024-1187 sind die Positionen 4 und 7 noch offen. Beide sind für den 18.03. avisiert.\n\nFür die Montage schlage ich Donnerstag, den 21.03., ab 07:30 Uhr vor. Damit bleibt vor Ihrer Abnahme ein Puffer.\n\nIch melde mich bis Donnerstagmittag mit der verbindlichen Bestätigung.",
            quellen: ["Auftrag 2024-1187", "Lieferplan KW 12", "Textbaustein „Teillieferung“"],
          },
        ],
      },
    },
    {
      id: "ablage",
      station: "Ablage",
      titel: "Vorgang dokumentieren",
      detail: "Alles ist in der Kundenakte hinterlegt. Die Wiedervorlage steht.",
      sekunden: 0.5,
      beleg: {
        art: "felder",
        titel: "Im CRM abgelegt",
        zeilen: [
          { feld: "Vorgang", wert: "Reklamation Teillieferung 2024-1187" },
          { feld: "Kundenakte", wert: "Baumann Hochbau GmbH · Kd. 40218" },
          { feld: "Zuständig", wert: "Innendienst Nord" },
          { feld: "Wiedervorlage", wert: "Do, 12:00" },
          { feld: "Anhang", wert: "Lieferschein_LS-88421.pdf" },
        ],
      },
    },
  ],
};
