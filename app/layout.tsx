import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ChatWidget from "@/components/ui/chat-widget";
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
  title: "Malik Shahzad — Full-Stack Developer & AI Engineer",
  description:
    "Full-stack developer & AI engineer in Karachi, Pakistan. Building RAG chatbots, AI voice agents, and autonomous agents with Next.js, Python, and Neon PostgreSQL.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Floating RAG chatbot — bottom-right on every page */}
        <ChatWidget />
      </body>
    </html>
  );
}
