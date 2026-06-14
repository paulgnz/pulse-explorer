import "./globals.css";
import type { Metadata } from "next";
import { CHAIN_NAME } from "@/lib/rpc";
import Search from "@/components/Search";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "Pulse Explorer — XPR Network Pulse Testnet",
  description: "Block explorer for the XPR Network Pulse Testnet (PulseVM).",
};

const NAV = [
  ["Blocks", "/blocks"], ["Transactions", "/transactions"], ["Accounts", "/accounts"],
  ["Tokens", "/tokens"], ["Producers", "/producers"], ["Oracles", "/oracles"],
  ["Supply", "/supply"], ["Resources", "/resources"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="pulse">
      <body>
        <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
              <Logo size={28} />
              Pulse<span className="text-white/40 font-normal">Explorer</span>
            </a>
            <div className="flex-1 flex justify-center"><Search /></div>
            <a href="https://pulsevm.dev" target="_blank" rel="noopener"
               className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">pulsevm.dev</a>
          </div>
          <nav className="max-w-6xl mx-auto px-5 pb-2 flex gap-1 overflow-x-auto text-sm">
            {NAV.map(([label, href]) => (
              <a key={href} href={href} className="rounded-lg px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white whitespace-nowrap">{label}</a>
            ))}
          </nav>
        </header>
        <main className="max-w-6xl mx-auto px-5 py-6">{children}</main>
        <footer className="border-t border-white/5 mt-10">
          <div className="max-w-6xl mx-auto px-5 py-8 text-xs text-white/40 flex flex-wrap gap-x-8 gap-y-2 justify-between">
            <span>{CHAIN_NAME} · PulseVM · migration rehearsal of XPR Network testnet</span>
            <span className="flex gap-4">
              <a href="https://pulsevm.dev" target="_blank" rel="noopener" className="hover:text-white">pulsevm.dev</a>
              <a href="https://github.com/paulgnz/pulse-explorer" target="_blank" rel="noopener" className="hover:text-white">GitHub</a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
