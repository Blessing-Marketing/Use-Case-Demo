import fs from "node:fs/promises";
import path from "node:path";
import { LOGO_ORDNER } from "@/lib/pfade";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Liefert die kopierten Kundenlogos aus.
 *
 * Nötig, weil Next im Produktionsbetrieb nur ausliefert, was beim Bauen unter
 * public/ lag. Ein Logo, das der Vertrieb später im Studio anlegt, käme dort
 * nie an - nachgemessen: 404.
 */

const TYPEN: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
};

export async function GET(_request: Request, { params }: { params: Promise<{ datei: string }> }) {
  const { datei } = await params;

  // Nur einfache Dateinamen, kein Ausbruch aus dem Ordner.
  if (!/^[a-z0-9][a-z0-9-]{0,60}\.[a-z0-9]{2,4}$/i.test(datei)) {
    return new Response("Ungültiger Dateiname", { status: 400 });
  }

  const endung = path.extname(datei).toLowerCase();
  const typ = TYPEN[endung];
  if (!typ) return new Response("Kein unterstütztes Bildformat", { status: 415 });

  const pfad = path.join(LOGO_ORDNER, datei);
  if (path.dirname(path.resolve(pfad)) !== path.resolve(LOGO_ORDNER)) {
    return new Response("Ungültiger Dateiname", { status: 400 });
  }

  try {
    const inhalt = await fs.readFile(pfad);
    return new Response(new Uint8Array(inhalt), {
      headers: {
        "content-type": typ,
        "cache-control": "public, max-age=300, s-maxage=86400",
        // Falls jemand die Datei direkt aufruft: nichts ausführen lassen.
        "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Logo nicht gefunden", { status: 404 });
  }
}
