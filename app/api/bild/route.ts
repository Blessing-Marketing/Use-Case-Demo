import { unterschriftGueltig } from "@/lib/bildsignatur";
import { ErfassungsFehler, normalisiereUrl } from "@/lib/erfassen";
import { NetzFehler, sichererAbruf } from "@/lib/netzschutz";

export const runtime = "nodejs";

const ERLAUBT = /^image\/(png|jpeg|jpg|gif|webp|avif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/i;

/**
 * Reicht Kundenlogos durch. Ohne diesen Umweg scheitern Logos an
 * Hotlink-Sperren oder gemischten Inhalten, und die Demo sieht kaputt aus.
 */
export async function GET(request: Request) {
  const anfrage = new URL(request.url).searchParams;
  const ziel = anfrage.get("u");
  if (!ziel) return new Response("Fehlender Parameter u", { status: 400 });

  // Nur selbst unterschriebene Adressen: sonst wäre das ein offener Proxy,
  // über den jeder beliebige Bilder auf unsere Kosten ausliefern kann.
  if (!unterschriftGueltig(ziel, anfrage.get("s"))) {
    return new Response("Adresse ohne gültige Unterschrift", { status: 403 });
  }

  let url: URL;
  try {
    url = normalisiereUrl(ziel);
  } catch (fehler) {
    const nachricht = fehler instanceof ErfassungsFehler ? fehler.message : "Ungültige Adresse.";
    return new Response(nachricht, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const antwort = await sichererAbruf(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "image/*,*/*",
      },
      signal: controller.signal,
    });
    if (!antwort.ok) return new Response("Bild nicht erreichbar", { status: 502 });

    const typ = antwort.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    if (!ERLAUBT.test(typ)) return new Response("Kein unterstütztes Bildformat", { status: 415 });

    const daten = await antwort.arrayBuffer();
    if (daten.byteLength > 3_000_000) return new Response("Bild zu groß", { status: 413 });

    return new Response(daten, {
      headers: {
        "content-type": typ,
        "cache-control": "public, max-age=86400, s-maxage=604800, immutable",
        "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch (fehler) {
    if (fehler instanceof NetzFehler) return new Response(fehler.message, { status: 400 });
    return new Response("Bild konnte nicht geladen werden", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
