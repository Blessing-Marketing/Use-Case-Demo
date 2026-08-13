import { angebot } from "./angebot";
import { lead } from "./lead";
import { onboarding } from "./onboarding";
import { posteingang } from "./posteingang";
import { rechnung } from "./rechnung";
import type { UseCase } from "./typen";
import { wissen } from "./wissen";

/**
 * Neuen Use Case anlegen:
 * 1. Datei in diesem Ordner nach dem Vorbild von posteingang.ts erstellen
 * 2. Hier importieren und in ALLE_USE_CASES eintragen
 * Ab dann steht er für jeden Kunden zur Auswahl.
 */
export const ALLE_USE_CASES: UseCase[] = [
  posteingang,
  angebot,
  rechnung,
  lead,
  onboarding,
  wissen,
];

export const USE_CASE_MAP: Record<string, UseCase> = Object.fromEntries(
  ALLE_USE_CASES.map((uc) => [uc.slug, uc]),
);

export function useCase(slug: string): UseCase | undefined {
  return USE_CASE_MAP[slug];
}

/** Use Cases einer Marke in der hinterlegten Reihenfolge; leer bedeutet "alle". */
export function useCasesFuer(slugs: string[] | undefined): UseCase[] {
  if (!slugs || slugs.length === 0) return ALLE_USE_CASES;
  return slugs.map((s) => USE_CASE_MAP[s]).filter(Boolean);
}

export * from "./typen";
