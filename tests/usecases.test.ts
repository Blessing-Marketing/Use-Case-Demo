import { describe, expect, it } from "vitest";
import { ALLE_USE_CASES, gesamtSekunden, useCasesFuer, zeitLabel } from "@/lib/usecases";

/**
 * Prüft die Inhalte selbst. Abläufe werden von Hand oder mit KI-Hilfe
 * geschrieben - hier fällt auf, wenn dabei etwas auseinanderläuft.
 */

describe("Abläufe", () => {
  it("haben eindeutige Kürzel", () => {
    const slugs = ALLE_USE_CASES.map((uc) => uc.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const uc of ALLE_USE_CASES) {
    describe(uc.slug, () => {
      it("hat eine angegebene Laufzeit, die zu den Stationen passt", () => {
        // Sonst zählt die Stoppuhr in der Demo bis zu einer anderen Zahl als
        // der, die auf der Karte steht.
        expect(Math.abs(gesamtSekunden(uc) - uc.autoSekunden)).toBeLessThanOrEqual(0.5);
      });

      it("ist schneller als die Handarbeit", () => {
        expect(uc.autoSekunden).toBeLessThan(uc.manuellMinuten * 60);
      });

      it("hat mindestens vier Stationen mit vollständigen Angaben", () => {
        expect(uc.stationen.length).toBeGreaterThanOrEqual(4);
        for (const st of uc.stationen) {
          expect(st.id, `${uc.slug}: id`).toBeTruthy();
          expect(st.station, `${uc.slug}/${st.id}: station`).toBeTruthy();
          expect(st.titel, `${uc.slug}/${st.id}: titel`).toBeTruthy();
          expect(st.detail, `${uc.slug}/${st.id}: detail`).toBeTruthy();
          expect(st.sekunden, `${uc.slug}/${st.id}: sekunden`).toBeGreaterThan(0);
          expect(st.beleg, `${uc.slug}/${st.id}: beleg`).toBeTruthy();
        }
      });

      it("hat eindeutige Stations-Kennungen", () => {
        const ids = uc.stationen.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("hat drei Vorteile und mindestens ein System", () => {
        expect(uc.vorteile.length).toBe(3);
        for (const v of uc.vorteile) {
          expect(v.titel).toBeTruthy();
          expect(v.text.length).toBeGreaterThan(30);
        }
        expect(uc.systeme.length).toBeGreaterThan(0);
      });

      it("hat eine Mengenangabe mit Einzahlform", () => {
        expect(uc.menge.proTag).toBeGreaterThan(0);
        expect(uc.menge.einheit).toBeTruthy();
        // Ohne Einzahlform entsteht bei proTag = 1 "1 Eintritte".
        expect(uc.menge.einheitEinzahl, `${uc.slug}: einheitEinzahl fehlt`).toBeTruthy();
      });

      it("beschreibt Auslöser und Ergebnis", () => {
        expect(uc.ausloeser).toBeTruthy();
        expect(uc.ergebnis).toBeTruthy();
        expect(uc.versprechen.length).toBeGreaterThan(20);
      });
    });
  }
});

describe("useCasesFuer", () => {
  it("gibt ohne Auswahl alle Abläufe zurück", () => {
    expect(useCasesFuer([])).toHaveLength(ALLE_USE_CASES.length);
    expect(useCasesFuer(undefined)).toHaveLength(ALLE_USE_CASES.length);
  });

  it("hält die Reihenfolge der Auswahl ein", () => {
    expect(useCasesFuer(["wissen", "rechnung"]).map((u) => u.slug)).toEqual(["wissen", "rechnung"]);
  });

  it("überspringt unbekannte Kürzel", () => {
    expect(useCasesFuer(["rechnung", "gibtesnicht"]).map((u) => u.slug)).toEqual(["rechnung"]);
  });
});

describe("zeitLabel", () => {
  it("wählt eine passende Einheit", () => {
    expect(zeitLabel(8)).toBe("8 s");
    expect(zeitLabel(540)).toBe("9 min");
    expect(zeitLabel(12600)).toBe("3 h 30 min");
    expect(zeitLabel(7200)).toBe("2 h");
  });
});
