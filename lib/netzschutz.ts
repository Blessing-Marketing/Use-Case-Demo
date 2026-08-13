import { lookup } from "node:dns/promises";

/**
 * Schutz gegen Server-Side Request Forgery.
 *
 * Beide API-Routen holen Adressen, die von außen kommen: die Kundenwebsite,
 * deren Stylesheets und die Logo-Adresse. Eine Prüfung des Hostnamens allein
 * reicht dafür nicht - ein Name kann auf 127.0.0.1 oder auf den
 * Metadaten-Dienst der Cloud (169.254.169.254) zeigen, und eine Weiterleitung
 * kann jederzeit dorthin führen. Deshalb wird jeder Sprung einzeln aufgelöst
 * und gegen die IP-Adresse geprüft.
 */

export class NetzFehler extends Error {}

/**
 * Großzügig gewählt: Firmenseiten leiten oft mehrfach um (Domain -> www ->
 * Sprachraum -> Land). Da jeder einzelne Sprung geprüft wird, kostet ein
 * höheres Limit keine Sicherheit.
 */
const MAX_WEITERLEITUNGEN = 10;

/** Adressbereiche, die nie von außen erreichbar sein sollen. */
function istGesperrtIPv4(adresse: string): boolean {
  const teile = adresse.split(".").map(Number);
  if (teile.length !== 4 || teile.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = teile;
  return (
    a === 0 || // "dieses Netz"
    a === 10 || // privat
    a === 127 || // localhost
    (a === 100 && b >= 64 && b <= 127) || // Provider-NAT
    (a === 169 && b === 254) || // link-local, u.a. Cloud-Metadaten
    (a === 172 && b >= 16 && b <= 31) || // privat
    (a === 192 && b === 0) || // IANA-Sonderbereiche
    (a === 192 && b === 168) || // privat
    (a === 198 && (b === 18 || b === 19)) || // Messnetz
    a >= 224 // Multicast und reserviert
  );
}

function istGesperrtIPv6(adresse: string): boolean {
  const a = adresse.toLowerCase().split("%")[0];
  if (a === "::" || a === "::1") return true;
  if (/^f[cd]/.test(a)) return true; // fc00::/7, eindeutig lokal
  if (/^fe[89ab]/.test(a)) return true; // fe80::/10, link-local
  if (a.startsWith("64:ff9b:")) return true; // NAT64
  if (a.startsWith("::ffff:")) {
    const v4 = a.slice(7);
    return /^\d+\.\d+\.\d+\.\d+$/.test(v4) ? istGesperrtIPv4(v4) : true;
  }
  return false;
}

export function istGesperrteAdresse(adresse: string, familie: number): boolean {
  return familie === 4 ? istGesperrtIPv4(adresse) : istGesperrtIPv6(adresse);
}

/** Löst den Hostnamen auf und lässt nur öffentlich erreichbare Ziele durch. */
export async function pruefeZiel(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new NetzFehler("Nur http- und https-Adressen sind möglich.");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host) throw new NetzFehler("Die Adresse hat keinen Rechnernamen.");

  let adressen: { address: string; family: number }[];
  try {
    adressen = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new NetzFehler("Der Rechnername ist nicht auflösbar.");
  }

  if (!adressen.length) throw new NetzFehler("Der Rechnername ist nicht auflösbar.");
  if (adressen.some((a) => istGesperrteAdresse(a.address, a.family))) {
    throw new NetzFehler("Diese Adresse zeigt auf ein internes Netz und wird nicht abgerufen.");
  }
}

/**
 * Abruf mit selbst gesteuerten Weiterleitungen: jedes Ziel wird vor dem
 * Verbindungsaufbau geprüft, auch das dritte in einer Kette.
 */
export async function sichererAbruf(
  start: URL,
  init: { headers: Record<string, string>; signal?: AbortSignal },
): Promise<Response> {
  let ziel = start;

  for (let sprung = 0; sprung <= MAX_WEITERLEITUNGEN; sprung++) {
    await pruefeZiel(ziel);

    const antwort = await fetch(ziel, { ...init, redirect: "manual" });
    if (antwort.status < 300 || antwort.status > 399) return antwort;

    const ort = antwort.headers.get("location");
    if (!ort) return antwort;

    try {
      ziel = new URL(ort, ziel);
    } catch {
      throw new NetzFehler("Die Weiterleitung führt auf eine ungültige Adresse.");
    }
  }

  throw new NetzFehler("Zu viele Weiterleitungen.");
}
