import type { UseCase } from "./typen";

export const wissen: UseCase = {
  slug: "wissen",
  kicker: "Wissen & Support",
  name: "Antworten aus Ihren eigenen Unterlagen",
  versprechen: "Die Frage nach der Wartungsvorschrift von 2019 ist in fünf Sekunden beantwortet – mit Fundstelle.",
  beschreibung:
    "Ihre Handbücher, Verträge und Protokolle werden durchsuchbar. Die Antwort kommt in ganzen Sätzen und nennt immer, woher sie stammt.",
  ausloeser: "Frage im Chat, per Mail oder am Telefon",
  ergebnis: "Antwort mit Quellenangabe, prüfbar",
  manuellMinuten: 18,
  autoSekunden: 5,
  menge: { proTag: 35, einheit: "Fragen", einheitEinzahl: "Frage" },
  systeme: ["Dateiablage", "Intranet", "Vertragsordner", "Teams"],
  vorteile: [
    {
      titel: "Kein Rückruf nötig",
      text: "Auskünfte, für die sonst jemand „nochmal nachschauen“ musste, kommen direkt im Gespräch.",
    },
    {
      titel: "Immer mit Fundstelle",
      text: "Jede Aussage nennt Dokument, Version und Seite. Wer prüfen will, kann prüfen.",
    },
    {
      titel: "Wissen bleibt im Haus",
      text: "Wenn ein erfahrener Kollege in Rente geht, bleibt das, was in den Unterlagen steht, weiter abrufbar.",
    },
  ],
  stationen: [
    {
      id: "frage",
      station: "Frage",
      titel: "Die Frage kommt rein",
      detail: "Formuliert wie im Alltag, nicht wie eine Datenbankabfrage.",
      sekunden: 0.4,
      beleg: {
        art: "dialog",
        beitraege: [
          {
            rolle: "kunde",
            text: "Kunde fragt, ob wir bei der Anlage von 2019 noch in der Gewährleistung sind, wenn er die Wartung selbst gemacht hat. Was gilt da?",
          },
        ],
      },
    },
    {
      id: "suchen",
      station: "Suchen",
      titel: "In den Unterlagen suchen",
      detail: "Durchsucht wird, worauf die Person Zugriff hat – nicht mehr.",
      sekunden: 1.6,
      beleg: {
        art: "dateien",
        titel: "Relevante Fundstellen",
        eintraege: [
          { name: "Wartungsvorschrift WV-2019 Rev. C", typ: "PDF · Abschnitt 4.2", hinweis: "Eigenwartung" },
          { name: "Rahmenvertrag Gewährleistung", typ: "PDF · § 7 Abs. 3", hinweis: "gültig ab 2018" },
          { name: "Serviceprotokoll Anlage HB-4412", typ: "Protokoll · 11/2024", hinweis: "letzte Prüfung" },
        ],
      },
    },
    {
      id: "pruefen",
      station: "Prüfen",
      titel: "Belege gegenprüfen",
      detail: "Widersprüche und veraltete Stände werden aussortiert, bevor geantwortet wird.",
      sekunden: 1.2,
      beleg: {
        art: "pruefung",
        titel: "Belegprüfung",
        punkte: [
          { text: "Aktuellste Fassung der Wartungsvorschrift verwendet", stand: "ok", hinweis: "Rev. C, 03/2023" },
          { text: "Vertragsstand passt zum Anlagenbaujahr", stand: "ok" },
          { text: "Ältere Fassung Rev. B sagt etwas anderes", stand: "warnung", hinweis: "nicht verwendet" },
          { text: "Anlage HB-4412 mit dokumentierter Prüfung 11/2024", stand: "ok" },
        ],
      },
    },
    {
      id: "antwort",
      station: "Antwort",
      titel: "Antwort formulieren",
      detail: "Ganze Sätze, klare Aussage, Fundstelle dabei.",
      sekunden: 1.4,
      beleg: {
        art: "dialog",
        beitraege: [
          {
            rolle: "system",
            text: "Ja, die Gewährleistung bleibt bestehen – unter zwei Bedingungen. Eigenwartung ist zulässig, wenn sie nach der Wartungsvorschrift WV-2019 durchgeführt und protokolliert wird. Für die Anlage HB-4412 liegt ein Protokoll von 11/2024 vor, damit ist die Bedingung erfüllt.\n\nNicht abgedeckt sind Eingriffe in die Steuerung; die bleiben dem Service vorbehalten.",
            quellen: ["WV-2019 Rev. C, Abschnitt 4.2", "Rahmenvertrag § 7 Abs. 3", "Serviceprotokoll 11/2024"],
          },
        ],
      },
    },
    {
      id: "weiter",
      station: "Weiter",
      titel: "Offenen Punkt weitergeben",
      detail: "Was die Unterlagen nicht hergeben, geht an einen Menschen – benannt statt geraten.",
      sekunden: 0.4,
      beleg: {
        art: "notiz",
        text: "Ob der Kunde für die Steuerungssoftware ein eigenes Update eingespielt hat, steht in keinem Dokument. Diese Frage wurde als offener Punkt an den Servicedisponenten übergeben, statt sie zu beantworten.",
      },
    },
  ],
};
