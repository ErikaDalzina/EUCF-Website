import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`} 
      >
        <main className="flex-1">
          <div>
            {children}
          </div>
        </main>
        <footer>
          <Footer/>
        </footer>
      </body>
    </html>
  );
}
