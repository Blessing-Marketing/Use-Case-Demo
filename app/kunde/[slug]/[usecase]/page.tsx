import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseSeite } from "@/components/UseCaseSeite";
import { kunde } from "@/lib/kunden";
import { useCase, useCasesFuer } from "@/lib/usecases";

type Props = { params: Promise<{ slug: string; usecase: string }> };

/** Siehe ../page.tsx: Kundendaten ändern sich im laufenden Betrieb. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, usecase } = await params;
  const marke = kunde(slug);
  const uc = useCase(usecase);
  if (!marke || !uc) return {};
  return { title: `${uc.name} · ${marke.name}`, description: uc.versprechen };
}

export default async function Seite({ params }: Props) {
  const { slug, usecase } = await params;
  const marke = kunde(slug);
  const uc = useCase(usecase);
  if (!marke || !uc) notFound();

  const alle = useCasesFuer(marke.useCases);
  const weitere = alle.filter((w) => w.slug !== uc.slug).slice(0, 3);

  return (
    <UseCaseSeite
      marke={marke}
      uc={uc}
      weitere={weitere}
      hrefBasis={`/kunde/${marke.slug}`}
    />
  );
}
