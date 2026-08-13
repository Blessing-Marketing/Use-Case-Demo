import fs from "node:fs/promises";
import path from "node:path";
import { normalisiereUrl } from "./erfassen";
import { sichererAbruf } from "./netzschutz";

/**
 * Kundenlogos werden beim Speichern einmal heruntergeladen und danach von der
 * eigenen Domain ausgeliefert.
 *
 * Verlinkt man stattdessen auf das CDN des Kunden, hängt die Demo dauerhaft an
 * dessen Server: wird die Datei verschoben, fehlt das Logo - womöglich während
 * des Gesprächs. Nebenbei sieht der Kunde sonst in seinen Server-Logs jeden
 * einzelnen Aufruf der Demo.
 */

const ORDNER = path.join(process.cwd(), "public", "logos");

const ENDUNGEN: Record<string, string> = {
  "image/svg+xml": ".svg",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/x-icon": ".ico",
  "image/vnd.microsoft.icon": ".ico",
};

const MAX_BYTES = 2_000_000;

/**
 * Entfernt aus einer SVG-Datei, was im Browser ausgeführt werden könnte.
 *
 * Das ist eine Verkleinerung der Angriffsfläche, keine Garantie: eine
 * vollständige Bereinigung bräuchte einen echten Parser. Da die Dateien unter
 * der eigenen Domain liegen, ist das der Unterschied zwischen "wird nie
 * ausgeführt" und "wird ausgeführt, wenn jemand die Datei direkt aufruft".
 */
function svgEntschaerfen(inhalt: string): string {
  return inhalt
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|xlink:href)\s*=\s*("|')\s*javascript:[^"']*\2/gi, "")
    .replace(/<!ENTITY[\s\S]*?>/gi, "");
}

/** Holt die echte Bildadresse heraus, auch wenn sie durch den Proxy zeigt. */
export function bildQuelle(bild: string | undefined): string | null {
  if (!bild) return null;
  const proxy = bild.match(/^\/api\/bild\?u=(.+)$/);
  if (proxy) return decodeURIComponent(proxy[1]);
  if (/^https?:\/\//i.test(bild)) return bild;
  return null;
}

export async function logoEntfernen(slug: string): Promise<void> {
  try {
    const dateien = await fs.readdir(ORDNER);
    await Promise.all(
      dateien
        .filter((d) => d.startsWith(`${slug}.`))
        .map((d) => fs.unlink(path.join(ORDNER, d)).catch(() => {})),
    );
  } catch {
    /* Ordner gibt es noch nicht */
  }
}

/**
 * Lädt das Logo herunter und legt es unter public/logos/<slug>.<endung> ab.
 * Gibt den lokalen Pfad zurück, oder null wenn es nicht geklappt hat - dann
 * bleibt die bisherige Angabe stehen.
 */
export async function logoUebernehmen(slug: string, bild: string | undefined): Promise<string | null> {
  const quelle = bildQuelle(bild);
  if (!quelle) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const antwort = await sichererAbruf(normalisiereUrl(quelle), {
      headers: { "user-agent": "Mozilla/5.0", accept: "image/*,*/*" },
      signal: controller.signal,
    });
    if (!antwort.ok) return null;

    const typ = antwort.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
    const endung = ENDUNGEN[typ];
    if (!endung) return null;

    const puffer = await antwort.arrayBuffer();
    if (puffer.byteLength > MAX_BYTES) return null;

    await fs.mkdir(ORDNER, { recursive: true });
    await logoEntfernen(slug);

    const datei = path.join(ORDNER, `${slug}${endung}`);
    if (path.dirname(path.resolve(datei)) !== path.resolve(ORDNER)) return null;

    if (endung === ".svg") {
      const sauber = svgEntschaerfen(new TextDecoder().decode(puffer));
      await fs.writeFile(datei, sauber, "utf8");
    } else {
      await fs.writeFile(datei, Buffer.from(puffer));
    }

    return `/logos/${slug}${endung}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
