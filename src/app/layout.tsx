import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter: clean, highly legible at all weights — ideal for SaaS dashboards and
// Nigerian mobile users (excellent hinting at small sizes)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AgriTrace — Agricultural Supply Chain Traceability",
  description:
    "AI-powered agricultural supply chain traceability and market intelligence for Nigeria's Northwest commodity belt. WhatsApp-native, Hausa/English, export compliance automation.",
  keywords: "agritech, Nigeria, sesame, cowpea, supply chain, traceability, export, Katsina",
  openGraph: {
    title: "AgriTrace",
    description: "From farmgate to export — fully traceable.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">{children}</body>
    </html>
  );
}
