import { NextResponse } from "next/server";
import { kundenLesen, kundeSchreiben } from "@/lib/kunden";
import { logoUebernehmen } from "@/lib/logos";
import type { MarkeEingabe } from "@/lib/marke";
import { schreibenErlaubt } from "@/lib/umgebung";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET: alle Kunden auflisten. */
export function GET() {
  const { kunden, fehler } = kundenLesen();
  return NextResponse.json({
    kunden: kunden.map((k) => ({
      slug: k.slug,
      name: k.name,
      branche: k.branche ?? "",
      primaer: k.farben?.primaer ?? "#0c6b5e",
      anzahlAblaeufe: k.useCases?.length ?? 0,
    })),
    fehler,
    schreibbar: schreibenErlaubt(),
  });
}

/** POST: Kunde anlegen oder überschreiben. */
export async function POST(request: Request) {
  if (!schreibenErlaubt()) {
    return NextResponse.json(
      {
        fehler:
          "Auf dieser Umgebung kann nicht gespeichert werden. Datei herunterladen und nach content/kunden/ einchecken.",
      },
      { status: 403 },
    );
  }

  let eingabe: MarkeEingabe;
  try {
    eingabe = (await request.json()) as MarkeEingabe;
  } catch {
    return NextResponse.json({ fehler: "Keine gültige Anfrage." }, { status: 400 });
  }

  if (!eingabe?.name?.trim()) {
    return NextResponse.json({ fehler: "Der Kunde braucht einen Namen." }, { status: 400 });
  }

  try {
    // Das Logo wird einmal kopiert, damit die Demo nicht am Server des Kunden hängt.
    const lokal = await logoUebernehmen(eingabe.slug, eingabe.logo?.bild);
    const zuSpeichern: MarkeEingabe = lokal
      ? { ...eingabe, logo: { ...eingabe.logo, bild: lokal } }
      : eingabe;

    const { ueberschrieben } = kundeSchreiben(zuSpeichern);
    return NextResponse.json({
      gespeichert: true,
      ueberschrieben,
      logo: lokal,
      pfad: `content/kunden/${eingabe.slug}.json`,
      adresse: `/kunde/${eingabe.slug}`,
    });
  } catch (fehler) {
    const nachricht =
      fehler instanceof Error ? fehler.message : "Die Datei konnte nicht geschrieben werden.";
    return NextResponse.json({ fehler: nachricht }, { status: 400 });
  }
}
