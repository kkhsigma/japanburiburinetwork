import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { AskJbnWrapper } from "@/components/chat/AskJbnWrapper";

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
  title: "JBN - Japan Buriburi Network",
  description:
    "日本のカンナビノイド市場向け規制インテリジェンスプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ backgroundColor: "#030303" }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#030303] text-[#e2e8f0] min-h-screen`}
        style={{ backgroundColor: "#030303" }}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <AskJbnWrapper />
        <div className="fixed top-4 left-4 z-50 pointer-events-none">
          <span className="text-[10px] font-mono text-white/30">
            v{process.env.NEXT_PUBLIC_APP_VERSION}
          </span>
        </div>
      </body>
    </html>
  );
}
