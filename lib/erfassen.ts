import { bildAdresse } from "./bildsignatur";
import { farbtonAbstand, isHex, istMarkenfarbe, toHex, toHsl } from "./color";
import { schriftSchluessel } from "./schriften";
import type { MarkeEingabe } from "./marke";
import { NetzFehler, sichererAbruf } from "./netzschutz";

/**
 * Erfasst das Erscheinungsbild einer Kundenwebsite: Logo, Farben, Schriften,
 * Firmenname. Alles serverseitig, damit weder CORS noch Werbeblocker stoeren.
 * Ergebnis ist ein Vorschlag - im Studio wird er geprueft und korrigiert.
 */

export type Farbfund = { hex: string; treffer: number; quelle: string };

export type Befund = {
  quelle: string;
  name: string;
  /** Vorschlag für die Adresse, aus der Domain abgeleitet: festool.de -> festool */
  kuerzel: string;
  farben: { primaer?: string; akzent?: string; ink?: string; flaeche?: string };
  farbKandidaten: Farbfund[];
  schriften: {
    /** Register-Schlüssel, falls die erkannte Schrift ausgeliefert werden kann. */
    display?: string;
    text?: string;
    /** Alles, was im CSS gefunden wurde - reine Information. */
    kandidaten: string[];
    /** Erkannt und im Register vorhanden. */
    verfuegbar: string[];
    /** Erkannt, aber nicht auslieferbar. */
    fehlend: string[];
  };
  /** Gefundene Bildmarken: Originaladresse und fertige Proxy-Adresse. */
  logos: { quelle: string; adresse: string }[];
  hinweise: string[];
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const GENERISCHE_SCHRIFTEN = new Set(
  [
    "sans-serif",
    "serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "ui-rounded",
    "-apple-system",
    "blinkmacsystemfont",
    "apple-system",
    "segoe ui",
    "helvetica",
    "helvetica neue",
    "arial",
    "arial black",
    "times",
    "times new roman",
    "courier",
    "courier new",
    "georgia",
    "verdana",
    "tahoma",
    "inherit",
    "initial",
    "unset",
    "revert",
    "sans",
    "icons",
    "emoji",
    // Werte, die beim Auslesen von minifiziertem CSS mitrutschen
    "false",
    "true",
    "none",
    "auto",
    "normal",
    "bold",
    "italic",
    "screen",
    "only screen",
    "all",
    // Systemschriften: vorhanden, aber keine Hausschrift
    "consolas",
    "calibri",
    "cambria",
    "segoe",
    "menlo",
    "monaco",
    "lucida grande",
    "trebuchet ms",
    "palatino",
    "impact",
    "comic sans ms",
    "roboto condensed",
  ].map((s) => s.toLowerCase()),
);

/**
 * Ein Schriftname beginnt mit einem Buchstaben und enthält keine Pfad- oder
 * CSS-Zeichen. Ohne diese Prüfung landen Versionspfade wie "/5.5.3/" oder
 * Reste von Media-Queries in der Kundendatei.
 */
const SCHRIFT_MUSTER = /^[A-Za-zÀ-ÿ][A-Za-z0-9À-ÿ .\-_+]{1,39}$/;

export function istSchriftname(name: string): boolean {
  if (!SCHRIFT_MUSTER.test(name)) return false;
  if (GENERISCHE_SCHRIFTEN.has(name.toLowerCase())) return false;
  if (/^\d+(\.\d+)*$/.test(name)) return false;
  return true;
}

const MARKEN_VAR = /(brand|primary|primaer|accent|akzent|main|theme|corporate|cta|highlight)/i;

/** Selektoren, deren Farben typischerweise die Markenfarbe sind. */
const TRAGENDE_STELLE = /(^|[\s.#,[])(btn|button|cta|c-button|primary|brand|header|navbar|nav-|site-header|masthead|topbar)/i;

/** Schriftnamen, die technisch sind und nicht als Hausschrift taugen. */
const TECHNISCHE_SCHRIFT = /(icon|glyph|skeleton|swiper|symbol|awesome|material|_)/i;

/* -------------------------------------------------------------------------- */

export class ErfassungsFehler extends Error {}

export function normalisiereUrl(eingabe: string): URL {
  const roh = eingabe.trim();

  // "kunde.de" darf ohne Schema kommen. Ein fremdes Schema wird dagegen
  // abgelehnt statt verbogen: sonst würde aus "file:///etc/passwd" still und
  // leise "https://file:///etc/passwd".
  const schema = roh.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/)?.[1]?.toLowerCase();
  const istHostMitPort = schema ? /^\d+(\/|$)/.test(roh.slice(schema.length + 1)) : false;
  if (schema && !istHostMitPort && schema !== "http" && schema !== "https") {
    throw new ErfassungsFehler("Nur http- und https-Adressen sind möglich.");
  }

  const mitSchema = /^https?:\/\//i.test(roh) ? roh : `https://${roh}`;
  let url: URL;
  try {
    url = new URL(mitSchema);
  } catch {
    throw new ErfassungsFehler("Das sieht nicht nach einer Webadresse aus.");
  }
  if (!/^https?:$/.test(url.protocol)) {
    throw new ErfassungsFehler("Nur http- und https-Adressen sind möglich.");
  }
  const host = url.hostname.toLowerCase();
  const privat =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    /^(127|10)\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "0.0.0.0" ||
    host === "[::1]";
  if (privat) throw new ErfassungsFehler("Interne Adressen können nicht erfasst werden.");
  return url;
}

/**
 * Zeichensatz bestimmen. Viele gewachsene Seiten schicken einen
 * Latin-1-Header, liefern aber UTF-8 - dann waeren Umlaute zerschossen.
 */
function dekodieren(puffer: ArrayBuffer, contentType: string): string {
  // Der Deklaration ist nicht zu trauen: viele Seiten melden Latin-1 und
  // liefern UTF-8. Deshalb zuerst pruefen, ob die Bytes als UTF-8 aufgehen.
  const alsUtf8 = new TextDecoder("utf-8").decode(puffer);
  const fehlzeichen = (alsUtf8.match(/�/g) ?? []).length;
  if (fehlzeichen / Math.max(1, alsUtf8.length) < 0.0005) return alsUtf8;

  const ausMeta = /<meta[^>]+charset=["']?\s*([\w-]+)/i.exec(alsUtf8.slice(0, 4096))?.[1];
  const ausKopf = /charset=["']?\s*([\w-]+)/i.exec(contentType)?.[1];
  const zeichensatz = (ausMeta ?? ausKopf ?? "windows-1252").toLowerCase();
  try {
    return new TextDecoder(zeichensatz).decode(puffer);
  } catch {
    return new TextDecoder("windows-1252").decode(puffer);
  }
}

async function holen(url: string, maxBytes = 1_500_000): Promise<{ text: string; url: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    // Gilt auch für Stylesheets: deren Adressen stammen aus der fremden Seite
    // und dürfen genauso wenig ins interne Netz zeigen wie die Hauptadresse.
    const antwort = await sichererAbruf(normalisiereUrl(url), {
      headers: { "user-agent": UA, accept: "text/html,text/css,*/*" },
      signal: controller.signal,
    });
    if (!antwort.ok) throw new ErfassungsFehler(`Die Seite antwortet mit Status ${antwort.status}.`);
    const puffer = await antwort.arrayBuffer();
    const text = dekodieren(
      puffer.byteLength > maxBytes ? puffer.slice(0, maxBytes) : puffer,
      antwort.headers.get("content-type") ?? "",
    );
    return { text, url: antwort.url || url };
  } catch (fehler) {
    if (fehler instanceof ErfassungsFehler) throw fehler;
    if (fehler instanceof NetzFehler) throw new ErfassungsFehler(fehler.message);
    if ((fehler as Error)?.name === "AbortError") {
      throw new ErfassungsFehler("Die Seite hat zu lange gebraucht.");
    }
    throw new ErfassungsFehler("Die Seite ist nicht erreichbar.");
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------- HTML-Teile ------------------------------- */

function attribut(tag: string, name: string): string | undefined {
  const treffer = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return treffer ? (treffer[2] ?? treffer[3] ?? treffer[4] ?? "").trim() : undefined;
}

function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function absolut(basis: string, pfad: string | undefined): string | undefined {
  if (!pfad) return undefined;
  if (/^data:/i.test(pfad)) return pfad;
  try {
    return new URL(pfad, basis).toString();
  } catch {
    return undefined;
  }
}

export function entpackeHtml(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) => sicheresZeichen(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => sicheresZeichen(parseInt(d, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function sicheresZeichen(codepunkt: number): string {
  if (!Number.isFinite(codepunkt) || codepunkt < 9 || codepunkt > 0x10ffff) return "";
  try {
    return String.fromCodePoint(codepunkt);
  } catch {
    return "";
  }
}

/* -------------------------------- Farben ---------------------------------- */

function farbenAusCss(css: string, quelle: string, treffer: Map<string, Farbfund>) {
  const zaehle = (hex: string, gewicht: number, herkunft: string) => {
    const key = hex.toLowerCase();
    const vorhanden = treffer.get(key);
    if (vorhanden) {
      vorhanden.treffer += gewicht;
      if (herkunft === "Markenvariable") vorhanden.quelle = herkunft;
    } else {
      treffer.set(key, { hex: key, treffer: gewicht, quelle: herkunft });
    }
  };

  // CSS-Variablen mit sprechendem Namen zaehlen besonders viel.
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
    const name = m[1];
    const wert = m[2].trim();
    const hex = alsHex(wert);
    if (!hex) continue;
    zaehle(hex, MARKEN_VAR.test(name) ? 60 : 8, MARKEN_VAR.test(name) ? "Markenvariable" : quelle);
  }

  for (const m of css.matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)) {
    zaehle(alsHex(`#${m[1]}`)!, 1, quelle);
  }
  for (const m of css.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g)) {
    zaehle(toHex({ r: +m[1], g: +m[2], b: +m[3] }), 1, quelle);
  }

  // Farben aus Schaltflaechen, Kopfbereich und Navigation sind fast immer die
  // Markenfarbe - deutlich verlaesslicher als blosse Haeufigkeit.
  for (const regel of css.slice(0, 1_500_000).matchAll(/([^{}]{1,400})\{([^{}]{0,4000})\}/g)) {
    if (!TRAGENDE_STELLE.test(regel[1])) continue;
    for (const m of regel[2].matchAll(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g)) {
      zaehle(alsHex(`#${m[1]}`)!, 14, "Schaltfläche");
    }
    for (const m of regel[2].matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/g)) {
      zaehle(toHex({ r: +m[1], g: +m[2], b: +m[3] }), 14, "Schaltfläche");
    }
  }
}

export function alsHex(wert: string): string | null {
  const roh = wert.trim();
  const hex = roh.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3)
      h = h
        .split("")
        .map((c) => c + c)
        .join("");
    return `#${h.toLowerCase()}`;
  }
  const rgb = roh.match(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/);
  if (rgb) return toHex({ r: +rgb[1], g: +rgb[2], b: +rgb[3] }).toLowerCase();
  return null;
}

/* ------------------------------- Schriften -------------------------------- */

function schriftenAusCss(css: string, punkte: Map<string, number>) {
  const gib = (name: string, gewicht: number) => {
    const sauber = name.replace(/["'\\]/g, "").trim();
    if (!istSchriftname(sauber)) return;
    punkte.set(sauber, (punkte.get(sauber) ?? 0) + gewicht);
  };

  for (const m of css.matchAll(/@font-face[^{]*\{[^}]*?font-family\s*:\s*([^;}]+)/gi)) {
    gib(m[1].split(",")[0], 40);
  }
  for (const m of css.matchAll(/font-family\s*:\s*([^;}!]+)/gi)) {
    gib(m[1].split(",")[0], 3);
  }
  for (const m of css.matchAll(/fonts\.googleapis\.com\/css2?\?([^"')\s]+)/gi)) {
    for (const f of m[1].matchAll(/family=([^&:]+)/g)) {
      gib(decodeURIComponent(f[1]).replace(/\+/g, " "), 50);
    }
  }
}

/* --------------------------------- Kern ----------------------------------- */

export async function markeErfassen(eingabe: string): Promise<Befund> {
  const url = normalisiereUrl(eingabe);
  const { text: html, url: endUrl } = await holen(url.toString());
  const hinweise: string[] = [];

  /* Name */
  const metas = tags(html, "meta");
  const metaWert = (schluessel: string, attr: "name" | "property" = "name") =>
    metas
      .map((t) =>
        attribut(t, attr)?.toLowerCase() === schluessel ? attribut(t, "content") : undefined,
      )
      .find(Boolean);

  const titel = entpackeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const titelKopf = titel.split(/\s*[|–—·•»«›‹]\s*|\s-\s/)[0]?.trim() ?? "";
  const domainBasis = new URL(endUrl).hostname.replace(/^www\./i, "").split(".")[0];

  // Der Seitentitel ist oft ein Werbespruch ("Elektrowerkzeuge für Profis").
  // Als Firmenname taugt er nur, wenn der Domainname darin vorkommt.
  const titelTaugt =
    titelKopf.length > 0 &&
    titelKopf.length <= 60 &&
    vereinfachen(titelKopf).includes(vereinfachen(domainBasis));

  const name =
    metaWert("og:site_name", "property") ||
    metaWert("application-name") ||
    (titelTaugt ? titelKopf : grossAnfang(domainBasis));

  /* Stylesheets einsammeln */
  const styleBloecke = Array.from(html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)).map(
    (m) => m[1],
  );
  const stylesheetUrls = tags(html, "link")
    .filter((t) => (attribut(t, "rel") ?? "").toLowerCase().includes("stylesheet"))
    .map((t) => absolut(endUrl, attribut(t, "href")))
    .filter((u): u is string => Boolean(u))
    .slice(0, 5);

  const externeCss: string[] = [];
  await Promise.all(
    stylesheetUrls.map(async (u) => {
      if (/fonts\.googleapis\.com/.test(u)) {
        externeCss.push(`/* ${u} */`);
        return;
      }
      try {
        const { text } = await holen(u, 700_000);
        externeCss.push(text);
      } catch {
        /* einzelne Stylesheets duerfen fehlen */
      }
    }),
  );

  const alleCss = [
    ...styleBloecke,
    ...externeCss,
    // Inline-Styles und Google-Fonts-Links aus dem HTML mitlesen
    ...tags(html, "link").map((t) => attribut(t, "href") ?? ""),
    ...Array.from(html.matchAll(/style\s*=\s*"([^"]*)"/gi)).map((m) => m[1]),
  ].join("\n");

  /* Farben */
  const farbTreffer = new Map<string, Farbfund>();
  const themeColor = metaWert("theme-color");
  if (themeColor && alsHex(themeColor)) {
    farbTreffer.set(alsHex(themeColor)!, {
      hex: alsHex(themeColor)!,
      treffer: 45,
      quelle: "theme-color",
    });
  }
  farbenAusCss(alleCss, "Stylesheet", farbTreffer);

  const sortiert = Array.from(farbTreffer.values()).sort((a, b) => b.treffer - a.treffer);
  const marken = sortiert.filter((f) => istMarkenfarbe(f.hex) && isHex(f.hex));
  const primaer = marken[0]?.hex;
  const akzent = primaer
    ? marken.find((f) => farbtonAbstand(f.hex, primaer) > 35 && f.hex !== primaer)?.hex
    : undefined;

  const hell = sortiert.filter((f) => toHsl(f.hex).l > 0.9);
  const dunkel = sortiert.filter((f) => toHsl(f.hex).l < 0.22);

  /* Schriften */
  const schriftPunkte = new Map<string, number>();
  schriftenAusCss(alleCss, schriftPunkte);
  const schriftListe = Array.from(schriftPunkte.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n)
    .slice(0, 8);
  // Für den Vorschlag nur Schriften, die als Hausschrift taugen UND von uns
  // ausgeliefert werden können. Alles andere würde entweder nach Icon-Font
  // aussehen oder gar nicht laden.
  const brauchbar = schriftListe.filter((s) => !TECHNISCHE_SCHRIFT.test(s));
  const verfuegbar = brauchbar.filter((s) => schriftSchluessel(s));
  const fehlend = brauchbar.filter((s) => !schriftSchluessel(s));

  /* Logos - bewertet statt nur gesammelt, damit die Wortmarke vor dem
     Favicon landet. */
  const logoPunkte = new Map<string, number>();
  const merke = (u: string | undefined, punkte: number) => {
    if (!u) return;
    logoPunkte.set(u, Math.max(logoPunkte.get(u) ?? 0, punkte));
  };

  /** .ico taugt nie als sichtbares Logo - 16 Pixel im Seitenkopf. */
  const istIcoDatei = (u: string) => /\.ico(\?|$)/i.test(u);

  const bewerteBild = (u: string, basis: number): number => {
    const klein = u.toLowerCase();
    let punkte = basis;
    if (/\.svg(\?|$)/.test(klein)) punkte += 25;
    else if (/\.png(\?|$)/.test(klein)) punkte += 10;
    else if (/\.jpe?g(\?|$)/.test(klein)) punkte -= 20;
    if (/sprite|placeholder|blank|spacer/.test(klein)) punkte -= 40;
    return punkte;
  };

  const bildQuellen = [...tags(html, "img"), ...tags(html, "source")];
  bildQuellen.forEach((tag, i) => {
    const quelle =
      attribut(tag, "src") ??
      attribut(tag, "data-src") ??
      attribut(tag, "data-lazy-src") ??
      attribut(tag, "srcset")?.split(",")[0]?.trim().split(/\s+/)[0];
    const absoluteUrl = absolut(endUrl, quelle);
    if (!absoluteUrl || istIcoDatei(absoluteUrl)) return;

    const direkt = /logo|wortmarke|signet/i.test(
      [quelle, attribut(tag, "alt")].filter(Boolean).join(" "),
    );
    const indirekt = /logo|wortmarke|signet/i.test(
      [attribut(tag, "class"), attribut(tag, "id")].filter(Boolean).join(" "),
    );
    if (!direkt && !indirekt) return;

    // Weiter oben im Dokument heißt in der Regel: im Seitenkopf.
    const frueh = i < Math.max(3, bildQuellen.length * 0.25) ? 15 : 0;
    merke(absoluteUrl, bewerteBild(absoluteUrl, (direkt ? 60 : 25) + frueh));
  });

  for (const tag of tags(html, "link")) {
    const rel = (attribut(tag, "rel") ?? "").toLowerCase();
    if (!/apple-touch-icon|^icon$|shortcut icon|mask-icon/.test(rel)) continue;
    const absoluteUrl = absolut(endUrl, attribut(tag, "href"));
    if (absoluteUrl && !istIcoDatei(absoluteUrl)) merke(absoluteUrl, bewerteBild(absoluteUrl, 25));
  }

  // og:image ist ein Vorschaubild fürs Teilen und meistens ein Foto - nur als
  // letzter Ausweg, auch wenn "logo" im Dateinamen steht.
  const ogBild = absolut(endUrl, metaWert("og:image", "property"));
  if (ogBild) merke(ogBild, 5);

  // Die Proxy-Adresse entsteht hier, weil nur der Server unterschreiben kann.
  const logoKandidaten = Array.from(logoPunkte.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([quelle]) => ({ quelle, adresse: bildAdresse(quelle) }));

  if (!primaer) hinweise.push("Keine eindeutige Markenfarbe gefunden – bitte von Hand setzen.");
  if (verfuegbar.length) {
    hinweise.push(`Schrift „${verfuegbar[0]}“ erkannt und übernommen.`);
  }
  if (fehlend.length) {
    hinweise.push(
      `Erkannt, aber nicht verfügbar: ${fehlend.join(", ")}. Diese Schriften liegen nicht im Register und werden nicht von fremden Servern nachgeladen – bitte eine Ersatzschrift wählen.`,
    );
  }
  if (!verfuegbar.length && !fehlend.length) {
    hinweise.push("Keine eigene Schrift erkannt – Standardschrift bleibt.");
  }
  if (!logoKandidaten.length) hinweise.push("Kein Logo gefunden – Wortmarke wird verwendet.");

  return {
    quelle: endUrl,
    name: entpackeHtml(name).slice(0, 80),
    kuerzel: slugAus(domainBasis),
    farben: {
      primaer,
      akzent: akzent && akzent !== primaer ? akzent : undefined,
      ink: dunkel[0]?.hex,
      flaeche: hell[0]?.hex,
    },
    farbKandidaten: sortiert.slice(0, 14),
    schriften: {
      display: schriftSchluessel(verfuegbar[0]) ?? undefined,
      text: schriftSchluessel(verfuegbar[1] ?? verfuegbar[0]) ?? undefined,
      kandidaten: schriftListe,
      verfuegbar,
      fehlend,
    },
    logos: logoKandidaten.slice(0, 6),
    hinweise,
  };
}

/** Befund in eine Marke uebersetzen, die direkt gerendert werden kann. */
export function befundAlsMarke(befund: Befund, slug: string): MarkeEingabe {
  return {
    slug,
    name: befund.name,
    quelle: befund.quelle,
    logo: befund.logos[0] ? { bild: befund.logos[0].adresse, hoehe: 30 } : { text: befund.name },
    farben: {
      primaer: befund.farben.primaer ?? "#0c6b5e",
      akzent: befund.farben.akzent,
      ink: befund.farben.ink,
      flaeche: befund.farben.flaeche,
    },
    schriften: {
      display: befund.schriften.display,
      text: befund.schriften.text,
      mono: "jetbrains",
    },
    useCases: [],
  };
}

/** Für Vergleiche: Kleinbuchstaben, Umlaute aufgelöst, nur Buchstaben und Ziffern. */
function vereinfachen(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

function grossAnfang(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function slugAus(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "kunde"
  );
}
