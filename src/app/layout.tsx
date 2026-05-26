import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "ARC-ONE — Handgefertigte Eukalyptus-Leuchten",
  description: "Jeder Arc ist ein physisches Unikat aus dem Eukalyptusforst bei Monchique, Portugal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
