"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATALOG, MOVIES_BY_ID } from "@/lib/catalog";
import { ms, pct, usd } from "@/lib/format";
import type { Profile, RecResult } from "@/lib/types";
import { Poster } from "./Poster";

const ease = [0.22, 1, 0.36, 1] as const;

/** How long each step stays on stage. Jev itself answers in a few hundred ms — this pacing is for humans. */
const STEP_MS = [5200, 6200, 6800, 6000];
const STEPS = [
  { title: "Read the watch history", q: `noul × 11 · "Does this viewer enjoy {genre} films?" + language, tone, era` },
  { title: "Narrow the catalog", q: "plain code · keep genres covering 75% of probability, then languages covering 85%" },
  { title: "Rank the shortlist", q: `choice · "Which one of these films is this viewer most likely to love watching next?"` },
  { title: "Explain the picks", q: `choice × 5 · "Which film from the history is most similar in spirit to \`candidate\`?"` },
];

type Phase = "idle" | "fetching" | "playing" | "paused" | "done";

export default function PickTheatre({ profile, onResult }: { profile: Profile; onResult?: (r: RecResult) => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<RecResult | null>(null);
  const [wallMs, setWallMs] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Advance through the steps while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    timer.current = setTimeout(() => {
      if (step < STEPS.length - 1) setStep((s) => s + 1);
      else setPhase("done");
    }, STEP_MS[step]);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, step]);

  async function run() {
    setPhase("fetching");
    setStep(0);
    const t = performance.now();
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ history: profile.history }),
    });
    const data: RecResult = await res.json();
    setWallMs(Math.round(performance.now() - t));
    setResult(data);
    onResult?.(data);
    setPhase("playing");
  }

  const stage = result?.stages;
  const stageFor = (i: number) => stage?.[i];

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1c1529] via-[#120f1b] to-[#0b0911] ring-1 ring-hairline">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-orchid/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-coral/15 blur-[120px]" />

      <div className="relative grid gap-0 lg:grid-cols-[320px_1fr]">
        {/* Stepper */}
        <aside className="border-b border-hairline p-6 lg:border-b-0 lg:border-r">
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Live run</div>
          <div className="mt-1 text-lg font-semibold">
            {profile.history.length} titles in, {result ? result.picks.length : 10} picks out
          </div>

          <ol className="mt-6 space-y-2">
            {STEPS.map((s, i) => {
              const active = phase !== "idle" && phase !== "fetching" && i === step;
              const doneStep = result && (i < step || phase === "done");
              const st = stageFor(i);
              return (
                <li key={s.title}>
                  <button
                    disabled={!result}
                    onClick={() => {
                      setStep(i);
                      setPhase("paused");
                    }}
                    className={`relative w-full overflow-hidden rounded-2xl p-3.5 text-left transition ${active ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/5"} disabled:hover:bg-transparent`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${
                          doneStep ? "bg-mint text-bg" : active ? "bg-coral text-white" : "bg-white/10 text-ink-3"
                        }`}
                      >
                        {doneStep ? <Check size={14} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className={`text-[14px] font-medium ${active || doneStep ? "text-ink" : "text-ink-3"}`}>{s.title}</span>
                      {st && (
                        <span className="ml-auto font-mono text-[11px] text-ink-3">{st.inputTokens ? ms(st.latencyMs) : "0 tok"}</span>
                      )}
                    </div>
                    {active && phase === "playing" && (
                      <motion.div
                        key={`bar-${i}-${phase}`}
                        className="absolute bottom-0 left-0 h-[2px] bg-coral"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: STEP_MS[i] / 1000, ease: "linear" }}
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {result && (
            <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.04] p-3 text-center">
              <Stat label="Jev time" value={ms(result.totals.latencyMs)} />
              <Stat label="Round trip" value={ms(wallMs)} />
              <Stat label="Cost" value={usd(result.totals.costUsd)} />
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {phase === "idle" || phase === "fetching" ? (
              <button
                onClick={run}
                disabled={phase === "fetching" || profile.history.length < 3}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral to-amber px-5 py-3 font-semibold text-white shadow-[0_10px_40px_-10px_var(--coral)] transition hover:brightness-110 disabled:opacity-60"
              >
                {phase === "fetching" ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent spin" /> Asking Jev…
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> Watch Jev pick
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setPhase((p) => (p === "playing" ? "paused" : p === "done" ? "done" : "playing"))}
                  disabled={phase === "done"}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/15 disabled:opacity-40"
                  aria-label={phase === "playing" ? "Pause" : "Play"}
                >
                  {phase === "playing" ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => {
                    setStep(STEPS.length - 1);
                    setPhase("done");
                  }}
                  className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                  aria-label="Skip to results"
                >
                  <SkipForward size={16} />
                </button>
                <button onClick={run} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-4 font-medium hover:bg-white/15">
                  <RotateCcw size={15} /> Run again
                </button>
              </>
            )}
          </div>
        </aside>

        {/* Stage */}
        <div className="relative min-h-[600px] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <Intro key="intro" profile={profile} fetching={phase === "fetching"} />
            ) : (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease }}>
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-coral">Step {step + 1}</span>
                  <code className="rounded-full bg-white/5 px-3 py-1 font-mono text-[11.5px] text-ink-2">{STEPS[step].q}</code>
                </div>
                {step === 0 && <StepProfile result={result} profile={profile} />}
                {step === 1 && <StepNarrow result={result} />}
                {step === 2 && <StepRank result={result} />}
                {step === 3 && <StepPicks result={result} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[13px] font-semibold">{value}</div>
      <div className="mt-0.5 text-[10.5px] text-ink-3">{label}</div>
    </div>
  );
}

function Intro({ profile, fetching }: { profile: Profile; fetching: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-[540px] flex-col justify-center">
      <div className="grid grid-cols-6 gap-2 opacity-90 sm:grid-cols-8 lg:grid-cols-11">
        {profile.history.slice(0, 22).map((id, i) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: fetching ? [0.4, 1, 0.4] : 1, y: 0 }}
            transition={fetching ? { duration: 1.2, repeat: Infinity, delay: i * 0.05 } : { delay: i * 0.03, duration: 0.5, ease }}
          >
            <Poster movie={MOVIES_BY_ID[id]} size="sm" className="aspect-[2/3] w-full rounded-lg ring-1 ring-white/10" />
          </motion.div>
        ))}
      </div>
      <h3 className="mt-10 max-w-xl font-display text-[clamp(2rem,4vw,3.2rem)] leading-[1] tracking-tight">
        Press play to watch Jev turn {profile.name === "New viewer" ? "these" : `${profile.name}'s`} {profile.history.length} films into tonight&apos;s picks.
      </h3>
      <p className="mt-3 max-w-lg text-ink-2">
        Three Jev calls, typed questions, calibrated probabilities. We slow the replay down so you can see every decision — the real run takes a few
        hundred milliseconds.
      </p>
    </motion.div>
  );
}

function ProbBar({ label, p, i, color }: { label: string; p: number; i: number; color: string }) {
  return (
    <div className="grid grid-cols-[96px_1fr_44px] items-center gap-3 text-[13px]">
      <span className={i === 0 ? "font-semibold" : "text-ink-2"}>{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0.8, p * 100)}%` }}
          transition={{ delay: 1.1 + i * 0.12, duration: 1, ease }}
          className="h-full rounded-full"
          style={{ background: color, opacity: i === 0 ? 1 : 0.6 }}
        />
      </div>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 + i * 0.12 }} className="text-right font-mono text-[11.5px] text-ink-2">
        {pct(p)}
      </motion.span>
    </div>
  );
}

function StepProfile({ result, profile }: { result: RecResult; profile: Profile }) {
  const p = result.profile;
  const tone = p.mood.legend[Math.round(p.mood.score)];
  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="mb-3 text-[12px] text-ink-3">Jev reads the last {profile.history.length} titles as one structured state</div>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-7">
          {profile.history.map((id, i) => (
            <motion.div key={id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.035, duration: 0.4 }}>
              <Poster movie={MOVIES_BY_ID[id]} size="sm" className="aspect-[2/3] w-full rounded-md ring-1 ring-white/10" />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Genre affinity · one yes/no per genre</div>
          <div className="space-y-2">
            {p.genres.slice(0, 6).map((g, i) => (
              <ProbBar key={g.name} label={g.name} p={g.p} i={i} color="linear-gradient(90deg, var(--coral), var(--amber))" />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Language · choice</div>
          <div className="space-y-2">
            {p.languages.slice(0, 3).map((g, i) => (
              <ProbBar key={g.name} label={g.name} p={g.p} i={i + 6} color="linear-gradient(90deg, var(--orchid), var(--sky))" />
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.6 }} className="flex flex-wrap gap-2 text-[12.5px]">
          <Chip>Tone · {tone} ({p.mood.score.toFixed(2)})</Chip>
          <Chip>Multilingual · {p.multilingual.toFixed(2)}</Chip>
          <Chip>Seeks acclaim · {p.acclaim.toFixed(2)}</Chip>
          <Chip>Family · {p.family.toFixed(2)}</Chip>
        </motion.div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-ink-2 ring-1 ring-white/10">{children}</span>;
}

function StepNarrow({ result }: { result: RecResult }) {
  // Sub-steps: 0 = full catalog, 1 = unwatched, 2 = genre, 3 = language, 4 = candidates.
  const [sub, setSub] = useState(0);
  useEffect(() => {
    const ts = [900, 2000, 3300, 4600].map((t, i) => setTimeout(() => setSub(i + 1), t));
    return () => ts.forEach(clearTimeout);
  }, []);
  const sets = useMemo(
    () => [
      new Set(CATALOG.map((m) => m.id)),
      new Set(result.sets.unwatched),
      new Set(result.sets.genre),
      new Set(result.sets.language),
      new Set(result.sets.candidates),
    ],
    [result],
  );
  const labels = [
    `Full catalog`,
    `Not yet watched`,
    `Genre ∈ ${result.filters.genres.join(", ")}`,
    result.filters.languages ? `Language ∈ ${result.filters.languages.join(", ")}` : "Any language (multilingual viewer)",
    `Shortlist sent to Jev`,
  ];
  const alive = sets[sub];
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {labels.map((l, i) => (
          <motion.span
            key={l}
            animate={{ opacity: i <= sub ? 1 : 0.3 }}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] ring-1 ${i === sub ? "bg-coral/15 text-ink ring-coral/40" : "bg-white/[0.04] text-ink-2 ring-white/10"}`}
          >
            {l}
            <span className="font-mono text-[11px] text-ink-3">{sets[i].size}</span>
          </motion.span>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 xl:grid-cols-[repeat(14,minmax(0,1fr))]">
        {CATALOG.map((mv) => {
          const on = alive.has(mv.id);
          return (
            <motion.div
              key={mv.id}
              animate={{ opacity: on ? 1 : 0.12, scale: on ? 1 : 0.92, filter: on ? "grayscale(0)" : "grayscale(1)" }}
              transition={{ duration: 0.6, ease }}
            >
              <Poster movie={mv} size="sm" className={`aspect-[2/3] w-full rounded-md ${on && sub === 4 ? "ring-2 ring-coral" : "ring-1 ring-white/10"}`} />
            </motion.div>
          );
        })}
      </div>
      <p className="mt-5 text-[13px] text-ink-3">
        No model call here — just your business rules applied to Jev&apos;s probabilities. The expensive ranking step only ever sees{" "}
        <span className="text-ink">{result.sets.candidates.length}</span> of {CATALOG.length} titles.
      </p>
    </div>
  );
}

function StepRank({ result }: { result: RecResult }) {
  const [sorted, setSorted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSorted(true), 2600);
    return () => clearTimeout(t);
  }, []);
  const prob = useMemo(() => new Map(result.ranking.map((r) => [r.id, r.p])), [result]);
  const ids = result.sets.candidates.slice(0, 16);
  const order = sorted ? [...ids].sort((a, b) => (prob.get(b) ?? 0) - (prob.get(a) ?? 0)) : ids;
  const max = Math.max(...ids.map((id) => prob.get(id) ?? 0), 0.0001);
  return (
    <div>
      <div className="mb-4 text-[13px] text-ink-3">
        {sorted ? "Sorted by Jev's probability — the distribution is the ranking." : `One Choice over ${result.sets.candidates.length} candidates. Probabilities arriving…`}
      </div>
      <LayoutGroup>
        <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
          {order.map((id, i) => {
            const mv = MOVIES_BY_ID[id];
            const p = prob.get(id) ?? 0;
            return (
              <motion.div layout key={id} transition={{ type: "spring", stiffness: 140, damping: 22 }} className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-2">
                <span className="w-5 text-right font-mono text-[11px] text-ink-3">{sorted ? i + 1 : ""}</span>
                <Poster movie={mv} size="sm" className="aspect-[2/3] w-9 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{mv.title}</div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(1.5, (p / max) * 100)}%` }}
                      transition={{ delay: 0.4 + (ids.indexOf(id) % 16) * 0.08, duration: 1, ease }}
                      className="h-full rounded-full bg-gradient-to-r from-amber to-coral"
                    />
                  </div>
                </div>
                <span className="w-12 text-right font-mono text-[11.5px] text-ink-2">{p.toFixed(3)}</span>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function StepPicks({ result }: { result: RecResult }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {result.picks.slice(0, 5).map((p, i) => {
          const mv = MOVIES_BY_ID[p.id];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 30, rotateX: 25 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: i * 0.18, duration: 0.7, ease }}>
              <div className="relative">
                <Poster movie={mv} className="aspect-[2/3] w-full rounded-2xl shadow-2xl ring-1 ring-white/15" />
                <span className="glass absolute left-2 top-2 rounded-full px-2 py-0.5 font-display text-lg leading-tight">#{i + 1}</span>
                <span className="glass absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-mint">{p.match}%</span>
              </div>
              <div className="mt-2 truncate text-sm font-medium">{mv.title}</div>
              <div className="font-mono text-[11px] text-ink-3">p = {p.probability.toFixed(3)}</div>
              {p.because && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.18 }} className="mt-2 flex items-center gap-2 rounded-xl bg-white/[0.04] p-1.5">
                  <Poster movie={MOVIES_BY_ID[p.because.id]} size="sm" className="aspect-[2/3] w-6 shrink-0 rounded" />
                  <div className="min-w-0 text-[11px] leading-tight text-ink-3">
                    because you watched <span className="text-ink-2">{p.because.title}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      {result.anchors.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-8 grid gap-4 md:grid-cols-2">
          {result.anchors.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
              <div className="text-[12px] text-ink-3">
                Row: because you watched <span className="text-ink">{a.title}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {a.ranking.slice(0, 6).map((r) => (
                  <div key={r.id} className="w-1/6">
                    <Poster movie={MOVIES_BY_ID[r.id]} size="sm" className="aspect-[2/3] w-full rounded-md" />
                    <div className="mt-1 text-center font-mono text-[10px] text-ink-3">{r.p.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
