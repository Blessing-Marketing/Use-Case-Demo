/**
 * Ein Use Case ist reine Datei-Datei - keine Komponente, kein Code.
 * Dadurch kann ein neuer Use Case angelegt werden, ohne dass jemand React kann:
 * Datei kopieren, Texte tauschen, in lib/usecases/index.ts eintragen. Fertig.
 */

export type Beleg =
  /** Rohe Eingangs-Mail */
  | {
      art: "mail";
      von: string;
      betreff: string;
      zeilen: string[];
      anhang?: string;
    }
  /** Ausgelesene oder erzeugte Felder, optional mit Sicherheitswert */
  | {
      art: "felder";
      titel?: string;
      zeilen: { feld: string; wert: string; hinweis?: string }[];
    }
  /** Prüfschritte mit Ampel */
  | {
      art: "pruefung";
      titel?: string;
      punkte: { text: string; stand: "ok" | "warnung" | "info"; hinweis?: string }[];
    }
  /** Erzeugtes Dokument, z.B. Angebot oder Rechnung */
  | {
      art: "dokument";
      titel: string;
      untertitel?: string;
      positionen: { text: string; wert: string }[];
      summe?: { text: string; wert: string };
    }
  /** Tabellarischer Abgleich */
  | {
      art: "tabelle";
      titel?: string;
      kopf: string[];
      zeilen: string[][];
    }
  /** Weiterleitung in ein Zielsystem */
  | {
      art: "uebergabe";
      kanal: string;
      ziel: string;
      betreff?: string;
      hinweis?: string;
    }
  /** Bewertung mit Faktoren */
  | {
      art: "bewertung";
      text: string;
      wert: number;
      max?: number;
      faktoren: { text: string; delta: string }[];
    }
  /** Dialog, z.B. Antwortentwurf oder Wissensfrage */
  | {
      art: "dialog";
      beitraege: { rolle: "kunde" | "system"; text: string; quellen?: string[] }[];
    }
  /** Dateien / Dokumente */
  | {
      art: "dateien";
      titel?: string;
      eintraege: { name: string; typ: string; hinweis?: string }[];
    }
  /** Kurzer Merksatz */
  | { art: "notiz"; text: string };

export type Station = {
  id: string;
  /** Kurzname auf der Schiene, 1-2 Wörter */
  station: string;
  /** Was in diesem Schritt passiert */
  titel: string;
  /** Ein Satz in Alltagssprache */
  detail: string;
  /** Simulierte Dauer in Sekunden - ergibt zusammen die Gesamtlaufzeit */
  sekunden: number;
  beleg: Beleg;
};

export type UseCase = {
  slug: string;
  /** Kategorie, eine Zeile */
  kicker: string;
  /** Titel der Demo */
  name: string;
  /** Das Versprechen in einem Satz */
  versprechen: string;
  /** Zwei Sätze für die Karte auf der Startseite */
  beschreibung: string;
  /** Was den Ablauf startet */
  ausloeser: string;
  /** Was am Ende dasteht */
  ergebnis: string;
  /** Minuten Handarbeit pro Vorgang */
  manuellMinuten: number;
  /** Sekunden automatisch pro Vorgang */
  autoSekunden: number;
  /** Realistische Mengenangabe für die Hochrechnung */
  menge: { proTag: number; einheit: string; einheitEinzahl?: string };
  /** Drei konkrete Vorteile, keine Floskeln */
  vorteile: { titel: string; text: string }[];
  /** Typische angebundene Systeme */
  systeme: string[];
  stationen: Station[];
};

export function gesamtSekunden(uc: UseCase): number {
  return uc.stationen.reduce((s, st) => s + st.sekunden, 0);
}

// Hochrechnungen stehen bewusst nicht hier, sondern in lib/kennzahlen.ts:
// sie hängen vom Kunden ab, nicht vom Ablauf.

export function zeitLabel(sekunden: number): string {
  if (sekunden < 60) return `${sekunden.toLocaleString("de-DE", { maximumFractionDigits: 1 })} s`;
  const min = Math.round(sekunden / 60);
  if (min < 60) return `${min} min`;
  const std = Math.floor(min / 60);
  const rest = min % 60;
  return rest ? `${std} h ${rest} min` : `${std} h`;
}
