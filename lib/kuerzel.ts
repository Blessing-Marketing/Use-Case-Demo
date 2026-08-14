/**
 * Zufallszusatz für Kundenadressen.
 *
 * Ohne ihn ist die Adresse der Firmenname: `festool.de` wird zu
 * `/kunde/festool`. Da Kundendemos ohne Passwort erreichbar sein müssen,
 * könnte jeder durchprobieren, welche Firmen eine Demo bekommen haben.
 * Mit Zusatz heißt sie `/kunde/festool-7fk3ma` - weiterhin lesbar und
 * verschickbar, aber nicht mehr zu erraten.
 */

/** Ohne 0/O und 1/l/I: die Adresse wird auch mal am Telefon vorgelesen. */
const ZEICHEN = "23456789abcdefghjkmnpqrstuvwxyz";

/** Größtes Vielfaches von 31, das in ein Byte passt - verhindert Schlagseite. */
const GRENZE = Math.floor(256 / ZEICHEN.length) * ZEICHEN.length;

export const ZUSATZ_LAENGE = 6;

export function zufallsZusatz(laenge = ZUSATZ_LAENGE): string {
  let ergebnis = "";
  while (ergebnis.length < laenge) {
    const werte = new Uint8Array(laenge * 2);
    crypto.getRandomValues(werte);
    for (const wert of werte) {
      if (wert >= GRENZE) continue;
      ergebnis += ZEICHEN[wert % ZEICHEN.length];
      if (ergebnis.length === laenge) break;
    }
  }
  return ergebnis;
}

const ZUSATZ_MUSTER = new RegExp(`-[${ZEICHEN}]{${ZUSATZ_LAENGE}}$`);

export function hatZusatz(kuerzel: string): boolean {
  return ZUSATZ_MUSTER.test(kuerzel);
}

export function ohneZusatz(kuerzel: string): string {
  return kuerzel.replace(ZUSATZ_MUSTER, "");
}

/**
 * Hängt einen frischen Zusatz an. Ein vorhandener wird ersetzt, damit
 * mehrfaches Drücken nicht `firma-abc123-def456` erzeugt.
 */
export function mitZusatz(basis: string, laenge = ZUSATZ_LAENGE): string {
  const stamm = ohneZusatz(basis)
    .replace(/-+$/, "")
    // Das Kürzel darf höchstens 40 Zeichen haben, der Zusatz braucht Platz.
    .slice(0, 40 - laenge - 1);
  return `${stamm || "kunde"}-${zufallsZusatz(laenge)}`;
}
