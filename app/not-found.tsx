import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diese Adresse gibt es nicht",
  robots: { index: false, follow: false },
};

/**
 * Eigene Fehlerseite statt der englischen Vorgabe von Next.
 *
 * Diese Seite bekommt im Zweifel ein Kunde zu sehen, dessen Link unvollständig
 * kopiert wurde. Deshalb deutsch, ruhig formuliert und ohne Verweis auf die
 * interne Übersicht.
 */
export default function NichtGefunden() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="t-eyebrow text-accent-text">Nicht gefunden</p>
      <h1 className="t-display mt-4 text-[clamp(2rem,6vw,3rem)]">Diese Adresse gibt es nicht.</h1>
      <p className="t-lead mt-5 text-muted">
        Der Link ist womöglich unvollständig kopiert worden – bei Adressen aus einer E-Mail bricht
        gern die letzte Zeile ab. Prüfen Sie, ob er vollständig ist, oder fragen Sie kurz bei Ihrem
        Ansprechpartner nach.
      </p>
    </main>
  );
}
