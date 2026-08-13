import { NextResponse } from "next/server";
import { kundeLoeschen, kundenEingabe } from "@/lib/kunden";
import { logoEntfernen } from "@/lib/logos";
import { schreibenErlaubt } from "@/lib/umgebung";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Kontext = { params: Promise<{ slug: string }> };

/** GET: einen Kunden zum Bearbeiten laden. */
export async function GET(_request: Request, { params }: Kontext) {
  const { slug } = await params;
  const eingabe = kundenEingabe(slug);
  if (!eingabe) return NextResponse.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });
  return NextResponse.json({ kunde: eingabe });
}

/** DELETE: Kunden entfernen. */
export async function DELETE(_request: Request, { params }: Kontext) {
  const { slug } = await params;

  if (!schreibenErlaubt()) {
    return NextResponse.json(
      { fehler: "Auf dieser Umgebung kann nicht gelöscht werden." },
      { status: 403 },
    );
  }

  try {
    const geloescht = kundeLoeschen(slug);
    if (!geloescht) {
      return NextResponse.json({ fehler: "Kunde nicht gefunden." }, { status: 404 });
    }
    await logoEntfernen(slug);
    return NextResponse.json({ geloescht: true, slug });
  } catch (fehler) {
    const nachricht = fehler instanceof Error ? fehler.message : "Löschen fehlgeschlagen.";
    return NextResponse.json({ fehler: nachricht }, { status: 400 });
  }
}
