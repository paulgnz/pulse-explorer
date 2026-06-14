import "./globals.css";
import type { Metadata } from "next";
import { CHAIN_NAME } from "@/lib/rpc";

export const metadata: Metadata = {
  title: "Pulse Explorer — XPR Network Pulse Testnet",
  description: "Block explorer for the XPR Network Pulse Testnet (PulseVM).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-line">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 font-bold text-lg">
              <span className="inline-block w-7 h-7 rounded-lg" style={{ background: "linear-gradient(135deg,#4F7CFF,#8B95FF)" }} />
              Pulse Explorer
            </a>
            <span className="text-xs text-white/40">{CHAIN_NAME}</span>
            <form action="/search" className="ml-auto w-full max-w-xs">
              <input name="q" placeholder="account / block / tx…"
                className="w-full bg-panel border border-line rounded-lg px-3 py-1.5 text-sm outline-none focus:border-accent" />
            </form>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-5 py-6">{children}</main>
        <footer className="max-w-5xl mx-auto px-5 py-8 text-xs text-white/30">
          PulseVM · migration rehearsal of XPR Network testnet · not affiliated endpoint
        </footer>
      </body>
    </html>
  );
}
