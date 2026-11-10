import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EFFECOM | Communication without barriers",
    template: "%s | EFFECOM",
  },
  description:
    "EFFECOM makes communication more accessible with text-to-speech, speech-to-text, language translation, and video captions.",
  icons: {
    icon: "/effecomlogo.jpeg",
    apple: "/effecomlogo.jpeg",
  },
  openGraph: {
    type: "website",
    title: "EFFECOM | Communication without barriers",
    description:
      "Every voice deserves to be understood. Explore practical tools for more accessible communication.",
    siteName: "EFFECOM",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
