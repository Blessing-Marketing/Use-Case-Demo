import { NextResponse, type NextRequest } from "next/server";
import { anmeldungGueltig } from "@/lib/zugang";

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
  /^\/api\/gesundheit$/, // Healthcheck des Containers
];

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

  // DEMO_BENUTZER ist freiwillig: ohne die Variable zählt allein das Passwort,
  // und im Anmeldedialog darf ein beliebiger Name stehen.
  const benutzer = process.env.DEMO_BENUTZER?.trim();

  if (anmeldungGueltig(request.headers.get("authorization"), passwort, benutzer)) {
    return NextResponse.next();
  }

  return abfrage("Zugang nur für das Vertriebsteam.");
}

export const config = {
  // Statische Dateien von Next brauchen keinen Schutz und würden sonst bei
  // jedem Aufruf die Passwortabfrage auslösen.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
