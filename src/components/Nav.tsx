"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, History, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/types";

export type View = "home" | "browse" | "lab";

const TABS: { id: View; label: string }[] = [
  { id: "home", label: "For You" },
  { id: "browse", label: "Browse" },
  { id: "lab", label: "How Jev Picks" },
];

export function Avatar({ profile, size = 32 }: { profile: Profile; size?: number }) {
  const h = profile.hue;
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-display text-white shadow-inner"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: `linear-gradient(135deg, hsl(${h} 85% 62%), hsl(${(h + 40) % 360} 75% 45%))`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)",
      }}
    >
      {profile.name[0]}
    </div>
  );
}

type Props = {
  view: View;
  setView: (v: View) => void;
  profile: Profile;
  profiles: Profile[];
  onSwitch: (id: string) => void;
  onOpenHistory: () => void;
};

export default function Nav({ view, setView, profile, profiles, onSwitch, onOpenHistory }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? "glass border-x-0! border-t-0!" : "border-b border-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-8">
        <button onClick={() => setView("home")} className="flex items-baseline gap-1.5">
          <span className="font-display text-[1.7rem] italic leading-none tracking-tight">ReelMind</span>
          <span className="h-1.5 w-1.5 rounded-full bg-coral shadow-[0_0_12px_var(--coral)]" />
        </button>

        <nav className="mx-auto hidden rounded-full bg-surface p-1 sm:flex" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${view === t.id ? "text-bg" : "text-ink-2 hover:text-ink"}`}
            >
              {view === t.id && (
                <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <button
            onClick={() => setView("browse")}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button
            onClick={onOpenHistory}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            aria-label="Watch history"
          >
            <History size={18} />
          </button>
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-surface-2"
            >
              <Avatar profile={profile} />
              <span className="hidden text-sm font-medium md:inline">{profile.name}</span>
              <ChevronDown size={14} className={`text-ink-3 transition ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="glass absolute right-0 top-12 w-72 origin-top-right overflow-hidden rounded-2xl p-1.5 shadow-2xl"
                >
                  <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Who&apos;s watching?</div>
                  {profiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSwitch(p.id);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition hover:bg-surface-2"
                    >
                      <Avatar profile={p} size={36} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="truncate text-xs text-ink-3">
                          {p.history.length ? `${p.history.length} titles · ${p.tagline}` : p.tagline}
                        </div>
                      </div>
                      {p.id === profile.id && <Check size={16} className="text-coral" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <nav className="flex justify-center pb-2 sm:hidden" aria-label="Sections">
        <div className="flex rounded-full bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${view === t.id ? "bg-ink text-bg" : "text-ink-2"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
