import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KundenSeite } from "@/components/KundenSeite";
import { kunde } from "@/lib/kunden";
import { useCasesFuer } from "@/lib/usecases";

type Props = { params: Promise<{ slug: string }> };

/**
 * Nicht vorrendern: Kunden werden im laufenden Betrieb angelegt und geändert.
 * Eine beim Bauen erzeugte Seite würde nach dem Bearbeiten weiter die alte
 * Fassung zeigen - nachgemessen im Produktionsbetrieb.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const marke = kunde(slug);
  if (!marke) return {};
  return {
    title: `${marke.name} · Abläufe zum Zuschauen`,
    description: marke.texte.intro,
  };
}

export default async function Seite({ params }: Props) {
  const { slug } = await params;
  const marke = kunde(slug);
  if (!marke) notFound();

  return (
    <KundenSeite
      marke={marke}
      useCases={useCasesFuer(marke.useCases)}
      hrefBasis={`/kunde/${marke.slug}`}
    />
  );
}
