import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Unterschrift für die Bildadressen des Proxys.
 *
 * `/api/bild` muss ohne Anmeldung erreichbar sein, weil die Logos in
 * verschickten Vorschau-Links darüber laufen. Ohne Unterschrift nimmt er
 * jede beliebige Bildadresse an - dann kann jeder fremde Bilder über unsere
 * Domain und auf unsere Bandbreite ausliefern.
 *
 * Der Server unterschreibt die Adresse dort, wo sie ohnehin entsteht; der
 * Proxy nimmt nur Unterschriebenes an. Für den Ablauf ändert sich nichts.
 */

/**
 * Eigener Schlüssel, sonst das Zugangspasswort. In der Produktion ist
 * DEMO_PASSWORT ohnehin Pflicht - es gibt dort also immer einen Schlüssel.
 *
 * Wer das Passwort ändert, macht damit die Logos in bereits verschickten
 * Vorschau-Links ungültig. Wer das vermeiden will, setzt
 * DEMO_BILD_SCHLUESSEL einmalig auf einen eigenen Wert.
 */
function schluessel(): string | null {
  return process.env.DEMO_BILD_SCHLUESSEL?.trim() || process.env.DEMO_PASSWORT?.trim() || null;
}

/**
 * Wird eine Unterschrift verlangt? In der Entwicklung ohne eingerichteten
 * Schlüssel nicht - sonst müsste man erst etwas konfigurieren, bevor
 * überhaupt ein Logo erscheint.
 */
export function unterschriftNoetig(): boolean {
  return process.env.NODE_ENV === "production" || Boolean(schluessel());
}

export function unterschreibe(quelle: string): string | null {
  const k = schluessel();
  if (!k) return null;
  return createHmac("sha256", k).update(quelle).digest("base64url").slice(0, 32);
}

/** Fertige Proxy-Adresse für eine Bildquelle. */
export function bildAdresse(quelle: string): string {
  const basis = `/api/bild?u=${encodeURIComponent(quelle)}`;
  const unterschrift = unterschreibe(quelle);
  return unterschrift ? `${basis}&s=${unterschrift}` : basis;
}

export function unterschriftGueltig(quelle: string, uebergeben: string | null): boolean {
  if (!unterschriftNoetig()) return true;

  const erwartet = unterschreibe(quelle);
  // Kein Schlüssel in der Produktion: dann kommt niemand durch, statt dass
  // der Proxy offen steht.
  if (!erwartet || !uebergeben) return false;

  const a = Buffer.from(erwartet);
  const b = Buffer.from(uebergeben);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
