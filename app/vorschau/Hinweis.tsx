import Link from "next/link";

export function Hinweis() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <p className="t-eyebrow text-accent">Vorschau</p>
      <h1 className="t-display mt-4 text-[2.4rem]">Dieser Link enthält keine Marke.</h1>
      <p className="t-lead mt-4 text-muted">
        Vorschau-Links werden im Studio erzeugt. Öffnen Sie das Studio, stellen Sie den Kunden ein
        und kopieren Sie den Link von dort.
      </p>
      <Link
        href="/studio"
        className="t-mono mt-8 inline-flex w-fit rounded-brand-sm bg-primary px-5 py-3 text-[0.75rem] text-on-primary"
      >
        Zum Studio
      </Link>
    </div>
  );
}
