import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KundenSeite } from "@/components/KundenSeite";
import { alleKundenEingaben, kunde } from "@/lib/kunden";
import { useCasesFuer } from "@/lib/usecases";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return alleKundenEingaben().map((k) => ({ slug: k.slug }));
}

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
