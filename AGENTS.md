<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Demo-System

Kundendemos für Automatisierungs-Abläufe. Abläufe sind für alle Kunden gleich, getauscht wird nur
das Branding. Bedienungsanleitung steht im README.

### Regeln

- **Keine festen Farben, Schriften oder Radien in Komponenten.** Nur die Tokens aus
  `app/globals.css` verwenden (`bg-paper`, `text-muted`, `border-line`, `text-accent`,
  `rounded-brand`, `t-display`, `t-mono`, `t-eyebrow`). Eine Marke setzt diese Variablen auf einem
  Wrapper – eine hart geschriebene Farbe bricht bei jedem zweiten Kunden.
- **Auf der dunklen Bühne** gelten eigene Tokens: `text-stage-ink`, `text-stage-muted`,
  `border-stage-line`, `text-stage-primary`. Nie `text-primary` auf der Bühne – dunkle
  Markenfarben sind dort nicht lesbar.
- **Für Text nie `text-accent`**, sondern `text-accent-text` (hell) bzw. `text-accent-stage`
  (Bühne). `bg-accent` und `border-accent` behalten die ungefilterte Markenfarbe. Grund: ein
  Signalorange hat auf Weiß rund 2,6:1 – als Fläche in Ordnung, als Beschriftung nicht.
- **Textfarben nicht selbst mischen.** `muted`, `faint` und die Akzent-Textfarben werden in
  `aufloesen()` je Marke auf mindestens 4,5:1 gerechnet und als CSS-Variablen gesetzt. Ein
  eigenes `color-mix` umgeht das und reißt bei der nächsten Kundenfarbe die Grenze.
- **Schriften nur aus `lib/schriften.ts`.** Was dort nicht steht, wird nicht angezeigt – schon gar
  nicht per Live-Link von Google. Kundenseiten dürfen keine Anfrage an einen fremden Server
  auslösen.
- **Kundendateien defensiv lesen.** `kundenLesen()` überspringt unbrauchbare Dateien und meldet
  sie. Nie `JSON.parse` ohne Auffangen: eine Datei mit fehlendem Komma legte früher jede
  Kundenseite auf einmal lahm.
- **Neuer Ablauf = neue Datei in `lib/usecases/` plus Eintrag in `index.ts`.** Keine neue
  Komponente. Reicht die vorhandene Beleg-Art nicht, erst `Beleg` in `lib/usecases/typen.ts`
  erweitern und in `components/Beleg.tsx` rendern.
- **Oberflächentexte auf Deutsch**, Alltagssprache, keine Fachbegriffe. Zielgruppe sind
  Geschäftsführung und Sachbearbeitung, nicht IT.
- **Demo-Daten sind erfunden**, aber realistisch: deutsche Namen, plausible Beträge, echte
  Belegstrukturen.
- Feldnamen in Inhaltsdateien sind deutsch (`farben.primaer`, `stationen`), damit der Vertrieb sie
  ohne Erklärung lesen kann.
- **Hochrechnungen nur über `lib/kennzahlen.ts`.** Die Zahlen in den Ablaufdateien sind
  Schätzungen; der Kunde kann sie überschreiben. Wer selbst rechnet, umgeht die Kennzeichnung
  „Schätzung" – und dann steht eine geratene Zahl auf der Seite, die nach Messung aussieht.
- Mengenangaben nie mit `{zahl} {einheit}` zusammenbauen, sondern `mengeText()` verwenden, sonst
  entsteht „1 Eintritte".

- **Keine Seite vorrendern, die Kundendaten zeigt.** `generateStaticParams` oder statisches
  Rendern führt dazu, dass eine im Studio bearbeitete Demo online weiter die alte Fassung zeigt.
  Betroffen sind `/`, `/studio` und `/kunde/…`; alle stehen auf `dynamic = "force-dynamic"`.
- **Dateien nicht nach `public/` schreiben.** Was dort nach dem Bauen landet, wird im
  Produktionsbetrieb nicht ausgeliefert (nachgemessen: 404). Laufzeit-Dateien gehören unter
  `lib/pfade.ts` und werden über einen Route Handler ausgeliefert.
- **Neue öffentliche Route?** In [proxy.ts](proxy.ts) eintragen, sonst verlangt sie ein Passwort.
  Umgekehrt gilt: alles Neue ist standardmäßig geschützt – das ist die richtige Richtung.
- **Bildadressen für `/api/bild` nie von Hand zusammenbauen**, sondern `bildAdresse()` aus
  [lib/bildsignatur.ts](lib/bildsignatur.ts) verwenden. Ohne Unterschrift weist der Proxy ab, und
  im Browser lässt sich nicht unterschreiben – solche Adressen müssen serverseitig entstehen.

### Nach Änderungen

`npm test` und `npm run build` – der Typcheck läuft im Build mit. Die Tests decken die
Bereichsprüfung des SSRF-Schutzes, die Heuristiken der Website-Erfassung, die Hochrechnungen, die
Inhalte der Abläufe und die Kontrastberechnung ab; sie laufen in unter einer Sekunde.

Optische Änderungen gegen mindestens zwei Marken prüfen, darunter `voltana` (dunkles
Erscheinungsbild) und `helia` (Serif, große Radien).
