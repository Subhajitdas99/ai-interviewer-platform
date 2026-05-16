import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Interview Platform",
  description:
    "AI-powered technical interview platform using Resume Intelligence, RAG, and Generative AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        h-full
        scroll-smooth
      `}
    >

      <body
        className="
          min-h-screen
          bg-black
          text-white
          antialiased
          overflow-x-hidden
        "
      >

        <div className="relative flex min-h-screen flex-col">

          {children}

        </div>

      </body>

    </html>

  );
}
