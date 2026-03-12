import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Condensed } from "next/font/google";
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
        className={`${geistSans.variable} ${geistMono.variable} ${robotoCondensed.variable} antialiased min-h-screen flex flex-col text-gray-900`} 
      >
        <Header />
        <main>
          <div>
            {children}
          </div>
        </main>
        <footer className="mt-24">
          <Footer/>
        </footer>
      </body>
    </html>
  );
}
