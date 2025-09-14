import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/utils/SessionProvider";
import { Work_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const workSans = Work_Sans({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "UXMust",
  description: "Ensure User-Friendly Experiences",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${workSans.className} antialiased`} suppressHydrationWarning>
        <SessionProvider>
          {children}
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
