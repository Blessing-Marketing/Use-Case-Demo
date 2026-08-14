import { NextResponse, type NextRequest } from "next/server";

/**
 * Zugangsschutz.
 *
 * Öffentlich bleibt nur, was ein Kunde per Link geschickt bekommt. Alles
 * andere - die Übersicht aller Kunden, das Studio, die Erfassungs-Route -
 * gehört dem Vertrieb und liegt hinter einem Passwort.
 *
 * In Next 16 heißt diese Datei `proxy.ts`; `middleware.ts` ist abgelöst.
 */

const OEFFENTLICH = [
  /^\/kunde(\/|$)/, // die verschickte Demo
  /^\/vorschau(\/|$)/, // teilbarer Entwurf, Marke steckt in der Adresse
  /^\/logos\//, // Kundenlogos auf diesen Seiten
  /^\/api\/bild(\/|$)/, // Logos in Vorschau-Links
];

/** Vergleich ohne früh abzubrechen, damit die Laufzeit nichts verrät. */
function sicherGleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let unterschied = 0;
  for (let i = 0; i < a.length; i++) unterschied |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return unterschied === 0;
}

function abfrage(nachricht: string, status = 401) {
  return new NextResponse(nachricht, {
    status,
    headers:
      status === 401
        ? { "WWW-Authenticate": 'Basic realm="Demo-System", charset="UTF-8"' }
        : undefined,
  });
}

export function proxy(request: NextRequest) {
  const pfad = request.nextUrl.pathname;
  if (OEFFENTLICH.some((regel) => regel.test(pfad))) return NextResponse.next();

  const passwort = process.env.DEMO_PASSWORT?.trim();

  if (!passwort) {
    // Lokal ohne Schutz arbeiten, auf einem Server aber nicht versehentlich
    // das Studio offen ins Netz stellen.
    if (process.env.NODE_ENV === "production") {
      return abfrage(
        "Kein Zugang eingerichtet. Bitte die Umgebungsvariable DEMO_PASSWORT setzen.",
        503,
      );
    }
    return NextResponse.next();
  }

  const kopf = request.headers.get("authorization") ?? "";
  if (kopf.startsWith("Basic ")) {
    try {
      const entschluesselt = atob(kopf.slice(6));
      const uebergeben = entschluesselt.slice(entschluesselt.indexOf(":") + 1);
      if (sicherGleich(uebergeben, passwort)) return NextResponse.next();
    } catch {
      /* unbrauchbarer Kopf - wie kein Kopf behandeln */
    }
  }

  return abfrage("Zugang nur für das Vertriebsteam.");
}

export const config = {
  // Statische Dateien von Next brauchen keinen Schutz und würden sonst bei
  // jedem Aufruf die Passwortabfrage auslösen.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
