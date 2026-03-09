import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import TopNav from "@/components/layout/TopNav";
import HydrationGate from "@/components/layout/HydrationGate";
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
  title: "ResumeForge - AI 智能简历优化",
  description: "根据岗位JD精准优化简历，提高AI筛选通过率",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav />
        <HydrationGate>{children}</HydrationGate>
      </body>
    </html>
  );
}
