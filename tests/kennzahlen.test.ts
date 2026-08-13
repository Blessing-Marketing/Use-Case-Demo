import { describe, expect, it } from "vitest";
import { ersparnisStunden, faktor, gesamtErsparnis, mengengeruest, mengeText } from "@/lib/kennzahlen";
import { aufloesen } from "@/lib/marke";
import { ALLE_USE_CASES, useCase } from "@/lib/usecases";

const rechnung = useCase("rechnung")!;
const onboarding = useCase("onboarding")!;

const ohneMengen = aufloesen({ slug: "x", name: "X", farben: { primaer: "#0c6b5e" } });
const mitMengen = aufloesen({
  slug: "y",
  name: "Y",
  farben: { primaer: "#0c6b5e" },
  mengen: { rechnung: { proTag: 120, manuellMinuten: 14 } },
  arbeitstage: 250,
});

describe("mengengeruest", () => {
  it("nimmt die Werte des Ablaufs, wenn der Kunde nichts angibt", () => {
    const m = mengengeruest(rechnung, ohneMengen);
    expect(m.proTag).toBe(rechnung.menge.proTag);
    expect(m.manuellMinuten).toBe(rechnung.manuellMinuten);
    expect(m.arbeitstage).toBe(220);
  });

  it("markiert genau dann als Schätzung, wenn ein Wert fehlt", () => {
    expect(mengengeruest(rechnung, ohneMengen).geschaetzt).toBe(true);
    expect(mengengeruest(rechnung, mitMengen).geschaetzt).toBe(false);
    // Nur ein Wert gesetzt reicht nicht
    const halb = aufloesen({
      slug: "z",
      name: "Z",
      farben: { primaer: "#0c6b5e" },
      mengen: { rechnung: { proTag: 120 } },
    });
    expect(mengengeruest(rechnung, halb).geschaetzt).toBe(true);
  });

  it("übernimmt die Werte des Kunden", () => {
    const m = mengengeruest(rechnung, mitMengen);
    expect(m.proTag).toBe(120);
    expect(m.manuellMinuten).toBe(14);
    expect(m.arbeitstage).toBe(250);
  });

  it("ignoriert unsinnige Werte", () => {
    const kaputt = aufloesen({
      slug: "k",
      name: "K",
      farben: { primaer: "#0c6b5e" },
      mengen: { rechnung: { proTag: 0, manuellMinuten: -5 } },
    });
    const m = mengengeruest(rechnung, kaputt);
    expect(m.proTag).toBe(rechnung.menge.proTag);
    expect(m.manuellMinuten).toBe(rechnung.manuellMinuten);
    expect(m.geschaetzt).toBe(true);
  });
});

describe("ersparnisStunden", () => {
  it("rechnet nachvollziehbar", () => {
    // (14 min - 8 s) * 120 Vorgänge * 250 Tage / 60
    const m = mengengeruest(rechnung, mitMengen);
    const erwartet = Math.round(((14 - m.autoSekunden / 60) * 120 * 250) / 60);
    expect(ersparnisStunden(m)).toBe(erwartet);
  });

  it("wird nie negativ", () => {
    const absurd = aufloesen({
      slug: "a",
      name: "A",
      farben: { primaer: "#0c6b5e" },
      mengen: { rechnung: { proTag: 1, manuellMinuten: 1 } },
    });
    expect(ersparnisStunden(mengengeruest(rechnung, absurd))).toBeGreaterThanOrEqual(0);
  });
});

describe("mengeText", () => {
  it("verwendet die Einzahl bei genau einem Vorgang", () => {
    expect(mengeText(mengengeruest(onboarding, ohneMengen))).toBe("1 Eintritt");
  });

  it("verwendet die Mehrzahl bei mehreren", () => {
    expect(mengeText(mengengeruest(rechnung, ohneMengen))).toBe("60 Belege");
    expect(mengeText(mengengeruest(rechnung, mitMengen))).toBe("120 Belege");
  });
});

describe("faktor", () => {
  it("beschreibt, wie viel schneller es geht", () => {
    expect(faktor(mengengeruest(rechnung, ohneMengen))).toBe(
      Math.round((rechnung.manuellMinuten * 60) / rechnung.autoSekunden),
    );
  });
});

describe("gesamtErsparnis", () => {
  it("markiert die Summe als Schätzung, sobald ein Ablauf geschätzt ist", () => {
    expect(gesamtErsparnis(ALLE_USE_CASES, mitMengen).geschaetzt).toBe(true);
    expect(gesamtErsparnis([rechnung], mitMengen).geschaetzt).toBe(false);
  });

  it("summiert über alle Abläufe", () => {
    const summe = gesamtErsparnis([rechnung, onboarding], ohneMengen);
    expect(summe.stunden).toBe(
      ersparnisStunden(mengengeruest(rechnung, ohneMengen)) +
        ersparnisStunden(mengengeruest(onboarding, ohneMengen)),
    );
  });
});
