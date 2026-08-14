import { describe, expect, it } from "vitest";
import { anmeldungGueltig, sicherGleich } from "@/lib/zugang";

const kopf = (benutzer: string, passwort: string) =>
  `Basic ${Buffer.from(`${benutzer}:${passwort}`).toString("base64")}`;

describe("anmeldungGueltig – ohne festen Benutzernamen", () => {
  it("lässt jeden Namen durch, solange das Passwort stimmt", () => {
    for (const name of ["vertrieb", "", "sebastian", "irgendwas"]) {
      expect(anmeldungGueltig(kopf(name, "geheim"), "geheim"), name).toBe(true);
    }
  });

  it("weist ein falsches Passwort ab", () => {
    expect(anmeldungGueltig(kopf("vertrieb", "falsch"), "geheim")).toBe(false);
    expect(anmeldungGueltig(kopf("vertrieb", ""), "geheim")).toBe(false);
    expect(anmeldungGueltig(kopf("vertrieb", "geheim "), "geheim")).toBe(false);
  });
});

describe("anmeldungGueltig – mit festem Benutzernamen", () => {
  it("verlangt beides", () => {
    expect(anmeldungGueltig(kopf("vertrieb", "geheim"), "geheim", "vertrieb")).toBe(true);
    expect(anmeldungGueltig(kopf("falsch", "geheim"), "geheim", "vertrieb")).toBe(false);
    expect(anmeldungGueltig(kopf("vertrieb", "falsch"), "geheim", "vertrieb")).toBe(false);
  });

  it("unterscheidet Groß- und Kleinschreibung", () => {
    expect(anmeldungGueltig(kopf("Vertrieb", "geheim"), "geheim", "vertrieb")).toBe(false);
  });
});

describe("anmeldungGueltig – unbrauchbare Anfragen", () => {
  it("weist alles ab, was kein gültiger Basic-Kopf ist", () => {
    for (const wert of [
      null,
      "",
      "Bearer abc",
      "Basic",
      "Basic !!!keinbase64!!!",
      `Basic ${Buffer.from("ohnedoppelpunkt").toString("base64")}`,
    ]) {
      expect(anmeldungGueltig(wert, "geheim"), String(wert)).toBe(false);
    }
  });

  it("lässt niemanden durch, wenn gar kein Passwort eingerichtet ist", () => {
    // Sonst wäre der Zugang bei fehlender Umgebungsvariable offen.
    expect(anmeldungGueltig(kopf("vertrieb", ""), "")).toBe(false);
    expect(anmeldungGueltig(kopf("vertrieb", "irgendwas"), "")).toBe(false);
  });

  it("kommt mit Doppelpunkten im Passwort zurecht", () => {
    expect(anmeldungGueltig(kopf("vertrieb", "a:b:c"), "a:b:c")).toBe(true);
  });
});

describe("sicherGleich", () => {
  it("vergleicht korrekt", () => {
    expect(sicherGleich("abc", "abc")).toBe(true);
    expect(sicherGleich("abc", "abd")).toBe(false);
    expect(sicherGleich("abc", "ab")).toBe(false);
    expect(sicherGleich("", "")).toBe(true);
  });
});
