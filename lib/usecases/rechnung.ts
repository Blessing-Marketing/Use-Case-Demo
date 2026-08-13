import type { UseCase } from "./typen";

export const rechnung: UseCase = {
  slug: "rechnung",
  kicker: "Buchhaltung",
  name: "Rechnungen ohne Abtippen",
  versprechen: "Der Beleg ist ausgelesen, geprüft und kontiert, bevor ihn jemand ausgedruckt hätte.",
  beschreibung:
    "Eingangsrechnungen werden gelesen, gegen Bestellung und Lieferschein geprüft und kontiert. Abweichungen landen auf dem Tisch, der Rest läuft durch.",
  ausloeser: "Rechnung als PDF im Rechnungspostfach",
  ergebnis: "Geprüft, kontiert, zur Freigabe vorgelegt",
  manuellMinuten: 11,
  autoSekunden: 8,
  menge: { proTag: 60, einheit: "Belege", einheitEinzahl: "Beleg" },
  systeme: ["DATEV", "ERP", "DMS", "Rechnungspostfach"],
  vorteile: [
    {
      titel: "Skonto wird nicht mehr verschenkt",
      text: "Belege liegen am Eingangstag zur Freigabe bereit statt in der Sammelmappe bis zum Monatsende.",
    },
    {
      titel: "Dreifachabgleich automatisch",
      text: "Rechnung gegen Bestellung gegen Lieferschein – Abweichungen fallen sofort auf, nicht bei der Prüfung.",
    },
    {
      titel: "Prüfbar bleibt es trotzdem",
      text: "Zu jedem Feld ist hinterlegt, an welcher Stelle im Beleg es steht. Für die Prüfung reicht ein Klick.",
    },
  ],
  stationen: [
    {
      id: "eingang",
      station: "Eingang",
      titel: "Beleg erfassen",
      detail: "PDF, Scan oder E-Rechnung – alles landet im selben Ablauf.",
      sekunden: 0.5,
      beleg: {
        art: "dateien",
        titel: "Im Rechnungspostfach",
        eintraege: [
          { name: "RE-2026-004471.pdf", typ: "PDF · 214 KB", hinweis: "Anhang aus E-Mail" },
          { name: "Lieferschein_88213.pdf", typ: "PDF · 96 KB", hinweis: "mitgeschickt" },
        ],
      },
    },
    {
      id: "auslesen",
      station: "Auslesen",
      titel: "Daten aus dem Beleg holen",
      detail: "Alle relevanten Felder werden gelesen – auch bei ungewohnten Layouts.",
      sekunden: 2.2,
      beleg: {
        art: "felder",
        titel: "Gelesene Rechnungsdaten",
        zeilen: [
          { feld: "Lieferant", wert: "Hansen Metallbau GmbH", hinweis: "Kreditor 70412" },
          { feld: "Rechnungsnummer", wert: "RE-2026-004471" },
          { feld: "Datum", wert: "04.03.2026" },
          { feld: "Netto", wert: "3.418,00 €" },
          { feld: "USt 19 %", wert: "649,42 €" },
          { feld: "Brutto", wert: "4.067,42 €" },
          { feld: "Zahlungsziel", wert: "14 Tage, 2 % Skonto bis 18.03." },
          { feld: "Bestellbezug", wert: "B-2026-0912", hinweis: "aus Betreffzeile" },
        ],
      },
    },
    {
      id: "abgleich",
      station: "Abgleich",
      titel: "Gegen Bestellung prüfen",
      detail: "Bestellt, geliefert, berechnet – die drei Stände werden nebeneinandergelegt.",
      sekunden: 2.4,
      beleg: {
        art: "tabelle",
        titel: "Bestellung B-2026-0912 gegen Rechnung",
        kopf: ["Position", "Bestellt", "Geliefert", "Berechnet"],
        zeilen: [
          ["Stahlprofil 40×40", "60 m", "60 m", "60 m"],
          ["Schweißarbeit pauschal", "1", "1", "1"],
          ["Zuschnitt", "—", "—", "1 × 120,00 €"],
          ["Fracht", "45,00 €", "—", "45,00 €"],
        ],
      },
    },
    {
      id: "pruefung",
      station: "Prüfung",
      titel: "Abweichungen bewerten",
      detail: "Was passt, läuft durch. Was nicht passt, wird benannt.",
      sekunden: 1.4,
      beleg: {
        art: "pruefung",
        titel: "Ergebnis der Prüfung",
        punkte: [
          { text: "Lieferant und Bankverbindung stimmen mit Stammdaten überein", stand: "ok" },
          { text: "Mengen und Preise entsprechen der Bestellung", stand: "ok" },
          { text: "Position „Zuschnitt“ war nicht bestellt", stand: "warnung", hinweis: "120,00 € – Klärung Einkauf" },
          { text: "Keine Doppelzahlung: Rechnungsnummer bisher unbekannt", stand: "ok" },
          { text: "Skontofrist läuft in 14 Tagen", stand: "info", hinweis: "81,35 € möglich" },
        ],
      },
    },
    {
      id: "kontieren",
      station: "Kontieren",
      titel: "Buchungssatz vorbereiten",
      detail: "Konto, Kostenstelle und Steuerschlüssel setzt das System nach Ihren Regeln.",
      sekunden: 1.0,
      beleg: {
        art: "felder",
        titel: "Vorkontierung",
        zeilen: [
          { feld: "Sachkonto", wert: "5400 Fremdleistungen" },
          { feld: "Kostenstelle", wert: "K-220 Fertigung Halle 2", hinweis: "aus Bestellung übernommen" },
          { feld: "Steuerschlüssel", wert: "9 – Vorsteuer 19 %" },
          { feld: "Fälligkeit", wert: "18.03.2026 (Skonto)" },
        ],
      },
    },
    {
      id: "freigabe",
      station: "Freigabe",
      titel: "Zur Freigabe geben",
      detail: "Die Rechnung liegt beim richtigen Freigeber – mit dem offenen Punkt obenauf.",
      sekunden: 0.6,
      beleg: {
        art: "uebergabe",
        kanal: "Freigabe-Workflow",
        ziel: "Einkaufsleitung · A. Roth",
        betreff: "RE-2026-004471 · 4.067,42 € · 1 offener Punkt",
        hinweis: "Nach Freigabe automatischer Export nach DATEV",
      },
    },
  ],
};
