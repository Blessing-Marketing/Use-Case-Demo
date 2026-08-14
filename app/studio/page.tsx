import type { Metadata } from "next";
import { Studio, type UcKurz } from "@/components/studio/Studio";
import { kundenLesen } from "@/lib/kunden";
import { datenPfadFehlt } from "@/lib/pfade";
import { schreibenErlaubt } from "@/lib/umgebung";
import { ALLE_USE_CASES } from "@/lib/usecases";

export const metadata: Metadata = {
  title: "Studio · Kundendemo einrichten",
  robots: { index: false, follow: false },
};

/** Siehe Übersicht: die Kundenliste darf nicht vom Bauzeitpunkt stammen. */
export const dynamic = "force-dynamic";

export default function StudioSeite() {
  const useCases: UcKurz[] = ALLE_USE_CASES.map((uc) => ({
    slug: uc.slug,
    name: uc.name,
    kicker: uc.kicker,
    manuellMinuten: uc.manuellMinuten,
    autoSekunden: uc.autoSekunden,
    proTag: uc.menge.proTag,
    einheit: uc.menge.einheit,
  }));

  const { kunden, fehler } = kundenLesen();

  return (
    <Studio
      useCases={useCases}
      kunden={kunden.map((k) => ({
        slug: k.slug,
        name: k.name,
        branche: k.branche ?? "",
        primaer: k.farben?.primaer ?? "#0c6b5e",
        anzahlAblaeufe: k.useCases?.length ?? 0,
      }))}
      dateifehler={fehler}
      speichernMoeglich={schreibenErlaubt()}
      speicherFluechtig={datenPfadFehlt()}
    />
  );
}
