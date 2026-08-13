import { NextResponse } from "next/server";
import { befundAlsMarke, ErfassungsFehler, markeErfassen } from "@/lib/erfassen";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST { url: "kunde.de" }
 * Liefert Befund (alle Kandidaten) und einen fertigen Markenvorschlag.
 */
export async function POST(request: Request) {
  let url: unknown;
  try {
    ({ url } = await request.json());
  } catch {
    return NextResponse.json({ fehler: "Keine gültige Anfrage." }, { status: 400 });
  }

  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ fehler: "Bitte eine Webadresse angeben." }, { status: 400 });
  }

  try {
    const befund = await markeErfassen(url);
    const vorschlag = befundAlsMarke(befund, befund.kuerzel);
    return NextResponse.json({ befund, vorschlag });
  } catch (fehler) {
    const nachricht =
      fehler instanceof ErfassungsFehler
        ? fehler.message
        : "Die Seite konnte nicht ausgewertet werden.";
    return NextResponse.json({ fehler: nachricht }, { status: 422 });
  }
}
