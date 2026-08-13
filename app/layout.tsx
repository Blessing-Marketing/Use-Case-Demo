import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo-System · Abläufe zum Zuschauen",
  description:
    "Kundenspezifische Demos für Automatisierungs-Abläufe. Gleiche Inhalte, Erscheinungsbild des jeweiligen Kunden.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${fontVariables} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
