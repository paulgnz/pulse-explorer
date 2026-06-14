"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";

export default function MobileNav({ nav }: { nav: [string, string][] }) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(56);
  const btn = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Anchor the drawer just below the sticky header.
  useEffect(() => {
    if (!open) return;
    const header = btn.current?.closest("header");
    if (header) setTop(header.getBoundingClientRect().bottom);
  }, [open]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={btn}
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-white/80 hover:border-white/30"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-0 z-[85] border-b border-white/10 shadow-2xl animate-slide-in max-h-[80vh] overflow-y-auto"
               style={{ top, background: "rgb(8 13 34 / 0.99)", backdropFilter: "blur(24px)" }}>
            <nav className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1 text-sm">
              {nav.map(([label, href]) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <a key={href} href={href}
                     className={`rounded-lg px-3 py-2.5 ${active ? "bg-accent/15 text-accent" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
                    {label}
                  </a>
                );
              })}
              <a href="https://pulsevm.dev" target="_blank" rel="noopener"
                 className="rounded-lg px-3 py-2.5 text-white/75 hover:bg-white/5 hover:text-white">
                pulsevm.dev ↗
              </a>
              <div className="border-t border-white/10 mt-2 pt-3">
                <AccountMenu />
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
