import { describe, expect, it } from "vitest";
import { alsHex, entpackeHtml, istSchriftname, normalisiereUrl, slugAus } from "@/lib/erfassen";

/**
 * Die Heuristiken der Website-Erfassung. Genau die Sorte Code, die still
 * kaputtgeht: sie wirft keine Fehler, sie liefert nur Unsinn.
 */

describe("istSchriftname", () => {
  it("nimmt echte Schriftnamen an", () => {
    for (const name of ["Poppins", "Open Sans", "DINWebPro", "Frutiger-Web", "wuerthsans_book", "SICK Intl", "Source Sans 3"]) {
      expect(istSchriftname(name), name).toBe(true);
    }
  });

  it("lehnt ab, was aus minifiziertem CSS mitrutscht", () => {
    // Genau diese Werte standen einmal als Schriftart in einer Kundendatei.
    for (const müll of ["/5.5.3/", "/only screen/", "false", "true", "none", "5.5.3", "", "  ", "var(--x)", "a{b:c}"]) {
      expect(istSchriftname(müll), JSON.stringify(müll)).toBe(false);
    }
  });

  it("lehnt generische und System-Schriften ab", () => {
    for (const name of ["sans-serif", "Arial", "Helvetica", "Consolas", "system-ui", "Segoe UI"]) {
      expect(istSchriftname(name), name).toBe(false);
    }
  });
});

describe("alsHex", () => {
  it("erkennt die üblichen Schreibweisen", () => {
    expect(alsHex("#abc")).toBe("#aabbcc");
    expect(alsHex("#AABBCC")).toBe("#aabbcc");
    expect(alsHex("aabbcc")).toBe("#aabbcc");
    expect(alsHex("rgb(255, 92, 22)")).toBe("#ff5c16");
    expect(alsHex("rgba(255 92 22 / 0.5)")).toBe("#ff5c16");
  });

  it("gibt null für alles andere", () => {
    expect(alsHex("transparent")).toBeNull();
    expect(alsHex("#12345")).toBeNull();
    expect(alsHex("")).toBeNull();
  });
});

describe("entpackeHtml", () => {
  it("löst benannte und numerische Entities auf", () => {
    expect(entpackeHtml("Blessing&#x20;Marketing")).toBe("Blessing Marketing");
    expect(entpackeHtml("M&uuml;ller")).toBe("M&uuml;ller"); // benannte Umlaute bleiben, kommen praktisch nicht vor
    expect(entpackeHtml("A&amp;B")).toBe("A&B");
    expect(entpackeHtml("&#8222;Zitat&#8220;")).toBe("„Zitat“");
  });

  it("vereinheitlicht Leerraum", () => {
    expect(entpackeHtml("  viel\n\n  Luft ")).toBe("viel Luft");
  });
});

describe("slugAus", () => {
  it("macht aus Firmennamen brauchbare Kürzel", () => {
    expect(slugAus("Nordwerk Systemtechnik")).toBe("nordwerk-systemtechnik");
    expect(slugAus("Müller & Söhne GmbH")).toBe("mueller-soehne-gmbh");
    expect(slugAus("Straß AG")).toBe("strass-ag");
  });

  it("liefert immer etwas Gültiges", () => {
    expect(slugAus("")).toBe("kunde");
    expect(slugAus("---")).toBe("kunde");
    expect(slugAus("!!!")).toBe("kunde");
  });
});

describe("normalisiereUrl", () => {
  it("ergänzt ein fehlendes Schema", () => {
    expect(normalisiereUrl("kunde.de").toString()).toBe("https://kunde.de/");
  });

  it("weist offensichtlich interne Adressen ab", () => {
    for (const adresse of ["localhost", "http://127.0.0.1", "http://10.0.0.1", "http://192.168.1.1", "http://[::1]"]) {
      expect(() => normalisiereUrl(adresse), adresse).toThrow();
    }
  });

  it("weist fremde Schemata ab", () => {
    expect(() => normalisiereUrl("file:///etc/passwd")).toThrow();
    expect(() => normalisiereUrl("javascript:alert(1)")).toThrow();
  });
});
