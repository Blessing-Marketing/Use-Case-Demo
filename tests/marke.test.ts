import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/color";
import { schriftSchluessel } from "@/lib/schriften";
import { aufloesen, markeDekodieren, markeKodieren } from "@/lib/marke";

describe("aufloesen", () => {
  it("kommt mit Name und einer Farbe aus", () => {
    const m = aufloesen({ slug: "a", name: "Beispiel AG", farben: { primaer: "#0c6b5e" } });
    expect(m.name).toBe("Beispiel AG");
    expect(m.logo.text).toBe("Beispiel AG");
    expect(m.farben.akzent).toBe("#0c6b5e");
    expect(m.radius).toBe(4);
    expect(m.arbeitstage).toBe(220);
    expect(m.texte.ueberschrift).toBeTruthy();
  });

  it("erkennt dunkle Marken an der Fläche", () => {
    const hell = aufloesen({ slug: "h", name: "H", farben: { primaer: "#000", flaeche: "#ffffff" } });
    const dunkel = aufloesen({ slug: "d", name: "D", farben: { primaer: "#fff", flaeche: "#12160f" } });
    expect(hell.hell).toBe(true);
    expect(dunkel.hell).toBe(false);
    // Die Textfarbe muss sich mitdrehen, sonst ist die Seite unlesbar.
    expect(contrastRatio(hell.farben.ink, hell.farben.flaeche)).toBeGreaterThan(4.5);
    expect(contrastRatio(dunkel.farben.ink, dunkel.farben.flaeche)).toBeGreaterThan(4.5);
  });

  it("wählt eine lesbare Schrift auf der Primärfarbe", () => {
    for (const primaer of ["#0c6b5e", "#f2b705", "#ffffff", "#000000", "#c8102e", "#23aa08"]) {
      const m = aufloesen({ slug: "x", name: "X", farben: { primaer } });
      expect(
        contrastRatio(m.farben.aufPrimaer, primaer),
        `${primaer} auf ${m.farben.aufPrimaer}`,
      ).toBeGreaterThan(4.5);
    }
  });

  it("macht die Akzentfarbe als Text lesbar", () => {
    // Markenfarben sind nicht für Text gemacht: Signalorange oder Gelb liegen
    // auf Weiß bei rund 2:1. Die Beschriftung muss trotzdem lesbar sein.
    const heikel = ["#ff5c16", "#f2b705", "#23aa08", "#5ee0a0", "#ffffff", "#e0794a"];
    for (const akzent of heikel) {
      for (const flaeche of ["#ffffff", "#e9ecea", "#12160f"]) {
        const m = aufloesen({ slug: "x", name: "X", farben: { primaer: "#0c6b5e", akzent, flaeche } });
        // Beschriftungen stehen mal auf Karten, mal auf der Grundfläche.
        for (const hintergrund of [m.farben.papier, m.farben.flaeche]) {
          expect(
            contrastRatio(m.farben.akzentText, hintergrund),
            `Akzent ${akzent} auf ${hintergrund}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
        expect(
          contrastRatio(m.farben.akzentAufBuehne, m.farben.buehne),
          `Akzent ${akzent} auf Bühne ${m.farben.buehne}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("hält auch die abgestuften Textfarben über 4,5:1", () => {
    for (const flaeche of ["#ffffff", "#e9ecea", "#f6f4f0", "#12160f", "#101418"]) {
      const m = aufloesen({ slug: "x", name: "X", farben: { primaer: "#0c6b5e", flaeche } });
      for (const hintergrund of [m.farben.flaeche, m.farben.papier]) {
        expect(
          contrastRatio(m.farben.gedaempft, hintergrund),
          `gedaempft auf ${hintergrund}`,
        ).toBeGreaterThanOrEqual(4.5);
        expect(
          contrastRatio(m.farben.zurueckhaltend, hintergrund),
          `zurueckhaltend auf ${hintergrund}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
      expect(
        contrastRatio(m.farben.buehneGedaempft, m.farben.buehne),
        `buehneGedaempft auf ${m.farben.buehne}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("behält die Abstufung zwischen den Textfarben", () => {
    const m = aufloesen({ slug: "x", name: "X", farben: { primaer: "#0c6b5e", flaeche: "#ffffff" } });
    // zurückhaltend darf heller sein als gedämpft, aber beide unter der Haupt-Textfarbe.
    expect(contrastRatio(m.farben.zurueckhaltend, "#ffffff")).toBeLessThanOrEqual(
      contrastRatio(m.farben.gedaempft, "#ffffff"),
    );
  });

  it("lässt einen ohnehin lesbaren Akzent unverändert", () => {
    const m = aufloesen({
      slug: "x",
      name: "X",
      farben: { primaer: "#0c6b5e", akzent: "#c8102e", flaeche: "#ffffff" },
    });
    expect(m.farben.akzentText).toBe("#c8102e");
  });

  it("fällt bei unbrauchbaren Farbangaben auf Vorgaben zurück", () => {
    const m = aufloesen({ slug: "x", name: "X", farben: { primaer: "nicht-hex" } });
    expect(m.farben.primaer).toBe("#0c6b5e");
  });

  it("nimmt einen leeren Namen nicht hin", () => {
    expect(aufloesen({ slug: "x", name: "   ", farben: { primaer: "#000" } }).name).toBe("Musterkunde");
  });
});

describe("Vorschau-Links", () => {
  it("überstehen Hin- und Rückweg unverändert", () => {
    const eingabe = {
      slug: "muster",
      name: "Müller & Söhne GmbH",
      farben: { primaer: "#0c6b5e", akzent: "#ff5c16" },
      texte: { ueberschrift: "Straße frei für „Automatisierung“" },
      useCases: ["rechnung", "wissen"],
      mengen: { rechnung: { proTag: 120 } },
    };
    expect(markeDekodieren(markeKodieren(eingabe))).toEqual(eingabe);
  });

  it("erzeugen keine Zeichen, die eine URL zerbrechen", () => {
    const code = markeKodieren({ slug: "a", name: "Äöü ß & / + =", farben: { primaer: "#000" } });
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("geben bei Unsinn null zurück statt zu werfen", () => {
    expect(markeDekodieren("kein-base64!!")).toBeNull();
    expect(markeDekodieren("")).toBeNull();
    expect(markeDekodieren(btoa("[1,2,3]"))).toBeNull();
    expect(markeDekodieren(btoa('{"ohne":"namen"}'))).toBeNull();
  });
});

describe("Schriftauflösung", () => {
  it("erkennt Register-Schriften in jeder Schreibweise", () => {
    expect(schriftSchluessel("openSans")).toBe("openSans");
    expect(schriftSchluessel("Open Sans")).toBe("openSans");
    expect(schriftSchluessel("open-sans")).toBe("openSans");
    expect(schriftSchluessel("Geist Mono")).toBe("geistMono");
  });

  it("gibt null für Schriften, die nicht ausgeliefert werden können", () => {
    // Sonst würde die Seite versuchen, sie von einem fremden Server zu laden.
    for (const name of ["DINWebPro", "Frutiger-Web", "wuerthsans_book", "SICK Intl", undefined]) {
      expect(schriftSchluessel(name), String(name)).toBeNull();
    }
  });
});
