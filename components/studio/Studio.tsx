"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Befund } from "@/lib/erfassen";
import { hatZusatz, mitZusatz, ohneZusatz } from "@/lib/kuerzel";
import {
  BODY_FONTS,
  DISPLAY_FONTS,
  FONTS,
  MONO_FONTS,
  schriftSchluessel,
  type FontKey,
} from "@/lib/schriften";
import { markeKodieren, type MarkeEingabe } from "@/lib/marke";

export type UcKurz = {
  slug: string;
  name: string;
  kicker: string;
  manuellMinuten: number;
  autoSekunden: number;
  proTag: number;
  einheit: string;
};

const START: MarkeEingabe = {
  slug: "neuer-kunde",
  name: "Neuer Kunde",
  branche: "",
  logo: { text: "Neuer Kunde" },
  farben: { primaer: "#0c6b5e", akzent: "#ff5c16", ink: "#101418", flaeche: "#e9ecea" },
  schriften: { display: "bricolage", text: "inter", mono: "jetbrains" },
  radius: 4,
  texte: {},
  kontakt: { name: "", rolle: "", mail: "" },
  useCases: [],
};

/* ------------------------------ Bausteine -------------------------------- */

function Abschnitt({
  nummer,
  titel,
  hinweis,
  children,
}: {
  nummer: string;
  titel: string;
  hinweis?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line px-6 py-7">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="t-mono text-[0.68rem] text-accent-text">{nummer}</span>
        <div>
          <h2 className="text-[0.98rem] font-semibold leading-none">{titel}</h2>
          {hinweis ? <p className="mt-1.5 text-[0.78rem] text-muted">{hinweis}</p> : null}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Feld({
  label,
  children,
  breit = false,
}: {
  label: string;
  children: React.ReactNode;
  breit?: boolean;
}) {
  return (
    <label className={`block ${breit ? "" : "flex-1"}`}>
      <span className="t-eyebrow mb-1.5 block text-faint">{label}</span>
      {children}
    </label>
  );
}

const eingabeKlasse =
  "w-full rounded-brand-sm border border-line bg-paper px-3 py-2 text-[0.86rem] outline-none transition-colors focus:border-primary";

/* -------------------------------- Studio --------------------------------- */

type SpeicherStand =
  | { art: "leer" }
  | { art: "laeuft" }
  | { art: "ok"; pfad: string; adresse: string; ueberschrieben: boolean }
  | { art: "fehler"; text: string };

export type KundeKurz = {
  slug: string;
  name: string;
  branche: string;
  primaer: string;
  anzahlAblaeufe: number;
};

export function Studio({
  useCases,
  kunden: kundenAnfang,
  dateifehler: dateifehlerAnfang,
  speichernMoeglich,
  speicherFluechtig = false,
}: {
  useCases: UcKurz[];
  kunden: KundeKurz[];
  dateifehler: { datei: string; grund: string }[];
  speichernMoeglich: boolean;
  /** Server ohne dauerhaftes Verzeichnis: Angelegtes überlebt kein Deploy. */
  speicherFluechtig?: boolean;
}) {
  const [kunden, setKunden] = useState<KundeKurz[]>(kundenAnfang);
  const [dateifehler, setDateifehler] = useState(dateifehlerAnfang);
  const [loeschKandidat, setLoeschKandidat] = useState<string | null>(null);
  const [geladen, setGeladen] = useState<string | null>(null);
  const [marke, setMarke] = useState<MarkeEingabe>(START);
  const [adresse, setAdresse] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [befund, setBefund] = useState<Befund | null>(null);
  const [farbZiel, setFarbZiel] = useState<"primaer" | "akzent" | "ink" | "flaeche">("primaer");
  const [breite, setBreite] = useState<"gross" | "klein">("gross");
  const [kopiert, setKopiert] = useState<string | null>(null);
  const [speicherStand, setSpeicherStand] = useState<SpeicherStand>({ art: "leer" });
  const [angelegt, setAngelegt] = useState<string[]>([]);

  const code = useMemo(() => markeKodieren(marke), [marke]);
  const [vorschauCode, setVorschauCode] = useState(code);
  const ersterRender = useRef(true);

  useEffect(() => {
    if (ersterRender.current) {
      ersterRender.current = false;
      return;
    }
    const t = setTimeout(() => setVorschauCode(code), 450);
    return () => clearTimeout(t);
  }, [code]);

  // Nach einer Änderung stimmt die Erfolgsmeldung nicht mehr.
  useEffect(() => {
    setSpeicherStand((s) => (s.art === "leer" ? s : { art: "leer" }));
  }, [code]);

  const aendern = useCallback((teil: Partial<MarkeEingabe>) => {
    setMarke((m) => ({ ...m, ...teil }));
  }, []);

  const farbe = useCallback((feld: keyof MarkeEingabe["farben"], wert: string) => {
    setMarke((m) => ({ ...m, farben: { ...m.farben, [feld]: wert } }));
  }, []);

  const text = useCallback((feld: string, wert: string) => {
    setMarke((m) => ({ ...m, texte: { ...m.texte, [feld]: wert } }));
  }, []);

  /** Leeres Feld heißt: Schätzwert der Vorlage gilt weiter. */
  const menge = useCallback(
    (slug: string, feld: "proTag" | "manuellMinuten", eingabe: string) => {
      setMarke((m) => {
        const zahl = Number(eingabe);
        const wert = eingabe.trim() !== "" && Number.isFinite(zahl) && zahl > 0 ? zahl : undefined;
        const eintrag = { ...(m.mengen?.[slug] ?? {}), [feld]: wert };
        const mengen = { ...m.mengen, [slug]: eintrag };
        if (eintrag.proTag === undefined && eintrag.manuellMinuten === undefined) {
          delete mengen[slug];
        }
        return { ...m, mengen };
      });
    },
    [],
  );

  /* ------------------------- Website übernehmen ------------------------- */

  async function erfassen() {
    if (!adresse.trim()) return;
    setLaeuft(true);
    setFehler(null);
    try {
      const antwort = await fetch("/api/marke-erfassen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: adresse }),
      });
      const daten = await antwort.json();
      if (!antwort.ok) {
        setFehler(daten.fehler ?? "Die Seite konnte nicht ausgewertet werden.");
        return;
      }
      setBefund(daten.befund as Befund);
      const vorschlag = daten.vorschlag as MarkeEingabe;
      // Beim Bearbeiten bleibt die Identität des Kunden unangetastet: ein neues
      // Kürzel würde beim Speichern eine zweite Datei anlegen.
      const bearbeitet = geladen !== null;
      setMarke((m) => ({
        ...m,
        ...vorschlag,
        slug: bearbeitet ? m.slug : vorschlag.slug,
        name: bearbeitet ? m.name : vorschlag.name,
        farben: { ...m.farben, ...vorschlag.farben },
        schriften: { ...m.schriften, ...vorschlag.schriften },
        texte: bearbeitet
          ? m.texte
          : { ...m.texte, eyebrow: `Automatisierung für ${vorschlag.name}` },
        kontakt: m.kontakt,
        useCases: m.useCases,
        mengen: m.mengen,
        arbeitstage: m.arbeitstage,
      }));
    } catch {
      setFehler("Die Anfrage ist fehlgeschlagen.");
    } finally {
      setLaeuft(false);
    }
  }

  /* ------------------------------ Ausgabe ------------------------------- */

  const sauber = useMemo(() => {
    const kopie: MarkeEingabe = JSON.parse(JSON.stringify(marke));
    if (kopie.texte) {
      for (const [k, v] of Object.entries(kopie.texte)) {
        if (!v) delete (kopie.texte as Record<string, unknown>)[k];
      }
      if (!Object.keys(kopie.texte).length) delete kopie.texte;
    }
    if (kopie.kontakt) {
      for (const [k, v] of Object.entries(kopie.kontakt)) {
        if (!v) delete (kopie.kontakt as Record<string, unknown>)[k];
      }
    }
    for (const [k, v] of Object.entries(kopie.farben)) {
      if (!v) delete (kopie.farben as Record<string, unknown>)[k];
    }
    if (kopie.mengen) {
      for (const [slug, werte] of Object.entries(kopie.mengen)) {
        if (!werte || (!werte.proTag && !werte.manuellMinuten)) delete kopie.mengen[slug];
      }
      if (!Object.keys(kopie.mengen).length) delete kopie.mengen;
    }
    return kopie;
  }, [marke]);

  const json = useMemo(() => JSON.stringify(sauber, null, 2), [sauber]);

  async function kopieren(was: string, inhalt: string) {
    try {
      await navigator.clipboard.writeText(inhalt);
      setKopiert(was);
      setTimeout(() => setKopiert(null), 2000);
    } catch {
      setFehler("Kopieren hat nicht geklappt – bitte manuell markieren.");
    }
  }

  async function listeAktualisieren() {
    try {
      const antwort = await fetch("/api/kunden");
      const daten = await antwort.json();
      if (antwort.ok) {
        setKunden(daten.kunden as KundeKurz[]);
        setDateifehler(daten.fehler ?? []);
      }
    } catch {
      /* Liste bleibt, wie sie war */
    }
  }

  async function speichern() {
    setSpeicherStand({ art: "laeuft" });
    try {
      const antwort = await fetch("/api/kunden", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sauber),
      });
      const daten = await antwort.json();
      if (!antwort.ok) {
        setSpeicherStand({ art: "fehler", text: daten.fehler ?? "Speichern hat nicht geklappt." });
        return;
      }
      setSpeicherStand({
        art: "ok",
        pfad: daten.pfad,
        adresse: daten.adresse,
        ueberschrieben: Boolean(daten.ueberschrieben),
      });
      setAngelegt((liste) => (liste.includes(marke.slug) ? liste : [...liste, marke.slug]));
      setGeladen(marke.slug);
      await listeAktualisieren();
    } catch {
      setSpeicherStand({ art: "fehler", text: "Die Anfrage ist fehlgeschlagen." });
    }
  }

  async function kundeLaden(slug: string) {
    setFehler(null);
    try {
      const antwort = await fetch(`/api/kunden/${slug}`);
      const daten = await antwort.json();
      if (!antwort.ok) {
        setFehler(daten.fehler ?? "Kunde konnte nicht geladen werden.");
        return;
      }
      const eingabe = daten.kunde as MarkeEingabe;
      setMarke({ ...START, ...eingabe, farben: { ...START.farben, ...eingabe.farben } });
      setBefund(null);
      // Herkunft wieder ins Feld, damit die Vorschläge einen Klick entfernt sind.
      setAdresse(eingabe.quelle ?? "");
      setGeladen(slug);
      setSpeicherStand({ art: "leer" });
    } catch {
      setFehler("Kunde konnte nicht geladen werden.");
    }
  }

  async function kundeLoeschen(slug: string) {
    try {
      const antwort = await fetch(`/api/kunden/${slug}`, { method: "DELETE" });
      const daten = await antwort.json();
      if (!antwort.ok) {
        setSpeicherStand({ art: "fehler", text: daten.fehler ?? "Löschen hat nicht geklappt." });
        return;
      }
      setLoeschKandidat(null);
      if (geladen === slug) setGeladen(null);
      await listeAktualisieren();
    } catch {
      setSpeicherStand({ art: "fehler", text: "Die Anfrage ist fehlgeschlagen." });
    }
  }

  function neuAnfangen() {
    setMarke(START);
    setBefund(null);
    setAdresse("");
    setGeladen(null);
    setSpeicherStand({ art: "leer" });
  }

  function herunterladen() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${marke.slug || "kunde"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const vorschauPfad = `/vorschau?b=${vorschauCode}`;
  const slugKollision =
    kunden.some((k) => k.slug === marke.slug) &&
    geladen !== marke.slug &&
    !angelegt.includes(marke.slug);

  /* -------------------------------- View -------------------------------- */

  return (
    <div className="min-h-dvh bg-surface text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-baseline gap-3">
            <Link
              href="/"
              className="t-mono inline-flex items-center gap-1.5 text-[0.72rem] text-muted transition-colors hover:text-primary"
            >
              <svg viewBox="0 0 16 8" className="h-2 w-4" aria-hidden>
                <path
                  d="M16 4H3m0 0 3.5-3.5M3 4l3.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
              Übersicht
            </Link>
            <span className="t-display text-[1.25rem]" style={{ fontStretch: "92%" }}>
              Studio
            </span>
            <span className="t-mono text-[0.68rem] text-faint">
              {geladen ? `bearbeitet: ${geladen}` : "neuer Kunde"}
            </span>
            {geladen ? (
              <button
                type="button"
                onClick={neuAnfangen}
                className="t-mono text-[0.68rem] text-muted underline underline-offset-4 transition-colors hover:text-primary"
              >
                neu anfangen
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                kopieren("link", `${window.location.origin}/vorschau?b=${markeKodieren(sauber)}`)
              }
              className="t-mono rounded-brand-sm border border-line px-3 py-2 text-[0.7rem] transition-colors hover:border-primary hover:text-primary"
            >
              {kopiert === "link" ? "Link kopiert" : "Vorschau-Link kopieren"}
            </button>
            <button
              type="button"
              onClick={herunterladen}
              className="t-mono rounded-brand-sm border border-line px-3 py-2 text-[0.7rem] transition-colors hover:border-primary hover:text-primary"
            >
              JSON laden
            </button>
            <button
              type="button"
              onClick={speichern}
              disabled={!speichernMoeglich || speicherStand.art === "laeuft" || !marke.name.trim()}
              title={
                speichernMoeglich
                  ? undefined
                  : "Auf dieser Umgebung ist das Dateisystem schreibgeschützt."
              }
              className="t-mono rounded-brand-sm bg-primary px-4 py-2 text-[0.7rem] text-on-primary transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {speicherStand.art === "laeuft" ? "speichert …" : "Kunde speichern"}
            </button>
          </div>
        </div>

        {speicherStand.art === "ok" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-primary-soft px-6 py-2.5">
            <span className="text-[0.8rem]">
              {speicherStand.ueberschrieben ? "Kunde aktualisiert" : "Kunde angelegt"} –{" "}
              <span className="t-mono text-[0.74rem]">{speicherStand.pfad}</span>
            </span>
            <a
              href={speicherStand.adresse}
              target="_blank"
              rel="noreferrer"
              className="t-mono text-[0.74rem] text-primary underline underline-offset-4"
            >
              {speicherStand.adresse} öffnen
            </a>
          </div>
        ) : null}

        {speicherStand.art === "fehler" ? (
          <p className="border-t border-line bg-accent-soft px-6 py-2.5 text-[0.8rem]">
            {speicherStand.text}
          </p>
        ) : null}

        {speicherFluechtig ? (
          <p className="border-t border-line bg-accent-soft px-6 py-2.5 text-[0.8rem]">
            Kein dauerhafter Speicher eingerichtet: Angelegte Kunden verschwinden beim nächsten
            Deploy. <span className="t-mono">DEMO_DATEN_PFAD</span> auf ein Volume setzen.
          </p>
        ) : null}
      </header>

      <div className="grid xl:grid-cols-[27rem_1fr]">
        {/* Formular */}
        <div className="border-r border-line bg-surface">
          <Abschnitt
            nummer="00"
            titel="Angelegte Kunden"
            hinweis={
              kunden.length
                ? "Zum Bearbeiten anklicken. Speichern überschreibt dann diesen Kunden."
                : "Noch keine Kunden angelegt."
            }
          >
            {dateifehler.length ? (
              <div className="rounded-brand-sm border border-accent bg-accent-soft p-3">
                <p className="text-[0.82rem] font-medium">
                  {dateifehler.length} Datei{dateifehler.length === 1 ? "" : "en"} konnte
                  {dateifehler.length === 1 ? "" : "n"} nicht gelesen werden
                </p>
                <ul className="mt-2 space-y-1">
                  {dateifehler.map((f) => (
                    <li key={f.datei} className="t-mono text-[0.68rem] leading-relaxed">
                      {f.datei} – {f.grund}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.78rem] text-muted">
                  Die übrigen Kunden funktionieren weiter.
                </p>
              </div>
            ) : null}

            {kunden.length ? (
              <ul className="space-y-1.5">
                {kunden.map((k) => (
                  <li
                    key={k.slug}
                    className={`flex items-center gap-2 rounded-brand-sm border px-3 py-2 transition-colors ${
                      geladen === k.slug ? "border-primary bg-primary-soft" : "border-line bg-paper"
                    }`}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-brand-sm"
                      style={{ background: k.primaer }}
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => kundeLaden(k.slug)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[0.86rem] leading-tight">{k.name}</span>
                      <span className="t-mono block truncate text-[0.64rem] text-faint">
                        /kunde/{k.slug} · {k.anzahlAblaeufe || "alle"} Abläufe
                      </span>
                    </button>
                    <a
                      href={`/kunde/${k.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="t-mono shrink-0 rounded-brand-sm border border-line px-2 py-1 text-[0.64rem] text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      ansehen
                    </a>
                    {loeschKandidat === k.slug ? (
                      <span className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => kundeLoeschen(k.slug)}
                          className="t-mono rounded-brand-sm bg-accent px-2 py-1 text-[0.64rem] text-paper"
                        >
                          wirklich?
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoeschKandidat(null)}
                          className="t-mono rounded-brand-sm border border-line px-2 py-1 text-[0.64rem] text-muted"
                        >
                          nein
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLoeschKandidat(k.slug)}
                        disabled={!speichernMoeglich}
                        title={
                          speichernMoeglich
                            ? "Kunde löschen"
                            : "Auf dieser Umgebung ist das Dateisystem schreibgeschützt."
                        }
                        className="t-mono shrink-0 rounded-brand-sm border border-line px-2 py-1 text-[0.64rem] text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
                      >
                        löschen
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </Abschnitt>

          <Abschnitt
            nummer="01"
            titel="Branding von der Website übernehmen"
            hinweis={
              geladen
                ? "Neu einlesen holt Logo-, Farb- und Schriftvorschläge zurück. Name und Kürzel bleiben unverändert."
                : "Logo, Farben und Schriften werden von der Kundenseite gelesen. Alles bleibt danach änderbar."
            }
          >
            <div className="flex gap-2">
              <input
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") erfassen();
                }}
                placeholder="kunde.de"
                className={eingabeKlasse}
                spellCheck={false}
              />
              <button
                type="button"
                onClick={erfassen}
                disabled={laeuft || !adresse.trim()}
                className="t-mono shrink-0 rounded-brand-sm bg-ink px-4 py-2 text-[0.7rem] text-surface transition-opacity disabled:opacity-40"
              >
                {laeuft ? "liest …" : geladen ? "Neu einlesen" : "Übernehmen"}
              </button>
            </div>

            {geladen && marke.quelle && !befund ? (
              <p className="rounded-brand-sm border border-line bg-paper px-3 py-2.5 text-[0.8rem] leading-relaxed text-muted">
                Erfasst von <span className="t-mono text-ink">{marke.quelle}</span>. Die gefundenen
                Logos, Farben und Schriften stehen nach dem Einlesen wieder zur Auswahl – die
                gespeicherten Werte werden dabei überschrieben.
              </p>
            ) : null}

            {geladen && !marke.quelle ? (
              <p className="rounded-brand-sm border border-line bg-paper px-3 py-2.5 text-[0.8rem] leading-relaxed text-muted">
                Für diesen Kunden ist keine Herkunft hinterlegt – er wurde angelegt, bevor die
                Adresse mitgespeichert wurde. Adresse eintragen und neu einlesen.
              </p>
            ) : null}

            {fehler ? (
              <p className="rounded-brand-sm border border-accent/40 bg-accent-soft px-3 py-2 text-[0.8rem]">
                {fehler}
              </p>
            ) : null}

            {befund ? (
              <div className="space-y-4 rounded-brand-sm border border-line bg-paper p-4">
                <p className="t-mono text-[0.68rem] text-faint">Gelesen von {befund.quelle}</p>

                {befund.logos.length ? (
                  <div>
                    <p className="t-eyebrow mb-2 text-faint">Gefundene Bildmarken</p>
                    <div className="flex flex-wrap gap-2">
                      {befund.logos.map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() =>
                            aendern({ logo: { bild: `/api/bild?u=${encodeURIComponent(l)}`, hoehe: 30 } })
                          }
                          className="flex h-12 w-20 items-center justify-center rounded-brand-sm border border-line bg-white p-1.5 transition-colors hover:border-primary"
                          title={l}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/bild?u=${encodeURIComponent(l)}`}
                            alt=""
                            className="max-h-full max-w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {befund.schriften.kandidaten.length ? (
                  <div>
                    <p className="t-eyebrow mb-2 text-faint">Erkannte Schriften</p>
                    <div className="flex flex-wrap gap-1.5">
                      {befund.schriften.kandidaten.map((s) => {
                        const key = schriftSchluessel(s);
                        return key ? (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setMarke((m) => ({
                                ...m,
                                schriften: { ...m.schriften, display: key, text: key },
                              }))
                            }
                            className="t-mono rounded-brand-sm border border-line px-2 py-1 text-[0.68rem] transition-colors hover:border-primary hover:text-primary"
                          >
                            {s}
                          </button>
                        ) : (
                          <span
                            key={s}
                            title="Nicht im Register – wird nicht von fremden Servern geladen"
                            className="t-mono rounded-brand-sm border border-dashed border-line px-2 py-1 text-[0.68rem] text-faint line-through"
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {befund.hinweise.length ? (
                  <ul className="space-y-1">
                    {befund.hinweise.map((h) => (
                      <li key={h} className="text-[0.76rem] text-muted">
                        · {h}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </Abschnitt>

          <Abschnitt nummer="02" titel="Kunde">
            <div className="flex gap-3">
              <Feld label="Name">
                <input
                  value={marke.name}
                  onChange={(e) =>
                    setMarke((m) => ({
                      ...m,
                      name: e.target.value,
                      logo: m.logo?.bild ? m.logo : { text: e.target.value },
                    }))
                  }
                  className={eingabeKlasse}
                />
              </Feld>
              <Feld label="Kürzel (URL)">
                <input
                  value={marke.slug}
                  onChange={(e) =>
                    aendern({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })
                  }
                  className={eingabeKlasse}
                  spellCheck={false}
                />
              </Feld>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button
                type="button"
                onClick={() =>
                  aendern({
                    slug: hatZusatz(marke.slug) ? ohneZusatz(marke.slug) : mitZusatz(marke.slug),
                  })
                }
                className="t-mono rounded-brand-sm border border-line px-2.5 py-1 text-[0.68rem] text-muted transition-colors hover:border-primary hover:text-primary"
              >
                {hatZusatz(marke.slug) ? "Zufallszusatz entfernen" : "Zufallszusatz anhängen"}
              </button>
              <span className="text-[0.74rem] leading-snug text-muted">
                {hatZusatz(marke.slug)
                  ? "Die Adresse ist nicht zu erraten."
                  : "Ohne Zusatz kann jeder den Firmennamen durchprobieren."}
              </span>
            </div>

            {slugKollision ? (
              <p className="t-mono text-[0.7rem] text-accent-text">
                Kürzel ist vergeben – die vorhandene Demo würde überschrieben.
              </p>
            ) : null}
            <Feld label="Branche (optional)" breit>
              <input
                value={marke.branche ?? ""}
                onChange={(e) => aendern({ branche: e.target.value })}
                className={eingabeKlasse}
              />
            </Feld>
            <div className="flex gap-3">
              <Feld label="Logo-Bild (URL)">
                <input
                  value={marke.logo?.bild ?? ""}
                  onChange={(e) =>
                    aendern({ logo: { ...marke.logo, bild: e.target.value || undefined } })
                  }
                  placeholder="leer = Wortmarke"
                  className={eingabeKlasse}
                  spellCheck={false}
                />
              </Feld>
              <Feld label="Höhe">
                <input
                  type="number"
                  min={14}
                  max={80}
                  value={marke.logo?.hoehe ?? 26}
                  onChange={(e) => aendern({ logo: { ...marke.logo, hoehe: Number(e.target.value) } })}
                  className={`${eingabeKlasse} w-20`}
                />
              </Feld>
            </div>
          </Abschnitt>

          <Abschnitt
            nummer="03"
            titel="Farben"
            hinweis="Erst das Ziel wählen, dann eine gefundene Farbe anklicken."
          >
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  ["primaer", "Primär"],
                  ["akzent", "Akzent"],
                  ["ink", "Text"],
                  ["flaeche", "Fläche"],
                ] as const
              ).map(([feld, label]) => (
                <button
                  key={feld}
                  type="button"
                  onClick={() => setFarbZiel(feld)}
                  className={`t-mono rounded-brand-sm border px-3 py-1.5 text-[0.68rem] transition-colors ${
                    farbZiel === feld
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-line text-muted hover:border-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["primaer", "Primär"],
                  ["akzent", "Akzent"],
                  ["ink", "Text"],
                  ["flaeche", "Fläche"],
                ] as const
              ).map(([feld, label]) => (
                <div key={feld} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={marke.farben[feld] || "#000000"}
                    onChange={(e) => farbe(feld, e.target.value)}
                    className="h-9 w-9 shrink-0 cursor-pointer rounded-brand-sm border border-line bg-paper p-0.5"
                    aria-label={label}
                  />
                  <input
                    value={marke.farben[feld] ?? ""}
                    onChange={(e) => farbe(feld, e.target.value)}
                    placeholder="automatisch"
                    className={`${eingabeKlasse} t-mono text-[0.75rem]`}
                    spellCheck={false}
                  />
                </div>
              ))}
            </div>

            {befund?.farbKandidaten.length ? (
              <div>
                <p className="t-eyebrow mb-2 text-faint">Auf der Website gefunden</p>
                <div className="flex flex-wrap gap-1.5">
                  {befund.farbKandidaten.map((f) => (
                    <button
                      key={f.hex}
                      type="button"
                      onClick={() => farbe(farbZiel, f.hex)}
                      title={`${f.hex} · ${f.quelle}`}
                      className="h-8 w-8 rounded-brand-sm border border-line transition-transform hover:scale-110"
                      style={{ background: f.hex }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </Abschnitt>

          <Abschnitt nummer="04" titel="Schrift und Form">
            <div className="flex gap-3">
              <Feld label="Überschriften">
                <SchriftWahl
                  wert={marke.schriften?.display}
                  auswahl={DISPLAY_FONTS}
                  onChange={(v) =>
                    setMarke((m) => ({ ...m, schriften: { ...m.schriften, display: v } }))
                  }
                />
              </Feld>
              <Feld label="Fließtext">
                <SchriftWahl
                  wert={marke.schriften?.text}
                  auswahl={BODY_FONTS}
                  onChange={(v) => setMarke((m) => ({ ...m, schriften: { ...m.schriften, text: v } }))}
                />
              </Feld>
            </div>
            <div className="flex gap-3">
              <Feld label="Zahlen und Technik">
                <SchriftWahl
                  wert={marke.schriften?.mono}
                  auswahl={MONO_FONTS}
                  onChange={(v) => setMarke((m) => ({ ...m, schriften: { ...m.schriften, mono: v } }))}
                />
              </Feld>
              <Feld label={`Ecken · ${marke.radius ?? 4} px`}>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={marke.radius ?? 4}
                  onChange={(e) => aendern({ radius: Number(e.target.value) })}
                  className="mt-2 w-full accent-[var(--c-primary)]"
                />
              </Feld>
            </div>
          </Abschnitt>

          <Abschnitt
            nummer="05"
            titel="Abläufe auswählen"
            hinweis="Die Reihenfolge folgt der Auswahl. Nichts ausgewählt heißt: alle."
          >
            <div className="space-y-1.5">
              {useCases.map((uc) => {
                const gewaehlt = marke.useCases?.includes(uc.slug) ?? false;
                const position = (marke.useCases?.indexOf(uc.slug) ?? -1) + 1;
                const eigen = marke.mengen?.[uc.slug];
                return (
                  <div
                    key={uc.slug}
                    className={`rounded-brand-sm border transition-colors ${
                      gewaehlt ? "border-primary bg-primary-soft" : "border-line bg-paper"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMarke((m) => {
                          const liste = m.useCases ?? [];
                          return {
                            ...m,
                            useCases: liste.includes(uc.slug)
                              ? liste.filter((s) => s !== uc.slug)
                              : [...liste, uc.slug],
                          };
                        })
                      }
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                    >
                      <span
                        className={`t-mono flex h-5 w-5 shrink-0 items-center justify-center rounded-brand-sm text-[0.6rem] ${
                          gewaehlt ? "bg-primary text-on-primary" : "border border-line text-faint"
                        }`}
                      >
                        {gewaehlt ? position : ""}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.86rem] leading-tight">{uc.name}</span>
                        <span className="t-mono text-[0.64rem] text-faint">
                          {uc.kicker} · {uc.manuellMinuten} min → {uc.autoSekunden} s
                        </span>
                      </span>
                    </button>

                    {gewaehlt ? (
                      <div className="border-t border-line/60 px-3 py-2.5">
                        <p className="t-eyebrow mb-2 text-faint">
                          Mengen beim Kunden {eigen?.proTag && eigen?.manuellMinuten ? "" : "(leer = Schätzung)"}
                        </p>
                        <div className="flex gap-2">
                          <label className="flex-1">
                            <span className="mb-1 block text-[0.7rem] text-muted">
                              {uc.einheit} am Tag
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={eigen?.proTag ?? ""}
                              onChange={(e) => menge(uc.slug, "proTag", e.target.value)}
                              placeholder={String(uc.proTag)}
                              className={`${eingabeKlasse} t-mono text-[0.78rem]`}
                            />
                          </label>
                          <label className="flex-1">
                            <span className="mb-1 block text-[0.7rem] text-muted">
                              Minuten von Hand
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={eigen?.manuellMinuten ?? ""}
                              onChange={(e) => menge(uc.slug, "manuellMinuten", e.target.value)}
                              placeholder={String(uc.manuellMinuten)}
                              className={`${eingabeKlasse} t-mono text-[0.78rem]`}
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <label className="flex items-center justify-between gap-4 rounded-brand-sm border border-line bg-paper px-3 py-2.5">
              <span className="text-[0.82rem] text-muted">Arbeitstage im Jahr</span>
              <input
                type="number"
                min={1}
                max={365}
                value={marke.arbeitstage ?? 220}
                onChange={(e) => aendern({ arbeitstage: Number(e.target.value) || 220 })}
                className={`${eingabeKlasse} t-mono w-24 text-[0.78rem]`}
              />
            </label>
          </Abschnitt>

          <Abschnitt nummer="06" titel="Texte" hinweis="Leer lassen heißt: sinnvoller Standardtext.">
            <Feld label="Kleine Zeile oben" breit>
              <input
                value={marke.texte?.eyebrow ?? ""}
                onChange={(e) => text("eyebrow", e.target.value)}
                placeholder={`Automatisierung für ${marke.name}`}
                className={eingabeKlasse}
              />
            </Feld>
            <Feld label="Überschrift" breit>
              <textarea
                value={marke.texte?.ueberschrift ?? ""}
                onChange={(e) => text("ueberschrift", e.target.value)}
                placeholder="Arbeit, die sich selbst erledigt."
                rows={2}
                className={`${eingabeKlasse} resize-none`}
              />
            </Feld>
            <Feld label="Einleitung" breit>
              <textarea
                value={marke.texte?.intro ?? ""}
                onChange={(e) => text("intro", e.target.value)}
                placeholder="Zwei Sätze, die den Kunden abholen."
                rows={3}
                className={`${eingabeKlasse} resize-none`}
              />
            </Feld>
            <Feld label="Abschluss – Überschrift" breit>
              <input
                value={marke.texte?.abschlussTitel ?? ""}
                onChange={(e) => text("abschlussTitel", e.target.value)}
                placeholder="Welchen Ablauf schauen wir uns genauer an?"
                className={eingabeKlasse}
              />
            </Feld>
            <Feld label="Abschluss – Text" breit>
              <textarea
                value={marke.texte?.abschlussText ?? ""}
                onChange={(e) => text("abschlussText", e.target.value)}
                placeholder="Das konkrete Angebot in einem Satz."
                rows={2}
                className={`${eingabeKlasse} resize-none`}
              />
            </Feld>
          </Abschnitt>

          <Abschnitt nummer="07" titel="Ansprechpartner" hinweis="Steht im Abschluss und im Kopf.">
            <div className="flex gap-3">
              <Feld label="Name">
                <input
                  value={marke.kontakt?.name ?? ""}
                  onChange={(e) =>
                    setMarke((m) => ({ ...m, kontakt: { ...m.kontakt, name: e.target.value } }))
                  }
                  className={eingabeKlasse}
                />
              </Feld>
              <Feld label="Rolle">
                <input
                  value={marke.kontakt?.rolle ?? ""}
                  onChange={(e) =>
                    setMarke((m) => ({ ...m, kontakt: { ...m.kontakt, rolle: e.target.value } }))
                  }
                  className={eingabeKlasse}
                />
              </Feld>
            </div>
            <Feld label="E-Mail" breit>
              <input
                type="email"
                value={marke.kontakt?.mail ?? ""}
                onChange={(e) =>
                  setMarke((m) => ({ ...m, kontakt: { ...m.kontakt, mail: e.target.value } }))
                }
                className={eingabeKlasse}
                spellCheck={false}
              />
            </Feld>
          </Abschnitt>

          <Abschnitt
            nummer="08"
            titel="Fertig – und jetzt?"
            hinweis="Zwei Wege, je nachdem wie dauerhaft es sein soll."
          >
            <div className="rounded-brand-sm border border-line bg-paper p-4">
              <p className="text-[0.86rem] font-medium">Sofort verschicken</p>
              <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
                <span className="t-mono text-ink">Vorschau-Link kopieren</span> oben rechts. Die
                komplette Marke steckt in der Adresse – nichts muss gespeichert oder veröffentlicht
                werden.
              </p>
            </div>

            <div className="rounded-brand-sm border border-line bg-paper p-4">
              <p className="text-[0.86rem] font-medium">Feste Adresse</p>
              {speichernMoeglich ? (
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
                  <span className="t-mono text-ink">Kunde speichern</span> legt{" "}
                  <span className="t-mono text-ink">content/kunden/{marke.slug || "kunde"}.json</span>{" "}
                  an. Die Demo läuft danach unter{" "}
                  <span className="t-mono text-ink">/kunde/{marke.slug || "kunde"}</span> und taucht
                  in der Übersicht auf. Zum Veröffentlichen die Datei mit einchecken.
                </p>
              ) : (
                <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
                  Hier ist das Dateisystem schreibgeschützt.{" "}
                  <span className="t-mono text-ink">JSON laden</span>, die Datei nach{" "}
                  <span className="t-mono text-ink">content/kunden/</span> legen und einchecken.
                  Danach läuft die Demo unter{" "}
                  <span className="t-mono text-ink">/kunde/{marke.slug || "kunde"}</span>.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => kopieren("json", json)}
              className="t-mono w-fit rounded-brand-sm border border-line px-3 py-1.5 text-[0.7rem] text-muted transition-colors hover:border-primary hover:text-primary"
            >
              {kopiert === "json" ? "JSON kopiert" : "JSON in die Zwischenablage"}
            </button>
            <pre className="thin-scroll max-h-64 overflow-auto rounded-brand-sm border border-line bg-paper p-3 text-[0.7rem] leading-relaxed">
              <code className="t-mono">{json}</code>
            </pre>
          </Abschnitt>
        </div>

        {/* Vorschau */}
        <div className="relative">
          <div className="sticky top-[4.4rem] flex h-[calc(100dvh-4.4rem)] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
              <span className="t-eyebrow text-faint">Vorschau</span>
              <div className="flex items-center gap-2">
                <div className="flex rounded-brand-sm border border-line p-0.5">
                  {(["gross", "klein"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBreite(b)}
                      className={`t-mono rounded-[2px] px-2.5 py-1 text-[0.66rem] transition-colors ${
                        breite === b ? "bg-ink text-surface" : "text-muted"
                      }`}
                    >
                      {b === "gross" ? "Desktop" : "Mobil"}
                    </button>
                  ))}
                </div>
                <a
                  href={vorschauPfad}
                  target="_blank"
                  rel="noreferrer"
                  className="t-mono rounded-brand-sm border border-line px-2.5 py-1.5 text-[0.66rem] text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  Neuer Tab
                </a>
              </div>
            </div>
            <div className="flex flex-1 justify-center overflow-hidden bg-line/40 p-4">
              <iframe
                src={vorschauPfad}
                title="Vorschau der Kundendemo"
                className={`h-full rounded-brand border border-line bg-white transition-[width] duration-300 ${
                  breite === "gross" ? "w-full" : "w-[390px]"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchriftWahl({
  wert,
  auswahl,
  onChange,
}: {
  wert: string | undefined;
  auswahl: FontKey[];
  onChange: (wert: string) => void;
}) {
  // Nur Register-Schriften: alles andere könnte nicht ausgeliefert werden.
  const key = schriftSchluessel(wert) ?? auswahl[0];
  return (
    <select
      value={key}
      onChange={(e) => onChange(e.target.value)}
      className={`${eingabeKlasse} cursor-pointer`}
    >
      {auswahl.map((k) => (
        <option key={k} value={k}>
          {FONTS[k].label}
        </option>
      ))}
    </select>
  );
}
