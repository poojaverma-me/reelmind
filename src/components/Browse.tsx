"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CATALOG } from "@/lib/catalog";
import { GENRES, LANGUAGES, type RecResult } from "@/lib/types";
import MovieCard from "./MovieCard";

type Sort = "match" | "rating" | "year";

export default function Browse({ result, watched, onOpen }: { result?: RecResult; watched: Set<string>; onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [lang, setLang] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>(result ? "match" : "rating");
  const [hideWatched, setHideWatched] = useState(false);

  const rank = useMemo(() => new Map(result?.ranking.map((r, i) => [r.id, i]) ?? []), [result]);
  const match = useMemo(() => Object.fromEntries(result?.picks.map((p) => [p.id, p.match]) ?? []), [result]);
  const languages = LANGUAGES.filter((l) => CATALOG.some((mv) => mv.language === l));

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATALOG.filter(
      (mv) =>
        (!genre || mv.genres.includes(genre as never)) &&
        (!lang || mv.language === lang) &&
        (!hideWatched || !watched.has(mv.id)) &&
        (!needle || `${mv.title} ${mv.synopsis} ${mv.genres.join(" ")} ${mv.language}`.toLowerCase().includes(needle)),
    ).sort((a, b) => {
      if (sort === "year") return b.year - a.year;
      if (sort === "match") return (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999) || (b.rating ?? 0) - (a.rating ?? 0);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [q, genre, lang, sort, hideWatched, watched, rank]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8">
      <h1 className="font-display text-[clamp(2.6rem,5vw,4rem)] leading-none tracking-tight">Browse</h1>
      <p className="mt-2 text-ink-2">{CATALOG.length} films streaming now, across {languages.length} languages.</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="glass-light flex h-11 flex-1 items-center gap-2.5 rounded-xl px-3.5 focus-within:ring-2 focus-within:ring-coral/60">
          <Search size={17} className="text-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Titles, moods, languages…"
            className="h-full flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search">
              <X size={16} className="text-ink-3" />
            </button>
          )}
        </label>
        <div className="flex items-center gap-3">
          <div className="flex rounded-[10px] bg-surface p-0.5 text-[13px]">
            {(["match", "rating", "year"] as Sort[]).map((s) => (
              <button
                key={s}
                disabled={s === "match" && !result}
                onClick={() => setSort(s)}
                className={`rounded-lg px-3 py-1.5 font-medium capitalize transition disabled:opacity-30 ${sort === s ? "bg-surface-3 text-ink shadow" : "text-ink-2"}`}
              >
                {s === "match" ? "Jev match" : s}
              </button>
            ))}
          </div>
          <button role="switch" aria-checked={hideWatched} onClick={() => setHideWatched((v) => !v)} className="flex items-center gap-2 text-[13px] text-ink-2">
            <span
              className={`relative h-[22px] w-[38px] rounded-full transition ${hideWatched ? "bg-mint" : "bg-surface-3"}`}
            >
              <span className={`absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${hideWatched ? "left-[18px]" : "left-[2px]"}`} />
            </span>
            Hide watched
          </button>
        </div>
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        <Chip active={!genre} onClick={() => setGenre(null)}>All genres</Chip>
        {GENRES.map((g) => (
          <Chip key={g} active={genre === g} onClick={() => setGenre(genre === g ? null : g)}>
            {g}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
        <Chip subtle active={!lang} onClick={() => setLang(null)}>Any language</Chip>
        {languages.map((l) => (
          <Chip subtle key={l} active={lang === l} onClick={() => setLang(lang === l ? null : l)}>
            {l}
          </Chip>
        ))}
      </div>

      <motion.div layout className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {list.map((mv) => (
            <motion.div
              key={mv.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <MovieCard movie={mv} match={match[mv.id]} onOpen={onOpen} className="w-full" />
              {watched.has(mv.id) && (
                <span className="glass-light absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Watched</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-24 text-center text-ink-3">Nothing matches — try fewer filters.</p>}
    </div>
  );
}

function Chip({ active, subtle, onClick, children }: { active: boolean; subtle?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
        active ? (subtle ? "bg-orchid/25 text-ink ring-1 ring-orchid/50" : "bg-coral text-white") : "bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
