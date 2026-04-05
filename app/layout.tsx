import type { Metadata } from "next";
import { DM_Serif_Display, Poppins, Space_Mono } from "next/font/google";
import "./globals.css";

const sourceSans = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-sans",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif-display",
});

export const metadata: Metadata = {
  title: "Simulation Systems - 1st Exam Quiz",
  description: "Interactive simulation systems examination quiz built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${sourceSans.variable} ${spaceMono.variable} ${dmSerifDisplay.variable}`}
      >
        {children}
      </body>
    </html>
  );
}