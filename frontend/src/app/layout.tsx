import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { AgeGate } from "@/components/ui/AgeGate";
import { DisclaimerBanner } from "@/components/ui/DisclaimerBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "JBN - Japan Botanical Network",
  description: "Regulatory Intelligence System for the Japanese cannabinoid market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-navy text-white min-h-screen`}
      >
        <QueryProvider>
          <AgeGate />
          {children}
          <DisclaimerBanner />
        </QueryProvider>
      </body>
    </html>
  );
}
