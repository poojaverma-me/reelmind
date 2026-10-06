"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Play, Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATALOG, MOVIES_BY_ID } from "@/lib/catalog";
import { runtime } from "@/lib/format";
import type { Movie, Profile, RecResult } from "@/lib/types";
import MovieCard from "./MovieCard";
import { Backdrop } from "./Poster";
import Row from "./Row";

type Props = {
  profile: Profile;
  result?: RecResult;
  loading: boolean;
  onOpen: (id: string) => void;
  onWatch: (id: string) => void;
  onLab: () => void;
};


function progressFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return 0.18 + (h % 70) / 100;
}

export default function Home({ profile, result, loading, onOpen, onWatch, onLab }: Props) {
  if (!result) return <HomeSkeleton name={profile.name} />;
  return <HomeLoaded profile={profile} result={result} loading={loading} onOpen={onOpen} onWatch={onWatch} onLab={onLab} />;
}

function HomeLoaded({ profile, result, loading, onOpen, onWatch, onLab }: Props & { result: RecResult }) {
  const watched = useMemo(() => new Set(profile.history), [profile.history]);
  const picks = result.picks.map((p) => ({ ...p, movie: MOVIES_BY_ID[p.id] }));
  const matchById = Object.fromEntries(result.picks.map((p) => [p.id, p.match]));
  const rank = new Map(result.ranking.map((r, i) => [r.id, i]));
  const name = profile.id === "new" ? "you" : profile.name;
  const unwatched = CATALOG.filter((mv) => !watched.has(mv.id));

  // Every row below the Jev rows skips titles already on screen, so nothing repeats.
  const shown = new Set<string>([...result.picks.map((p) => p.id), ...result.anchors.flatMap((a) => a.ranking.map((r) => r.id))]);
  const byJev = (a: Movie, b: Movie) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99) || (b.rating ?? 0) - (a.rating ?? 0);
  const take = (list: Movie[], n = 14) => {
    const out = list.filter((mv) => !shown.has(mv.id)).slice(0, n);
    out.forEach((mv) => shown.add(mv.id));
    return out;
  };
  const netflix = take(unwatched.filter((mv) => mv.studio === "Netflix").sort(byJev));
  const likesHeroes = result.profile.genres.slice(0, 3).some((g) => g.name === "Superhero");
  const universe = likesHeroes
    ? take(unwatched.filter((mv) => mv.genres.includes("Superhero")).sort(byJev))
    : take(unwatched.filter((mv) => (mv.rating ?? 0) >= 8.2).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)));
  const outside = take(
    unwatched.filter((mv) => !mv.genres.some((g) => result.filters.genres.includes(g))).sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)),
  );
  const cont = profile.history.slice(0, 8).map((id) => MOVIES_BY_ID[id]);

  return (
    <div className={loading ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"}>
      <Hero picks={picks.slice(0, 4)} name={name} onOpen={onOpen} onWatch={onWatch} onLab={onLab} />

      <Row eyebrow={<span className="text-gradient">Ranked by Jev</span>} title={`Top 10 for ${name} tonight`}>
        {picks.map((p, i) => (
          <div key={p.id} className="flex shrink-0 snap-start items-end">
            <span className="rank-numeral -mr-5 select-none text-[9.5rem] sm:text-[11rem]">{i + 1}</span>
            <MovieCard movie={p.movie} match={p.match} onOpen={onOpen} />
          </div>
        ))}
      </Row>

      {result.anchors.map((a) =>
        a.ranking.length ? (
          <Row key={a.id} eyebrow="Because you watched" title={<span className="font-display text-[1.8rem] font-normal italic">{a.title}</span>}>
            {a.ranking.map((r) => (
              <MovieCard key={r.id} movie={MOVIES_BY_ID[r.id]} onOpen={onOpen} />
            ))}
          </Row>
        ) : null,
      )}

      <Row eyebrow="Pick up where you left off" title="Continue watching">
        {cont.map((mv) => (
          <MovieCard key={mv.id} movie={mv} progress={progressFor(mv.id)} onOpen={onOpen} />
        ))}
      </Row>

      {netflix.length > 2 && (
        <Row eyebrow="Netflix originals" title={`Only on ReelMind, picked for ${name}`}>
          {netflix.map((mv) => (
            <MovieCard key={mv.id} movie={mv} match={matchById[mv.id]} onOpen={onOpen} />
          ))}
        </Row>
      )}

      {universe.length > 2 && (
        <Row eyebrow={likesHeroes ? "Marvel · DC · beyond" : "Critically acclaimed"} title={likesHeroes ? "More from the multiverse" : "Rated 8.2 and up"}>
          {universe.map((mv) => (
            <MovieCard key={mv.id} movie={mv} match={matchById[mv.id]} onOpen={onOpen} />
          ))}
        </Row>
      )}

      {outside.length > 0 && (
        <Row eyebrow="Filtered out at the genre stage, but highly rated" title="Outside your comfort zone">
          {outside.map((mv) => (
            <MovieCard key={mv.id} movie={mv} onOpen={onOpen} />
          ))}
        </Row>
      )}
    </div>
  );
}

function Hero({
  picks,
  name,
  onOpen,
  onWatch,
  onLab,
}: {
  picks: (RecResult["picks"][number] & { movie: Movie })[];
  name: string;
  onOpen: (id: string) => void;
  onWatch: (id: string) => void;
  onLab: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = picks.length;
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [paused, count]);
  const pick = picks[idx % Math.max(1, count)];
  if (!pick) return null;
  const mv = pick.movie;

  return (
    <section
      className="relative -mt-16 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={mv.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.02 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Backdrop movie={mv} className="absolute inset-0 h-full w-full" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-bg/10" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative mx-auto grid min-h-[min(84vh,780px)] max-w-[1440px] items-center gap-10 px-4 pb-16 pt-28 sm:px-8 lg:grid-cols-[1fr_auto] lg:pr-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={mv.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="glass-light mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
              <Sparkles size={13} className="text-amber" />
              Jev&apos;s #{idx + 1} pick for {name}
              <span className="text-ink-3">·</span>
              <span className="text-mint">{pick.match}% match</span>
            </div>
            <h1 className="font-display text-[clamp(3rem,7vw,6.2rem)] leading-[0.92] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              {mv.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
              <span className="flex items-center gap-1 text-amber">
                <Star size={14} fill="currentColor" strokeWidth={0} /> {mv.rating?.toFixed(1)}
              </span>
              <span>{mv.year}</span>
              <span>{runtime(mv.runtime)}</span>
              <span className="rounded border border-white/25 px-1.5 text-[11px] uppercase tracking-wide">{mv.language}</span>
              <span>{mv.genres.join(" · ")}</span>
            </div>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-2">{mv.synopsis}</p>
            {pick.because && (
              <p className="mt-3 text-sm text-ink-3">
                Because you watched <span className="font-medium text-ink">{pick.because.title}</span>
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onWatch(mv.id)}
                className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[15px] font-semibold text-bg transition hover:scale-[1.03] active:scale-95"
              >
                <Play size={17} fill="currentColor" /> Watch now
              </button>
              <button
                onClick={() => onOpen(mv.id)}
                className="glass-light flex items-center gap-2 rounded-full px-5 py-3 text-[15px] font-medium transition hover:bg-white/15"
              >
                <Info size={17} /> Details
              </button>
              <button onClick={onLab} className="flex items-center gap-2 rounded-full px-4 py-3 text-[15px] font-medium text-ink-2 transition hover:text-ink">
                Why this pick? →
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="hidden self-end lg:block">
          <div className="glass rounded-2xl px-5 py-4 text-left shadow-2xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Jev · P(next watch)</div>
            <div className="mt-1 font-mono text-3xl font-semibold text-mint">{pick.probability.toFixed(2)}</div>
            <div className="mt-1 text-[12px] text-ink-3">rank #{idx + 1} of the shortlist</div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {picks.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setIdx(i)}
            aria-label={`Show pick ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === idx ? "w-8 bg-ink" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </section>
  );
}

function HomeSkeleton({ name }: { name: string }) {
  return (
    <div>
      <section className="relative -mt-16 overflow-hidden">
        <div className="mx-auto flex min-h-[640px] max-w-[1440px] flex-col justify-center px-4 pt-28 sm:px-8">
          <div className="glass-light mb-6 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs">
            <span className="h-3 w-3 rounded-full border-2 border-amber border-t-transparent spin" />
            Jev is reading {name}&apos;s watch history…
          </div>
          <div className="shimmer h-24 w-[min(640px,90%)] rounded-2xl" />
          <div className="shimmer mt-6 h-5 w-80 rounded-full" />
          <div className="shimmer mt-3 h-5 w-[min(520px,80%)] rounded-full" />
          <div className="mt-8 flex gap-3">
            <div className="shimmer h-12 w-40 rounded-full" />
            <div className="shimmer h-12 w-32 rounded-full" />
          </div>
        </div>
      </section>
      <div className="mx-auto mt-6 flex max-w-[1440px] gap-4 overflow-hidden px-4 sm:px-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="shimmer aspect-[2/3] w-[184px] shrink-0 rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
