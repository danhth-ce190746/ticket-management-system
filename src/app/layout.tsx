import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Step 8: Import the provider and navbar added in this step.
// TicketsProvider must wrap the entire app so every page can call useTickets().
// Navbar is placed here so it renders on every route without repetition.
import TicketsProvider from "@/components/TicketsProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated from the default scaffold metadata to reflect the actual app.
export const metadata: Metadata = {
  title: "Ticket Management System",
  description: "Track, manage, and resolve support tickets efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/*
        TicketsProvider wraps everything so the shared tickets state is
        available in any client component anywhere in the tree.
        Navbar sits outside {children} so it always renders at the top
        regardless of which page is active.
      */}
      <body className="min-h-full flex flex-col bg-gray-50">
        <TicketsProvider>
          <Navbar />
          <div className="flex-1">
            {children}
          </div>
        </TicketsProvider>
      </body>
    </html>
  );
}
