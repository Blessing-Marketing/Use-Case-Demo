import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseSeite } from "@/components/UseCaseSeite";
import { alleKundenEingaben, kunde } from "@/lib/kunden";
import { aufloesen } from "@/lib/marke";
import { useCase, useCasesFuer } from "@/lib/usecases";

type Props = { params: Promise<{ slug: string; usecase: string }> };

export function generateStaticParams() {
  return alleKundenEingaben().flatMap((k) =>
    useCasesFuer(aufloesen(k).useCases).map((uc) => ({ slug: k.slug, usecase: uc.slug })),
  );
}

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
