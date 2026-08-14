import fs from "node:fs";
import path from "node:path";

/**
 * Wo die Daten liegen.
 *
 * Lokal im Projektordner. Auf einem Server muss `DEMO_DATEN_PFAD` auf ein
 * dauerhaftes Verzeichnis zeigen (bei Coolify: ein Volume) - sonst sind alle
 * angelegten Kunden beim nächsten Deploy weg, weil der Container neu gebaut
 * wird.
 */

const BASIS = process.env.DEMO_DATEN_PFAD?.trim();

export const KUNDEN_ORDNER = BASIS
  ? path.join(BASIS, "kunden")
  : path.join(process.cwd(), "content", "kunden");

export const LOGO_ORDNER = BASIS
  ? path.join(BASIS, "logos")
  : path.join(process.cwd(), "content", "logos");

/**
 * Ist der Pfad ein eigener Einhängepunkt?
 *
 * Steht er nicht in der Liste der Einhängepunkte, liegt er im Dateisystem des
 * Containers - dann überlebt er kein Deploy. Genau der Fall, der sonst erst
 * auffällt, wenn die Kundendaten schon weg sind.
 *
 * Das Format je Zeile: `36 35 98:0 /quelle /ziel rw,... - ext4 ...`,
 * das Ziel steht an fünfter Stelle.
 */
export function istEigenerEinhaengepunkt(einhaengeliste: string, pfad: string): boolean {
  return einhaengeliste.split("\n").some((zeile) => {
    const ziel = zeile.split(" ")[4];
    return ziel === pfad || (Boolean(ziel) && pfad.startsWith(`${ziel}/`));
  });
}

/**
 * Läuft das hier ohne dauerhaften Speicher? Dann warnt das Studio sichtbar.
 * Deckt beide Fälle ab: gar kein Pfad eingerichtet, oder ein Pfad ohne Volume.
 */
export function datenPfadFluechtig(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  if (!BASIS) return true;

  try {
    // Gibt es nur unter Linux; lokal ist die Frage ohnehin gegenstandslos.
    const liste = fs.readFileSync("/proc/self/mountinfo", "utf8");
    return !istEigenerEinhaengepunkt(liste, BASIS);
  } catch {
    return false;
  }
}

/** Für die Anzeige im Studio. */
export function datenPfadAnzeige(): string {
  return BASIS ?? path.join("content");
}
