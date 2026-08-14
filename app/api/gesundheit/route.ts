export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lebenszeichen für den Healthcheck des Containers.
 *
 * Muss ohne Passwort erreichbar sein und immer 200 antworten: prüft die
 * Betriebsumgebung stattdessen `/`, bekommt sie 401 (Passwort verlangt) oder
 * 503 (kein Passwort eingerichtet), hält den Container für ungesund und
 * hängt keine Route ein - das Ergebnis ist ein 404 im Browser.
 *
 * Gibt bewusst nichts über die Konfiguration preis.
 */
export function GET() {
  return Response.json({ status: "ok" }, { headers: { "cache-control": "no-store" } });
}
