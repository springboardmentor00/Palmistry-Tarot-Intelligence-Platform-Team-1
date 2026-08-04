import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mystica · Palmistry & Tarot Intelligence Platform",
  description:
    "An AI-powered mystical platform for palm reading, tarot divination, and personalized spiritual insights. Upload your palm, draw the cards, and receive AI-synthesized wisdom.",
  keywords: [
    "palmistry",
    "tarot",
    "AI reading",
    "spiritual insights",
    "divination",
    "mystic",
  ],
  authors: [{ name: "Mystica Platform" }],
  openGraph: {
    title: "Mystica · Palmistry & Tarot Intelligence Platform",
    description: "AI-powered palmistry, tarot, and personalized spiritual insights.",
    siteName: "Mystica",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${cinzel.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
