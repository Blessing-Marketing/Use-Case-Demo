import { describe, expect, it } from "vitest";
import { istEigenerEinhaengepunkt } from "@/lib/pfade";

/**
 * Erkennt die Prüfung, ob unter dem Datenpfad wirklich ein Volume hängt?
 *
 * Ohne sie fällt ein fehlendes Volume erst auf, wenn die Kundendaten nach
 * einem Deploy verschwunden sind - genau so ist es passiert.
 */

/** Auszug aus /proc/self/mountinfo eines Containers mit Volume unter /daten. */
const MIT_VOLUME = `
593 421 0:65 / / rw,relatime master:174 - overlay overlay rw,lowerdir=/var/lib/docker
594 593 0:69 / /proc rw,nosuid,nodev,noexec,relatime - proc proc rw
595 593 0:70 / /dev rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
612 593 259:1 /var/lib/docker/volumes/demo-daten/_data /daten rw,relatime - ext4 /dev/nvme0n1p1 rw
613 593 259:1 /var/lib/docker/containers/abc/hosts /etc/hosts rw,relatime - ext4 /dev/nvme0n1p1 rw
`.trim();

/** Derselbe Container ohne Volume: /daten ist nur ein Verzeichnis im Abbild. */
const OHNE_VOLUME = `
593 421 0:65 / / rw,relatime master:174 - overlay overlay rw,lowerdir=/var/lib/docker
594 593 0:69 / /proc rw,nosuid,nodev,noexec,relatime - proc proc rw
595 593 0:70 / /dev rw,nosuid - tmpfs tmpfs rw,size=65536k,mode=755
613 593 259:1 /var/lib/docker/containers/abc/hosts /etc/hosts rw,relatime - ext4 /dev/nvme0n1p1 rw
`.trim();

describe("istEigenerEinhaengepunkt", () => {
  it("erkennt ein eingehängtes Volume", () => {
    expect(istEigenerEinhaengepunkt(MIT_VOLUME, "/daten")).toBe(true);
  });

  it("erkennt, wenn keines da ist", () => {
    expect(istEigenerEinhaengepunkt(OHNE_VOLUME, "/daten")).toBe(false);
  });

  it("lässt sich nicht von ähnlichen Namen täuschen", () => {
    expect(istEigenerEinhaengepunkt(MIT_VOLUME, "/datenbank")).toBe(false);
    expect(istEigenerEinhaengepunkt(MIT_VOLUME, "/date")).toBe(false);
  });

  it("akzeptiert einen Pfad unterhalb des Einhängepunkts", () => {
    // Ein Volume auf / würde auch /daten dauerhaft machen.
    expect(istEigenerEinhaengepunkt(MIT_VOLUME, "/daten/kunden")).toBe(true);
    expect(istEigenerEinhaengepunkt(OHNE_VOLUME, "/etc/hosts")).toBe(true);
  });

  it("kommt mit leerer Liste zurecht", () => {
    expect(istEigenerEinhaengepunkt("", "/daten")).toBe(false);
  });
});
