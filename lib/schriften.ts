/**
 * Das Schriften-Register als reine Daten - ohne next/font, damit es überall
 * benutzbar und prüfbar bleibt. Geladen werden die Schriften in lib/fonts.ts.
 *
 * Wichtig: hier steht, was ausgeliefert werden kann. Alles, was nicht in
 * dieser Tabelle steht, wird nicht angezeigt und auch nicht von einem fremden
 * Server nachgeladen.
 */

const SANS = "ui-sans-serif, system-ui, sans-serif";
const SERIF = "ui-serif, Georgia, serif";
const MONO = "ui-monospace, monospace";

type FontEntry = { label: string; stack: string; role: "display" | "body" | "mono" | "beides" };

export const FONTS = {
  bricolage: {
    label: "Bricolage Grotesque",
    stack: `var(--font-bricolage), ${SANS}`,
    role: "display",
  },
  archivo: { label: "Archivo", stack: `var(--font-archivo), ${SANS}`, role: "beides" },
  sora: { label: "Sora", stack: `var(--font-sora), ${SANS}`, role: "display" },
  fraunces: { label: "Fraunces", stack: `var(--font-fraunces), ${SERIF}`, role: "display" },
  spaceGrotesk: {
    label: "Space Grotesk",
    stack: `var(--font-space-grotesk), ${SANS}`,
    role: "beides",
  },
  montserrat: { label: "Montserrat", stack: `var(--font-montserrat), ${SANS}`, role: "beides" },
  raleway: { label: "Raleway", stack: `var(--font-raleway), ${SANS}`, role: "beides" },
  poppins: { label: "Poppins", stack: `var(--font-poppins), ${SANS}`, role: "beides" },
  barlow: { label: "Barlow", stack: `var(--font-barlow), ${SANS}`, role: "beides" },
  geist: { label: "Geist", stack: `var(--font-geist), ${SANS}`, role: "beides" },
  inter: { label: "Inter", stack: `var(--font-inter), ${SANS}`, role: "body" },
  manrope: { label: "Manrope", stack: `var(--font-manrope), ${SANS}`, role: "beides" },
  dmSans: { label: "DM Sans", stack: `var(--font-dm-sans), ${SANS}`, role: "body" },
  openSans: { label: "Open Sans", stack: `var(--font-open-sans), ${SANS}`, role: "body" },
  sourceSans: { label: "Source Sans 3", stack: `var(--font-source-sans), ${SANS}`, role: "body" },
  workSans: { label: "Work Sans", stack: `var(--font-work-sans), ${SANS}`, role: "beides" },
  figtree: { label: "Figtree", stack: `var(--font-figtree), ${SANS}`, role: "beides" },
  rubik: { label: "Rubik", stack: `var(--font-rubik), ${SANS}`, role: "beides" },
  lato: { label: "Lato", stack: `var(--font-lato), ${SANS}`, role: "body" },
  jetbrains: { label: "JetBrains Mono", stack: `var(--font-jetbrains), ${MONO}`, role: "mono" },
  plexMono: { label: "IBM Plex Mono", stack: `var(--font-plex-mono), ${MONO}`, role: "mono" },
  geistMono: { label: "Geist Mono", stack: `var(--font-geist-mono), ${MONO}`, role: "mono" },
} as const satisfies Record<string, FontEntry>;

export type FontKey = keyof typeof FONTS;

const SCHLUESSEL = Object.keys(FONTS) as FontKey[];

export const DISPLAY_FONTS = SCHLUESSEL.filter(
  (k) => FONTS[k].role === "display" || FONTS[k].role === "beides",
);
export const BODY_FONTS = SCHLUESSEL.filter(
  (k) => FONTS[k].role === "body" || FONTS[k].role === "beides",
);
export const MONO_FONTS = SCHLUESSEL.filter((k) => FONTS[k].role === "mono");

function vereinfacht(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NAME_INDEX: Record<string, FontKey> = {};
for (const key of SCHLUESSEL) {
  NAME_INDEX[vereinfacht(FONTS[key].label)] = key;
  NAME_INDEX[vereinfacht(key)] = key;
}

/**
 * Ordnet einen Schriftnamen einem Register-Schlüssel zu - egal ob er als
 * Schlüssel ("openSans"), als Anzeigename ("Open Sans") oder so geschrieben
 * wurde, wie er auf einer fremden Website steht ("open-sans").
 * Gibt null zurück, wenn die Schrift nicht ausgeliefert werden kann.
 */
export function schriftSchluessel(name: string | undefined): FontKey | null {
  if (!name) return null;
  return NAME_INDEX[vereinfacht(name)] ?? null;
}

export function fontStack(name: string | undefined, fallback: FontKey): string {
  return FONTS[schriftSchluessel(name) ?? fallback].stack;
}

export function fontLabel(name: string | undefined, fallback: FontKey): string {
  return FONTS[schriftSchluessel(name) ?? fallback].label;
}
