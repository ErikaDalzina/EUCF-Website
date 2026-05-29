import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Condensed, Archivo_Black } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
  title: "EUCF Website",
  description: "Information website build with Next.js",
  keywords: ["Next.js", "TypeScript", "Web Development"],
  authors: [{ name: "Tulio Contramaestre" }, {name: "Erika D'alzina"}],
  openGraph: {
    title: "EUCF Website",
    description: "Information website build with Next.js",
    url: "",
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
        className={`${geistSans.variable} ${geistMono.variable} ${robotoCondensed.variable} ${archivoBlack.variable} antialiased min-h-screen flex flex-col text-gray-900 overflow-x-hidden`}
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
