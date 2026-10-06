"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { MOVIES_BY_ID } from "@/lib/catalog";
import type { Profile } from "@/lib/types";
import { Poster } from "./Poster";

const STARTERS = [
  "avengers-endgame", "interstellar", "the-dark-knight", "parasite", "spirited-away", "la-la-land", "get-out", "knives-out",
  "mad-max-fury-road", "coco", "barbie", "oppenheimer", "the-batman", "hereditary", "glass-onion", "top-gun-maverick",
  "about-time", "dune-part-two", "whiplash", "spider-verse", "john-wick-4", "eeaao", "the-substance", "klaus",
];

export default function Onboarding({ profile, onDone }: { profile: Profile; onDone: (ids: string[]) => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [id, ...p]));

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-14 sm:px-8">
      <div className="text-center">
        <div className="glass-light mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
          <Sparkles size={13} className="text-amber" /> Welcome, {profile.name}
        </div>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] tracking-tight">
          Pick three films you <span className="italic text-gradient">love.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-ink-2">That&apos;s all Jev needs to sketch your taste — genre, language, tone and era — in a few hundred milliseconds.</p>
      </div>

      <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {STARTERS.map((id, i) => {
          const on = picked.includes(id);
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(id)}
              className={`relative overflow-hidden rounded-2xl transition-shadow ${on ? "ring-[3px] ring-coral shadow-[0_0_40px_-6px_var(--coral)]" : "ring-1 ring-white/10"}`}
            >
              <Poster movie={MOVIES_BY_ID[id]} size="sm" className={`aspect-[2/3] w-full transition duration-300 ${picked.length >= 3 && !on ? "opacity-50" : ""}`} />
              <AnimatePresence>
                {on && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-coral text-white shadow-lg"
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="pointer-events-none sticky bottom-6 mt-10 flex justify-center">
        <motion.button
          disabled={picked.length < 3}
          onClick={() => onDone(picked)}
          animate={{ scale: picked.length >= 3 ? 1 : 0.96 }}
          className="pointer-events-auto glass flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[15px] font-medium shadow-2xl disabled:opacity-80"
        >
          <span className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full transition ${i < picked.length ? "bg-coral" : "bg-white/20"}`} />
            ))}
          </span>
          {picked.length < 3 ? `${3 - picked.length} more to go` : `${picked.length} picked`}
          <span className={`rounded-full px-4 py-2 transition ${picked.length >= 3 ? "bg-ink text-bg" : "bg-white/10 text-ink-3"}`}>Build my profile</span>
        </motion.button>
      </div>
    </div>
  );
}
