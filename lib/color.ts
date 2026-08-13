/**
 * Minimale Farbhelfer. Reicht, um aus 2-3 Kundenfarben ein volles Token-Set
 * abzuleiten, ohne eine Farbbibliothek einzuziehen.
 */

export type Rgb = { r: number; g: number; b: number };

export function parseHex(input: string): Rgb {
  let hex = input.trim().replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function isHex(input: string): boolean {
  const hex = input.trim().replace(/^#/, "");
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

export function toHex({ r, g, b }: Rgb): string {
  const part = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Relative Luminanz nach WCAG. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.42;
}

/** Lineare Mischung im sRGB-Raum. t = 0 gibt a, t = 1 gibt b. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a);
  const cb = parseHex(b);
  return toHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

/** Wählt Schwarz oder Weiß - je nachdem, was auf der Fläche besser lesbar ist. */
export function readableOn(background: string, dark = "#0B0E11", light = "#FFFFFF"): string {
  return contrastRatio(background, dark) >= contrastRatio(background, light) ? dark : light;
}

/**
 * Dunkelt eine Farbe so weit ab (oder hellt sie auf), bis sie als Text auf dem
 * Hintergrund lesbar ist. Der Farbton bleibt dabei erhalten.
 *
 * Nötig, weil Markenfarben nicht für Text gemacht sind: ein Signalorange oder
 * ein Zitronengelb hat auf Weiß gerade einmal 2:1 - die Marke gibt sie aber
 * trotzdem vor, und die Beschriftung muss lesbar bleiben.
 */
export function lesbarMachen(farbe: string, hintergruende: string[], ziel = 4.5): string {
  const passt = (kandidat: string) => hintergruende.every((h) => contrastRatio(kandidat, h) >= ziel);
  if (passt(farbe)) return farbe;
  const richtung = isLight(hintergruende[0]) ? "#000000" : "#ffffff";
  for (let anteil = 0.05; anteil < 1; anteil += 0.05) {
    const kandidat = mix(farbe, richtung, anteil);
    if (passt(kandidat)) return kandidat;
  }
  return richtung;
}

/**
 * Zwei abgestufte Textfarben, beide lesbar.
 *
 * Zwei Fallstricke, die einzeln gerechnet beide zuschlagen:
 * Erstens kann die hellere Stufe am Ende dunkler ausfallen als die kräftigere -
 * dann ist die Abstufung hin. Zweitens stehen dieselben Texte mal auf der
 * Grundfläche und mal auf einer Karte; geprüft werden muss gegen beide.
 */
export function textAbstufungen(
  ink: string,
  mischBasis: string,
  hintergruende: string[],
  ziel = 4.5,
): { gedaempft: string; zurueckhaltend: string } {
  const reicht = (anteil: number) => {
    const ton = mix(mischBasis, ink, anteil);
    return hintergruende.every((h) => contrastRatio(ton, h) >= ziel);
  };

  let leise = 0.45;
  while (leise < 1 && !reicht(leise)) leise += 0.04;
  const kraeftig = Math.min(1, Math.max(0.62, leise + 0.16));

  return {
    zurueckhaltend: mix(mischBasis, ink, Math.min(1, leise)),
    gedaempft: mix(mischBasis, ink, kraeftig),
  };
}

export type Hsl = { h: number; s: number; l: number };

export function toHsl(hex: string): Hsl {
  const { r, g, b } = parseHex(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
  else if (max === gn) h = ((bn - rn) / d + 2) * 60;
  else h = ((rn - gn) / d + 4) * 60;
  return { h, s, l };
}

/** Farbe, die als Markenfarbe taugt: bunt genug, weder fast weiß noch fast schwarz. */
export function istMarkenfarbe(hex: string): boolean {
  const { s, l } = toHsl(hex);
  return s > 0.16 && l > 0.1 && l < 0.78;
}

/** Abstand zweier Farbtöne auf dem Farbkreis, 0-180. */
export function farbtonAbstand(a: string, b: string): number {
  const diff = Math.abs(toHsl(a).h - toHsl(b).h) % 360;
  return diff > 180 ? 360 - diff : diff;
}
