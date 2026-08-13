import { describe, expect, it } from "vitest";
import { istGesperrteAdresse } from "@/lib/netzschutz";

/**
 * Der sicherheitskritischste Teil des Systems: beide API-Routen holen
 * Adressen, die von außen kommen. Eine Lücke hier heißt, dass die Anwendung
 * als Werkzeug benutzt werden kann, um interne Dienste abzufragen.
 */

describe("istGesperrteAdresse – IPv4", () => {
  const gesperrt = [
    ["0.0.0.0", "nicht spezifiziert"],
    ["127.0.0.1", "localhost"],
    ["127.255.255.254", "gesamter Loopback-Bereich"],
    ["10.0.0.1", "privat 10/8"],
    ["172.16.0.1", "privat, untere Grenze"],
    ["172.31.255.255", "privat, obere Grenze"],
    ["192.168.1.1", "privat 192.168/16"],
    ["169.254.169.254", "Cloud-Metadatendienst"],
    ["100.64.0.1", "Provider-NAT"],
    ["224.0.0.1", "Multicast"],
    ["255.255.255.255", "Broadcast"],
    ["192.0.0.1", "IANA-Sonderbereich"],
    ["198.18.0.1", "Messnetz"],
  ] as const;

  for (const [adresse, warum] of gesperrt) {
    it(`sperrt ${adresse} (${warum})`, () => {
      expect(istGesperrteAdresse(adresse, 4)).toBe(true);
    });
  }

  const erlaubt = [
    ["8.8.8.8", "öffentlicher DNS"],
    ["93.184.216.34", "öffentliche Website"],
    ["172.32.0.1", "knapp außerhalb von 172.16/12"],
    ["172.15.255.255", "knapp unterhalb von 172.16/12"],
    ["11.0.0.1", "knapp außerhalb von 10/8"],
    ["192.167.255.255", "knapp außerhalb von 192.168/16"],
    ["100.128.0.1", "außerhalb des Provider-NAT"],
  ] as const;

  for (const [adresse, warum] of erlaubt) {
    it(`lässt ${adresse} durch (${warum})`, () => {
      expect(istGesperrteAdresse(adresse, 4)).toBe(false);
    });
  }

  it("sperrt unparsbare Angaben", () => {
    expect(istGesperrteAdresse("keine-adresse", 4)).toBe(true);
    expect(istGesperrteAdresse("999.1.1.1", 4)).toBe(true);
    expect(istGesperrteAdresse("", 4)).toBe(true);
  });
});

describe("istGesperrteAdresse – IPv6", () => {
  const gesperrt = [
    ["::", "nicht spezifiziert"],
    ["::1", "Loopback"],
    ["fd00::1", "eindeutig lokal"],
    ["fc00::1", "eindeutig lokal"],
    ["fe80::1", "link-local"],
    ["febf::1", "link-local, obere Grenze"],
    ["::ffff:127.0.0.1", "IPv4-Loopback in IPv6-Schreibweise"],
    ["::ffff:169.254.169.254", "Metadatendienst in IPv6-Schreibweise"],
    ["64:ff9b::1", "NAT64"],
  ] as const;

  for (const [adresse, warum] of gesperrt) {
    it(`sperrt ${adresse} (${warum})`, () => {
      expect(istGesperrteAdresse(adresse, 6)).toBe(true);
    });
  }

  it("lässt öffentliche IPv6-Adressen durch", () => {
    expect(istGesperrteAdresse("2606:4700:4700::1111", 6)).toBe(false);
    expect(istGesperrteAdresse("2a00:1450:4001::200e", 6)).toBe(false);
    expect(istGesperrteAdresse("::ffff:8.8.8.8", 6)).toBe(false);
  });

  it("beachtet die Zonenangabe nicht", () => {
    expect(istGesperrteAdresse("fe80::1%eth0", 6)).toBe(true);
  });
});
