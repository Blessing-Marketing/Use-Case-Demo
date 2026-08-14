import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { bildAdresse, unterschreibe, unterschriftGueltig } from "@/lib/bildsignatur";

const URL_A = "https://kunde.de/logo.svg";
const URL_B = "https://fremd.de/beliebig.png";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("mit eingerichtetem Schlüssel", () => {
  beforeEach(() => {
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "geheimer-schluessel");
    vi.stubEnv("DEMO_PASSWORT", "");
  });

  it("lässt die eigene Unterschrift durch", () => {
    expect(unterschriftGueltig(URL_A, unterschreibe(URL_A))).toBe(true);
  });

  it("weist fremde Adressen ab", () => {
    // Der eigentliche Zweck: niemand soll beliebige Bilder durchschleusen.
    expect(unterschriftGueltig(URL_B, null)).toBe(false);
    expect(unterschriftGueltig(URL_B, "")).toBe(false);
    expect(unterschriftGueltig(URL_B, "irgendwas")).toBe(false);
  });

  it("erkennt eine untergeschobene Adresse", () => {
    // Unterschrift von A, Adresse B ausgetauscht.
    expect(unterschriftGueltig(URL_B, unterschreibe(URL_A))).toBe(false);
  });

  it("erkennt eine veränderte Unterschrift", () => {
    const echt = unterschreibe(URL_A)!;
    const verdreht = `${echt.slice(0, -1)}${echt.endsWith("a") ? "b" : "a"}`;
    expect(unterschriftGueltig(URL_A, verdreht)).toBe(false);
    expect(unterschriftGueltig(URL_A, echt.slice(0, -1))).toBe(false);
  });

  it("liefert für jede Adresse eine andere Unterschrift", () => {
    expect(unterschreibe(URL_A)).not.toBe(unterschreibe(URL_B));
  });

  it("baut eine vollständige Proxy-Adresse", () => {
    const adresse = bildAdresse(URL_A);
    expect(adresse).toMatch(/^\/api\/bild\?u=.+&s=.+$/);
    const gelesen = new URLSearchParams(adresse.split("?")[1]);
    expect(gelesen.get("u")).toBe(URL_A);
    expect(unterschriftGueltig(gelesen.get("u")!, gelesen.get("s"))).toBe(true);
  });

  it("wird mit einem anderen Schlüssel ungültig", () => {
    const alteUnterschrift = unterschreibe(URL_A);
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "anderer-schluessel");
    expect(unterschriftGueltig(URL_A, alteUnterschrift)).toBe(false);
  });
});

describe("Schlüsselherkunft", () => {
  it("nimmt ersatzweise das Zugangspasswort", () => {
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "");
    vi.stubEnv("DEMO_PASSWORT", "das-passwort");
    const unterschrift = unterschreibe(URL_A);
    expect(unterschrift).toBeTruthy();
    expect(unterschriftGueltig(URL_A, unterschrift)).toBe(true);
  });

  it("bevorzugt den eigenen Schlüssel vor dem Passwort", () => {
    vi.stubEnv("DEMO_PASSWORT", "das-passwort");
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "eigener");
    const mitEigenem = unterschreibe(URL_A);
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "");
    expect(unterschreibe(URL_A)).not.toBe(mitEigenem);
  });
});

describe("ohne Schlüssel", () => {
  beforeEach(() => {
    vi.stubEnv("DEMO_BILD_SCHLUESSEL", "");
    vi.stubEnv("DEMO_PASSWORT", "");
  });

  it("verlangt in der Entwicklung nichts", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(unterschriftGueltig(URL_A, null)).toBe(true);
    expect(bildAdresse(URL_A)).not.toContain("&s=");
  });

  it("lässt in der Produktion niemanden durch", () => {
    // Sicher scheitern statt offen stehen.
    vi.stubEnv("NODE_ENV", "production");
    expect(unterschriftGueltig(URL_A, null)).toBe(false);
    expect(unterschriftGueltig(URL_A, "egal")).toBe(false);
  });
});
