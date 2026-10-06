"use client";

import { motion } from "framer-motion";
import { Check, Clock, Globe, Play, Star, X } from "lucide-react";
import { useEffect } from "react";
import { CATALOG, MOVIES_BY_ID } from "@/lib/catalog";
import { runtime } from "@/lib/format";
import type { Movie, RecResult } from "@/lib/types";
import { Backdrop, Poster } from "./Poster";

type Props = {
  id: string;
  result?: RecResult;
  watched: Set<string>;
  onWatch: (id: string) => void;
  onClose: () => void;
  onOpen: (id: string) => void;
};

function verdict(mv: Movie, result: RecResult | undefined, watched: Set<string>) {
  if (watched.has(mv.id)) return { tone: "ink", title: "In your watch history", body: "Jev used this title to build your taste profile." };
  if (!mv.inCatalog) return { tone: "ink", title: "Not streaming right now", body: "From the archive — not recommendable." };
  if (!result) return null;
  const idx = result.ranking.findIndex((r) => r.id === mv.id);
  if (idx >= 0) {
    const pick = result.picks.find((p) => p.id === mv.id);
    return {
      tone: "mint",
      title: `Ranked #${idx + 1} of ${result.ranking.length} candidates`,
      body: `P(next watch) = ${result.ranking[idx].p.toFixed(3)}${pick ? ` · ${pick.match}% match` : ""}${pick?.because ? ` · because you watched ${pick.because.title}` : ""}`,
    };
  }
  const { genres, languages } = result.filters;
  if (!mv.genres.some((g) => genres.includes(g)))
    return { tone: "amber", title: "Filtered out at the genre stage", body: `${mv.genres.join(" / ")} isn't among your top genres (${genres.join(", ")}).` };
  if (languages && !languages.includes(mv.language) && !result.filters.relaxed.includes("language"))
    return { tone: "amber", title: "Filtered out at the language stage", body: `You mostly watch in ${languages.join(", ")}.` };
  if (result.profile.family >= 0.6 && mv.mood === "dark")
    return { tone: "amber", title: "Hidden by the family-safe rule", body: `Jev thinks this is a family profile (p = ${result.profile.family.toFixed(2)}).` };
  return { tone: "amber", title: "Just outside the shortlist", body: "Passed the filters but didn't make the top 30 candidates." };
}

export default function MovieModal({ id, result, watched, onWatch, onClose, onOpen }: Props) {
  const mv = MOVIES_BY_ID[id];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const v = verdict(mv, result, watched);
  const similar = CATALOG.filter((x) => x.id !== mv.id && x.genres[0] === mv.genres[0]).slice(0, 6);
  const toneClass = v?.tone === "mint" ? "bg-mint/10 ring-mint/25 text-mint" : v?.tone === "amber" ? "bg-amber/10 ring-amber/25 text-amber" : "bg-white/5 ring-hairline text-ink";

  return (
    <motion.div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal
        aria-label={mv.title}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden overflow-y-auto rounded-t-[28px] bg-bg-2 shadow-2xl ring-1 ring-hairline sm:rounded-[28px]"
      >
        <div className="absolute inset-x-0 top-0 h-80 overflow-hidden">
          <Backdrop movie={mv} className="h-full w-full opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-2" />
        </div>
        <button onClick={onClose} className="glass-light absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full" aria-label="Close">
          <X size={17} />
        </button>

        <div className="relative grid gap-8 p-6 pt-10 sm:grid-cols-[240px_1fr] sm:p-10">
          <Poster movie={mv} size="lg" className="mx-auto aspect-[2/3] w-[200px] rounded-[20px] shadow-2xl ring-1 ring-white/15 sm:w-full" />
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3">{[mv.studio, ...mv.genres].filter(Boolean).join(" · ")}</div>
            <h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] tracking-tight">{mv.title}</h2>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-2">
              {mv.rating && (
                <span className="flex items-center gap-1 text-amber">
                  <Star size={14} fill="currentColor" strokeWidth={0} /> {mv.rating.toFixed(1)}
                </span>
              )}
              <span>{mv.year}</span>
              {mv.runtime && (
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {runtime(mv.runtime)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe size={14} /> {mv.language}
              </span>
              <span className="capitalize">{mv.mood} tone</span>
            </div>
            {mv.synopsis && <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{mv.synopsis}</p>}

            {v && (
              <div className={`mt-6 rounded-2xl p-4 ring-1 ${toneClass}`}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">Jev&apos;s verdict</div>
                <div className="mt-1 font-semibold">{v.title}</div>
                <div className="mt-0.5 text-sm text-ink-2">{v.body}</div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {mv.inCatalog && !watched.has(mv.id) ? (
                <button
                  onClick={() => onWatch(mv.id)}
                  className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-bg transition hover:scale-[1.03] active:scale-95"
                >
                  <Play size={16} fill="currentColor" /> Watch now
                </button>
              ) : (
                <span className="flex items-center gap-2 rounded-full bg-surface-2 px-5 py-3 text-sm text-ink-2">
                  <Check size={16} /> {watched.has(mv.id) ? "Watched" : "Unavailable"}
                </span>
              )}
            </div>
            {mv.inCatalog && !watched.has(mv.id) && (
              <p className="mt-3 text-[13px] text-ink-3">Watching adds it to your history — Jev re-ranks everything in under a second.</p>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="relative px-6 pb-8 sm:px-10">
            <div className="mb-3 text-sm font-semibold">More {mv.genres[0]}</div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {similar.map((s) => (
                <button key={s.id} onClick={() => onOpen(s.id)} className="w-[110px] shrink-0 text-left transition hover:-translate-y-1">
                  <Poster movie={s} size="sm" className="aspect-[2/3] w-full rounded-xl ring-1 ring-white/10" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
