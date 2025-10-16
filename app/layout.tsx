import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Mistral Analytics Chat",
  description: "Ask natural-language questions. Get SQL + charts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={font.variable}>
      <body className="min-h-screen bg-gradient-to-b from-[#050a0f] via-[#0b1220] to-[#0f172a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
