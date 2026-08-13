import type { Metadata } from "next";
import { KundenSeite } from "@/components/KundenSeite";
import { aufloesen, markeDekodieren } from "@/lib/marke";
import { useCasesFuer } from "@/lib/usecases";
import { Hinweis } from "./Hinweis";

export const metadata: Metadata = { title: "Vorschau", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ b?: string }> };

/**
 * Teilbare Vorschau: die komplette Marke steckt kodiert in der Adresse.
 * Dadurch kann der Vertrieb einen Entwurf verschicken, bevor irgendetwas
 * dauerhaft angelegt ist.
 */
export default async function Vorschau({ searchParams }: Props) {
  const { b } = await searchParams;
  const eingabe = b ? markeDekodieren(b) : null;
  if (!eingabe) return <Hinweis />;

  const marke = aufloesen({ ...eingabe, slug: eingabe.slug || "vorschau" });
  return (
    <KundenSeite
      marke={marke}
      useCases={useCasesFuer(marke.useCases)}
      hrefBasis="/vorschau"
      hrefSuffix={`?b=${b}`}
    />
  );
}
