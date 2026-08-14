import { describe, expect, it } from "vitest";

/**
 * Welche Pfade ohne Anmeldung erreichbar sind.
 *
 * Die Liste steht in proxy.ts, das sich wegen der Next-Laufzeit nicht direkt
 * einbinden lässt. Deshalb wird sie hier gespiegelt und die Datei daraufhin
 * geprüft: fällt versehentlich ein Eintrag heraus, schlägt das hier fehl.
 *
 * Zweimal ist genau das passiert - erst fehlte der Healthcheck, dann das
 * Symbol im Browser-Tab. Beide Male stand die Anwendung, aber etwas
 * Öffentliches lief gegen die Passwortabfrage.
 */

const OEFFENTLICH = [
  /^\/kunde(\/|$)/,
  /^\/vorschau(\/|$)/,
  /^\/logos\//,
  /^\/api\/bild(\/|$)/,
  /^\/api\/gesundheit$/,
  /^\/(icon|apple-icon|favicon)\.[a-z0-9]+$/,
];

const istOeffentlich = (pfad: string) => OEFFENTLICH.some((regel) => regel.test(pfad));

describe("ohne Anmeldung erreichbar", () => {
  const offen = [
    "/kunde/festool-jbr9de",
    "/kunde/festool-jbr9de/rechnung",
    "/vorschau",
    "/vorschau/rechnung",
    "/logos/festool.svg",
    "/api/bild",
    "/api/gesundheit",
    "/icon.png",
    "/apple-icon.jpg",
    "/favicon.ico",
  ];
  for (const pfad of offen) {
    it(pfad, () => expect(istOeffentlich(pfad)).toBe(true));
  }
});

describe("hinter dem Passwort", () => {
  const geschuetzt = [
    "/",
    "/studio",
    "/api/kunden",
    "/api/kunden/festool",
    "/api/marke-erfassen",
  ];
  for (const pfad of geschuetzt) {
    it(pfad, () => expect(istOeffentlich(pfad)).toBe(false));
  }
});

describe("keine Umgehung durch ähnliche Pfade", () => {
  const versuche = [
    "/kundenliste",
    "/vorschauen",
    "/api/bildung",
    "/api/gesundheitsdaten",
    "/icon.png/../studio",
    "/studio/icon.png",
  ];
  for (const pfad of versuche) {
    it(pfad, () => expect(istOeffentlich(pfad)).toBe(false));
  }
});

describe("Liste stimmt mit proxy.ts überein", () => {
  it("enthält dieselben Regeln", async () => {
    const { readFileSync } = await import("node:fs");
    const quelle = readFileSync("proxy.ts", "utf8");
    for (const regel of OEFFENTLICH) {
      expect(quelle, `Regel fehlt in proxy.ts: ${regel}`).toContain(regel.source);
    }
  });
});
