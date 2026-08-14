import { describe, expect, it } from "vitest";
import { SLUG_MUSTER } from "@/lib/kunden";
import { hatZusatz, mitZusatz, ohneZusatz, ZUSATZ_LAENGE, zufallsZusatz } from "@/lib/kuerzel";

describe("zufallsZusatz", () => {
  it("hat die vereinbarte Länge", () => {
    expect(zufallsZusatz()).toHaveLength(ZUSATZ_LAENGE);
    expect(zufallsZusatz(10)).toHaveLength(10);
  });

  it("meidet verwechselbare Zeichen", () => {
    // Die Adresse wird auch mal am Telefon vorgelesen: 0/O und 1/l/I raus.
    const viele = Array.from({ length: 300 }, () => zufallsZusatz()).join("");
    expect(viele).toMatch(/^[23456789abcdefghjkmnpqrstuvwxyz]+$/);
    expect(viele).not.toMatch(/[01ilo]/);
  });

  it("liefert nicht zweimal dasselbe", () => {
    const gezogen = new Set(Array.from({ length: 200 }, () => zufallsZusatz()));
    expect(gezogen.size).toBeGreaterThan(190);
  });
});

describe("mitZusatz", () => {
  it("hängt den Zusatz an den Stamm", () => {
    const kuerzel = mitZusatz("festool");
    expect(kuerzel).toMatch(/^festool-[23456789abcdefghjkmnpqrstuvwxyz]{6}$/);
  });

  it("erzeugt ein gültiges Kürzel, auch bei langen Firmennamen", () => {
    for (const basis of ["festool", "nordwerk-systemtechnik", "a", "sehr-langer-firmenname-der-alles-sprengt-und-noch-weiter-geht"]) {
      const kuerzel = mitZusatz(basis);
      expect(SLUG_MUSTER.test(kuerzel), `${basis} -> ${kuerzel}`).toBe(true);
      expect(kuerzel.length).toBeLessThanOrEqual(40);
    }
  });

  it("ersetzt einen vorhandenen Zusatz statt ihn zu stapeln", () => {
    const erst = mitZusatz("festool");
    const nochmal = mitZusatz(erst);
    expect(nochmal).toMatch(/^festool-[a-z2-9]{6}$/);
    expect(nochmal).not.toBe(erst);
  });

  it("kommt mit unbrauchbaren Eingaben zurecht", () => {
    expect(SLUG_MUSTER.test(mitZusatz(""))).toBe(true);
    expect(SLUG_MUSTER.test(mitZusatz("---"))).toBe(true);
  });
});

describe("hatZusatz und ohneZusatz", () => {
  it("erkennt den eigenen Zusatz", () => {
    const kuerzel = mitZusatz("festool");
    expect(hatZusatz(kuerzel)).toBe(true);
    expect(ohneZusatz(kuerzel)).toBe("festool");
  });

  it("lässt sprechende Kürzel unangetastet", () => {
    for (const k of ["festool", "nordwerk", "helia", "voltana", "blessing-marketing"]) {
      expect(hatZusatz(k), k).toBe(false);
      expect(ohneZusatz(k)).toBe(k);
    }
  });

  it("hält Hin- und Rückweg durch", () => {
    expect(ohneZusatz(mitZusatz("nordwerk-systemtechnik"))).toBe("nordwerk-systemtechnik");
  });
});
