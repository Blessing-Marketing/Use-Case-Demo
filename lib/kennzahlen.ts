import type { Marke } from "./marke";
import { type UseCase, zeitLabel } from "./usecases/typen";

/**
 * Eine einzige Stelle, an der aus Ablauf und Kunde Zahlen werden.
 *
 * Die Werte in den Ablaufdateien sind Schätzungen für einen typischen
 * Mittelständler - keine Messwerte. Trägt der Vertrieb im Studio die echten
 * Mengen des Kunden ein, ersetzen die sie. Ob das passiert ist, steht in
 * `geschaetzt` und wird auf der Seite ausgewiesen: eine Hochrechnung, die
 * nach Messung aussieht, aber geraten ist, hält keiner Rückfrage stand.
 */

export const ARBEITSTAGE_STANDARD = 220;

export type Mengengeruest = {
  proTag: number;
  einheit: string;
  einheitEinzahl?: string;
  manuellMinuten: number;
  autoSekunden: number;
  arbeitstage: number;
  /** true, solange mindestens ein Wert aus der Vorlage stammt. */
  geschaetzt: boolean;
};

type MengenQuelle = Pick<Marke, "mengen" | "arbeitstage">;

export function mengengeruest(uc: UseCase, marke?: MengenQuelle): Mengengeruest {
  const eigen = marke?.mengen?.[uc.slug];
  const proTagGesetzt = typeof eigen?.proTag === "number" && eigen.proTag > 0;
  const minutenGesetzt = typeof eigen?.manuellMinuten === "number" && eigen.manuellMinuten > 0;

  return {
    proTag: proTagGesetzt ? eigen.proTag! : uc.menge.proTag,
    einheit: uc.menge.einheit,
    einheitEinzahl: uc.menge.einheitEinzahl,
    manuellMinuten: minutenGesetzt ? eigen.manuellMinuten! : uc.manuellMinuten,
    autoSekunden: uc.autoSekunden,
    arbeitstage: marke?.arbeitstage || ARBEITSTAGE_STANDARD,
    geschaetzt: !(proTagGesetzt && minutenGesetzt),
  };
}

/** Eingesparte Handarbeit in Stunden pro Jahr. */
export function ersparnisStunden(m: Mengengeruest): number {
  const proVorgang = m.manuellMinuten - m.autoSekunden / 60;
  return Math.max(0, Math.round((proVorgang * m.proTag * m.arbeitstage) / 60));
}

/** Wie viel schneller der Ablauf pro Vorgang ist. */
export function faktor(m: Mengengeruest): number {
  return Math.round((m.manuellMinuten * 60) / Math.max(1, m.autoSekunden));
}

/** Menge mit passender Ein- oder Mehrzahl: "60 Belege", "1 Eintritt". */
export function mengeText(m: Mengengeruest): string {
  const wort = m.proTag === 1 ? (m.einheitEinzahl ?? m.einheit) : m.einheit;
  return `${m.proTag.toLocaleString("de-DE")} ${wort}`;
}

/** Handarbeit als lesbare Dauer: "9 min", "3 h 30 min". */
export function manuellText(m: Mengengeruest): string {
  return zeitLabel(m.manuellMinuten * 60);
}

/** Summe über mehrere Abläufe, inklusive Auskunft darüber, ob geschätzt wurde. */
export function gesamtErsparnis(
  useCases: UseCase[],
  marke?: MengenQuelle,
): { stunden: number; geschaetzt: boolean } {
  const geruste = useCases.map((uc) => mengengeruest(uc, marke));
  return {
    stunden: geruste.reduce((summe, m) => summe + ersparnisStunden(m), 0),
    geschaetzt: geruste.some((m) => m.geschaetzt),
  };
}
