import fs from "node:fs";
import path from "node:path";
import { aufloesen, type Marke, type MarkeEingabe } from "./marke";
import { KUNDEN_ORDNER as ORDNER } from "./pfade";

export type Kundenfehler = { datei: string; grund: string };

/**
 * Kunden liegen als JSON im Repo. Kein Login, keine Datenbank - eine Demo
 * anzulegen heisst, eine Datei abzulegen (oder sie im Studio zu erzeugen).
 *
 * Eine unbrauchbare Datei darf dabei nie die anderen mitreissen: die Dateien
 * werden von Hand bearbeitet, und ein fehlendes Komma würde sonst jede
 * Kundenseite auf einmal lahmlegen.
 */
export function kundenLesen(): { kunden: MarkeEingabe[]; fehler: Kundenfehler[] } {
  if (!fs.existsSync(ORDNER)) return { kunden: [], fehler: [] };

  const kunden: MarkeEingabe[] = [];
  const fehler: Kundenfehler[] = [];

  for (const datei of fs.readdirSync(ORDNER).filter((f) => f.endsWith(".json"))) {
    try {
      const roh = fs.readFileSync(path.join(ORDNER, datei), "utf8");
      const daten = JSON.parse(roh) as MarkeEingabe;
      if (!daten || typeof daten !== "object") {
        fehler.push({ datei, grund: "Die Datei enthält kein Objekt." });
        continue;
      }
      if (typeof daten.name !== "string" || !daten.name.trim()) {
        fehler.push({ datei, grund: 'Das Feld "name" fehlt oder ist leer.' });
        continue;
      }
      const slug = daten.slug || datei.replace(/\.json$/, "");
      if (!SLUG_MUSTER.test(slug)) {
        fehler.push({ datei, grund: `Unbrauchbares Kürzel „${slug}“.` });
        continue;
      }
      kunden.push({ ...daten, slug });
    } catch (ausnahme) {
      const grund = ausnahme instanceof Error ? ausnahme.message : "Datei nicht lesbar.";
      fehler.push({ datei, grund });
    }
  }

  kunden.sort((a, b) => a.name.localeCompare(b.name, "de"));
  return { kunden, fehler };
}

export function alleKundenEingaben(): MarkeEingabe[] {
  return kundenLesen().kunden;
}

export function kundenFehler(): Kundenfehler[] {
  return kundenLesen().fehler;
}

export function alleKunden(): Marke[] {
  return alleKundenEingaben().map(aufloesen);
}

export function kunde(slug: string): Marke | null {
  const treffer = alleKundenEingaben().find((k) => k.slug === slug);
  return treffer ? aufloesen(treffer) : null;
}

export function kundenEingabe(slug: string): MarkeEingabe | null {
  return alleKundenEingaben().find((k) => k.slug === slug) ?? null;
}

/* -------------------------------------------------------------------------- */

export const SLUG_MUSTER = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** Wirft, wenn das Kürzel unbrauchbar ist oder aus dem Ordner ausbrechen würde. */
function pfadFuer(slug: string): string {
  if (!SLUG_MUSTER.test(slug)) {
    throw new Error("Das Kürzel darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.");
  }
  const datei = path.join(ORDNER, `${slug}.json`);
  if (path.dirname(path.resolve(datei)) !== path.resolve(ORDNER)) {
    throw new Error("Ungültiges Kürzel.");
  }
  return datei;
}

export function kundeSchreiben(eingabe: MarkeEingabe): { ueberschrieben: boolean } {
  const datei = pfadFuer(eingabe.slug);
  const ueberschrieben = fs.existsSync(datei);
  fs.mkdirSync(ORDNER, { recursive: true });
  fs.writeFileSync(datei, `${JSON.stringify(eingabe, null, 2)}\n`, "utf8");
  return { ueberschrieben };
}

export function kundeLoeschen(slug: string): boolean {
  const datei = pfadFuer(slug);
  if (!fs.existsSync(datei)) return false;
  fs.unlinkSync(datei);
  return true;
}
