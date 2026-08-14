/**
 * Prüfung der Basic-Auth-Anmeldung.
 *
 * Ausgelagert aus proxy.ts, damit sie prüfbar ist: an dieser Stelle hängt der
 * gesamte Zugangsschutz.
 */

/** Vergleich ohne früh abzubrechen, damit die Laufzeit nichts verrät. */
export function sicherGleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let unterschied = 0;
  for (let i = 0; i < a.length; i++) unterschied |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return unterschied === 0;
}

/**
 * Ist der Authorization-Kopf gültig?
 *
 * `benutzer` ist freiwillig: ohne Angabe zählt allein das Passwort. Das ist
 * die Voreinstellung, weil sich ein Team ein Passwort teilt und niemand
 * Benutzerkonten pflegen soll.
 */
export function anmeldungGueltig(
  kopf: string | null,
  passwort: string,
  benutzer?: string,
): boolean {
  if (!passwort) return false;
  if (!kopf?.startsWith("Basic ")) return false;

  let entschluesselt: string;
  try {
    entschluesselt = atob(kopf.slice(6));
  } catch {
    return false;
  }

  const trenner = entschluesselt.indexOf(":");
  if (trenner < 0) return false;

  const uebergebenerBenutzer = entschluesselt.slice(0, trenner);
  const uebergebenesPasswort = entschluesselt.slice(trenner + 1);

  // Beide Prüfungen laufen immer, damit die Antwortzeit nicht verrät,
  // welche der beiden Angaben falsch war.
  const benutzerStimmt = !benutzer || sicherGleich(uebergebenerBenutzer, benutzer);
  const passwortStimmt = sicherGleich(uebergebenesPasswort, passwort);

  return benutzerStimmt && passwortStimmt;
}
