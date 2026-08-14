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

/** Für die Warnung im Studio: läuft das hier ohne dauerhaften Speicher? */
export function datenPfadFehlt(): boolean {
  return process.env.NODE_ENV === "production" && !BASIS;
}
