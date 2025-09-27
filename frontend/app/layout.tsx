import type { Metadata } from "next";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Header from "./components/layout/Header";

export const metadata: Metadata = {
  title: "Echain - Decentralized Event Ticketing",
  description: "Create, sell, and manage event tickets on the blockchain with NFT technology and POAP integration.",
  keywords: ["blockchain", "NFT", "tickets", "events", "POAP", "Web3"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-200 py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-gray-500">
                  <p>&copy; 2025 Echain. Decentralized Event Ticketing Platform.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
