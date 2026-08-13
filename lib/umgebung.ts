/**
 * Kann das Studio Kundendateien schreiben?
 *
 * Lokal ja. Auf Vercel ist das Dateisystem zur Laufzeit schreibgeschützt -
 * dort bleibt der Weg über Herunterladen und Einchecken. Auf einem eigenen
 * Server lässt sich das Schreiben mit DEMO_STUDIO_SCHREIBEN=1 einschalten.
 */
export function schreibenErlaubt(): boolean {
  if (process.env.DEMO_STUDIO_SCHREIBEN === "1") return true;
  return process.env.NODE_ENV !== "production" && !process.env.VERCEL;
}
