import {
  Archivo,
  Barlow,
  Bricolage_Grotesque,
  DM_Sans,
  Figtree,
  Fraunces,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
  Lato,
  Manrope,
  Montserrat,
  Open_Sans,
  Poppins,
  Raleway,
  Rubik,
  Sora,
  Source_Sans_3,
  Space_Grotesk,
  Work_Sans,
} from "next/font/google";

/**
 * Lädt die Schriften aus dem Register (lib/schriften.ts).
 *
 * Alle Schriften werden beim Bauen heruntergeladen und von der eigenen Domain
 * ausgeliefert. Kundenseiten stellen deshalb keine Anfrage an Google – das ist
 * kein Detail, sondern Voraussetzung dafür, dass man die Seite einem deutschen
 * Interessenten schicken kann, ohne dessen IP-Adresse an Google zu geben.
 *
 * next/font verlangt, dass jeder Aufruf einer eigenen Konstante im Modulkopf
 * zugewiesen wird – daher die Wiederholung. Nur die drei Hausschriften werden
 * vorgeladen, der Rest liegt bereit und wird bei Bedarf geholt.
 *
 * Diese Datei gehört allein in app/layout.tsx. Alles andere arbeitet mit
 * lib/schriften.ts.
 */

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: false,
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  preload: false,
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  preload: false,
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
  preload: false,
});
const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  preload: false,
});
const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
  preload: false,
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
  preload: false,
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
  preload: false,
});
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
  preload: false,
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
  preload: false,
});
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
  preload: false,
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

/** Alle Font-Variablen zusammen – kommt einmal auf <html>. */
export const fontVariables = [
  bricolage,
  inter,
  jetbrains,
  archivo,
  manrope,
  sora,
  dmSans,
  fraunces,
  spaceGrotesk,
  geist,
  montserrat,
  openSans,
  raleway,
  rubik,
  sourceSans,
  workSans,
  figtree,
  poppins,
  lato,
  barlow,
  plexMono,
  geistMono,
]
  .map((f) => f.variable)
  .join(" ");
