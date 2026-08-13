import type { CSSProperties } from "react";
import { isHex, isLight, lesbarMachen, mix, readableOn, textAbstufungen } from "./color";
import { fontStack, type FontKey } from "./schriften";

/**
 * Eine Marke ist die einzige Stelle, an der sich Demos zwischen Kunden
 * unterscheiden. Pflicht sind Name und Primaerfarbe - alles Weitere wird
 * abgeleitet, damit auch jemand ohne Design-Hintergrund einen Kunden anlegen kann.
 */

export type MarkeEingabe = {
  slug: string;
  name: string;
  branche?: string;
  logo?: { text?: string; bild?: string; hoehe?: number };
  farben: {
    primaer: string;
    ink?: string;
    flaeche?: string;
    papier?: string;
    akzent?: string;
    buehne?: string;
  };
  schriften?: { display?: string; text?: string; mono?: string };
  radius?: number;
  texte?: {
    eyebrow?: string;
    ueberschrift?: string;
    intro?: string;
    cta?: string;
    abschlussTitel?: string;
    abschlussText?: string;
  };
  kontakt?: { name?: string; rolle?: string; mail?: string; telefon?: string };
  useCases?: string[];
  /**
   * Mengen des Kunden je Ablauf. Was hier steht, ersetzt die Schätzwerte aus
   * der Ablaufvorlage - und nur dann wird die Hochrechnung als abgestimmt
   * ausgewiesen statt als Schätzung.
   */
  mengen?: Record<string, { proTag?: number; manuellMinuten?: number }>;
  /** Arbeitstage im Jahr für die Hochrechnung. */
  arbeitstage?: number;
  /**
   * Website, von der das Branding erfasst wurde. Reine Merkinformation:
   * ohne sie weiß das Studio beim Bearbeiten nicht mehr, wo die Farben,
   * Schriften und Logos herkamen.
   */
  quelle?: string;
};

export type Marke = Required<Omit<MarkeEingabe, "logo" | "kontakt" | "useCases">> & {
  logo: { text: string; bild?: string; hoehe: number };
  kontakt: { name?: string; rolle?: string; mail?: string; telefon?: string };
  useCases: string[];
  farben: Required<MarkeEingabe["farben"]> & {
    aufPrimaer: string;
    buehneInk: string;
    /** Akzent, so weit angepasst, dass er als Text lesbar bleibt. */
    akzentText: string;
    akzentAufBuehne: string;
    /** Abgestufte Textfarben, jede über 4,5:1. */
    gedaempft: string;
    zurueckhaltend: string;
    buehneGedaempft: string;
  };
  schriften: Required<NonNullable<MarkeEingabe["schriften"]>>;
  texte: Required<NonNullable<MarkeEingabe["texte"]>>;
  hell: boolean;
};

const FALLBACK_FLAECHE = "#e9ecea";
const FALLBACK_PRIMAER = "#0c6b5e";

function farbe(wert: string | undefined, ersatz: string): string {
  return wert && isHex(wert) ? (wert.startsWith("#") ? wert : `#${wert}`) : ersatz;
}

export function aufloesen(eingabe: MarkeEingabe): Marke {
  const flaeche = farbe(eingabe.farben?.flaeche, FALLBACK_FLAECHE);
  const hell = isLight(flaeche);

  const primaer = farbe(eingabe.farben?.primaer, FALLBACK_PRIMAER);
  const ink = farbe(eingabe.farben?.ink, hell ? "#101418" : "#f2f4f3");
  const papier = farbe(
    eingabe.farben?.papier,
    hell ? mix(flaeche, "#ffffff", 0.74) : mix(flaeche, "#ffffff", 0.07),
  );
  const akzent = farbe(eingabe.farben?.akzent, primaer);
  const buehne = farbe(
    eingabe.farben?.buehne,
    hell ? mix(ink, "#000000", 0.22) : mix(flaeche, "#000000", 0.42),
  );

  const buehneInk = readableOn(buehne, "#0b0e11", "#eef1ef");
  // Dieselben Texte stehen mal auf der Grundfläche, mal auf einer Karte.
  const flaechen = [flaeche, papier];
  const stufen = textAbstufungen(ink, flaeche, flaechen);
  const buehneStufen = textAbstufungen(buehneInk, buehne, [buehne]);

  const name = eingabe.name?.trim() || "Musterkunde";

  return {
    slug: eingabe.slug,
    name,
    branche: eingabe.branche?.trim() || "",
    logo: {
      text: eingabe.logo?.text?.trim() || name,
      bild: eingabe.logo?.bild?.trim() || undefined,
      hoehe: eingabe.logo?.hoehe || 26,
    },
    farben: {
      primaer,
      ink,
      flaeche,
      papier,
      akzent,
      buehne,
      aufPrimaer: readableOn(primaer),
      buehneInk,
      akzentText: lesbarMachen(akzent, flaechen),
      akzentAufBuehne: lesbarMachen(akzent, [buehne]),
      gedaempft: stufen.gedaempft,
      zurueckhaltend: stufen.zurueckhaltend,
      buehneGedaempft: buehneStufen.gedaempft,
    },
    schriften: {
      display: eingabe.schriften?.display || "bricolage",
      text: eingabe.schriften?.text || "inter",
      mono: eingabe.schriften?.mono || "jetbrains",
    },
    radius: eingabe.radius ?? 4,
    texte: {
      eyebrow: eingabe.texte?.eyebrow || `Automatisierung für ${name}`,
      ueberschrift: eingabe.texte?.ueberschrift || "Arbeit, die sich selbst erledigt.",
      intro:
        eingabe.texte?.intro ||
        "Typische Abläufe aus Ihrem Alltag – einmal von Hand, einmal automatisch. Klicken Sie einen an und sehen Sie zu.",
      cta: eingabe.texte?.cta || "Demo ansehen",
      abschlussTitel: eingabe.texte?.abschlussTitel || "Welchen Ablauf schauen wir uns genauer an?",
      abschlussText:
        eingabe.texte?.abschlussText ||
        "Wir bauen einen dieser Abläufe mit Ihren echten Daten nach. Unverbindlich, in rund zwei Wochen.",
    },
    kontakt: eingabe.kontakt ?? {},
    useCases: eingabe.useCases ?? [],
    mengen: eingabe.mengen ?? {},
    arbeitstage: eingabe.arbeitstage ?? 220,
    quelle: eingabe.quelle ?? "",
    hell,
  };
}

/** Die aufgeloeste Marke als CSS-Variablen - kommt auf den [data-brand]-Wrapper. */
export function markenVariablen(marke: Marke): CSSProperties {
  return {
    "--c-surface": marke.farben.flaeche,
    "--c-paper": marke.farben.papier,
    "--c-ink": marke.farben.ink,
    "--c-primary": marke.farben.primaer,
    "--c-on-primary": marke.farben.aufPrimaer,
    "--c-accent": marke.farben.akzent,
    "--c-accent-text": marke.farben.akzentText,
    "--c-accent-stage": marke.farben.akzentAufBuehne,
    // Überschreiben die color-mix-Vorgaben aus globals.css: dort ist das
    // Verhältnis fest, hier ist es je Marke auf Lesbarkeit gerechnet.
    "--c-muted": marke.farben.gedaempft,
    "--c-faint": marke.farben.zurueckhaltend,
    "--c-stage-muted": marke.farben.buehneGedaempft,
    "--c-stage": marke.farben.buehne,
    "--c-stage-ink": marke.farben.buehneInk,
    "--r": `${marke.radius}px`,
    "--f-display": fontStack(marke.schriften.display, "bricolage" as FontKey),
    "--f-body": fontStack(marke.schriften.text, "inter" as FontKey),
    "--f-mono": fontStack(marke.schriften.mono, "jetbrains" as FontKey),
  } as CSSProperties;
}

/* --------------------------------------------------------------------------
   Kodierung fuer Vorschau-Links: Marke wandert base64url-kodiert in die URL,
   damit der Vertrieb einen Entwurf teilen kann, bevor irgendetwas deployt ist.
-------------------------------------------------------------------------- */

export function markeKodieren(eingabe: MarkeEingabe): string {
  const json = JSON.stringify(eingabe);
  const bytes = new TextEncoder().encode(json);
  let binaer = "";
  bytes.forEach((b) => {
    binaer += String.fromCharCode(b);
  });
  const b64 = typeof btoa === "function" ? btoa(binaer) : Buffer.from(json, "utf8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function markeDekodieren(code: string): MarkeEingabe | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const gefuellt = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    let json: string;
    if (typeof atob === "function") {
      const binaer = atob(gefuellt);
      const bytes = Uint8Array.from(binaer, (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else {
      json = Buffer.from(gefuellt, "base64").toString("utf8");
    }
    const daten = JSON.parse(json);
    if (!daten || typeof daten !== "object" || typeof daten.name !== "string") return null;
    return daten as MarkeEingabe;
  } catch {
    return null;
  }
}
