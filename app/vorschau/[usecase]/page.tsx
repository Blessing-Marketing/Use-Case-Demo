import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UseCaseSeite } from "@/components/UseCaseSeite";
import { aufloesen, markeDekodieren } from "@/lib/marke";
import { useCase, useCasesFuer } from "@/lib/usecases";
import { Hinweis } from "../Hinweis";

export const metadata: Metadata = { title: "Vorschau", robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ usecase: string }>;
  searchParams: Promise<{ b?: string }>;
};

export default async function VorschauUseCase({ params, searchParams }: Props) {
  const [{ usecase }, { b }] = await Promise.all([params, searchParams]);
  const eingabe = b ? markeDekodieren(b) : null;
  if (!eingabe) return <Hinweis />;

  const uc = useCase(usecase);
  if (!uc) notFound();

  const marke = aufloesen({ ...eingabe, slug: eingabe.slug || "vorschau" });
  const weitere = useCasesFuer(marke.useCases)
    .filter((w) => w.slug !== uc.slug)
    .slice(0, 3);

  return (
    <UseCaseSeite
      marke={marke}
      uc={uc}
      weitere={weitere}
      hrefBasis="/vorschau"
      hrefSuffix={`?b=${b}`}
    />
  );
}
