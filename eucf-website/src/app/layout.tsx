import type { Metadata } from "next";
import { Roboto_Condensed, Archivo_Black } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: "%s | EUCF",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Tulio Contramaestre" }, { name: "Erika D'alzina" }],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "EUCF",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${robotoCondensed.variable} ${archivoBlack.variable} antialiased min-h-dvh flex flex-col text-gray-900 overflow-x-hidden`}
      >
        <a href="#main-content" className="sr-only">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 pt-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
