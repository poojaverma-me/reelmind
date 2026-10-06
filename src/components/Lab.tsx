"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Cpu, Filter, ListOrdered, MessageSquareQuote } from "lucide-react";
import { useMemo, useState } from "react";
import { CATALOG, MOVIES_BY_ID } from "@/lib/catalog";
import { ms, pct, usd } from "@/lib/format";
import type { Profile, RecResult } from "@/lib/types";
import { Poster } from "./Poster";
import PickTheatre from "./PickTheatre";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Lab({ profile, result, loading, onResult }: { profile: Profile; result?: RecResult; loading: boolean; onResult?: (r: RecResult) => void }) {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-8">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-coral/15 px-2.5 py-1 font-semibold uppercase tracking-[0.14em] text-coral">How Jev picks</span>
        {result && <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-ink-2">{result.model}</span>}
        <span className="rounded-full bg-surface px-2.5 py-1 text-ink-2">{profile.history.length} titles of history</span>
      </div>
      <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.95] tracking-tight" style={{ textWrap: "balance" }}>
        Watch Jev choose tonight&apos;s films for <span className="italic text-gradient">{profile.id === "new" ? "you" : profile.name}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-2">
        Instead of pasting the whole catalog into an LLM and asking it to write a ranked list, ReelMind asks Jev narrow, typed questions, one level
        at a time, and lets plain code do the filtering in between. Every number below is a real probability from Jev.
      </p>
      <div className="mt-10">
        <PickTheatre key={profile.id + profile.history.length} profile={profile} onResult={onResult} />
      </div>
      {result ? <LabDetails profile={profile} result={result} loading={loading} /> : null}
    </div>
  );
}

function LabDetails({ profile, result, loading }: { profile: Profile; result: RecResult; loading: boolean }) {
  const r = result;
  const speedup = r.totals.latencyMs ? r.llmEstimate.latencyMs / r.totals.latencyMs : 0;
  const cheaper = r.totals.costUsd ? r.llmEstimate.costUsd / r.totals.costUsd : 0;
  const calls = r.stages.filter((s) => s.inputTokens > 0).length;
  const questions = r.stages.reduce((s, x) => s + x.questions, 0);

  return (
    <div className={`${loading ? "opacity-60" : ""} mt-16 transition-opacity`}>
      <h2 className="font-display text-4xl tracking-tight">The numbers behind {profile.id === "new" ? "your" : `${profile.name}'s`} picks</h2>
      {r.source === "fallback" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            Jev couldn&apos;t be reached, so this page shows a local counting heuristic instead. <span className="text-ink-3">{r.error}</span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="End-to-end latency" value={ms(r.totals.latencyMs)} note={speedup ? `${speedup.toFixed(0)}× faster than LLM` : undefined} tone="mint" />
        <Kpi label="Cost for this ranking" value={usd(r.totals.costUsd)} note={cheaper ? `${cheaper.toFixed(0)}× cheaper than LLM` : undefined} tone="amber" />
        <Kpi label="Input tokens" value={r.totals.inputTokens.toLocaleString()} note={`${r.totals.outputTokens.toLocaleString()} output (free)`} tone="sky" />
        <Kpi label="Jev calls" value={`${calls}`} note={`${questions} typed questions`} tone="orchid" />
      </div>

      <Pipeline result={r} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Card icon={<Cpu size={16} />} step="1" title="Taste profile" caption="One request, 17 questions asked in parallel against the watch history.">
          <TasteProfile result={r} />
        </Card>
        <Card icon={<Filter size={16} />} step="2" title="Hierarchical narrowing" caption="Genre first, then language — in code, using Jev's probabilities. Zero tokens.">
          <Funnel result={r} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card icon={<ListOrdered size={16} />} step="3" title="One Choice ranks the shortlist" caption="Jev returns a calibrated probability for every candidate — the distribution is the ranking.">
          <Ranking result={r} />
        </Card>
        <Card icon={<MessageSquareQuote size={16} />} step="4" title="Because you watched…" caption="Five more Choices, fanned out in one call, link each pick back to the history.">
          <Because result={r} />
        </Card>
      </div>

      <Versus result={r} />
      <RawRequests result={r} />
    </div>
  );
}

function Kpi({ label, value, note, tone }: { label: string; value: string; note?: string; tone: "mint" | "amber" | "sky" | "orchid" }) {
  const color = { mint: "text-mint", amber: "text-amber", sky: "text-sky", orchid: "text-orchid" }[tone];
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="rounded-3xl bg-surface p-5 ring-1 ring-hairline">
      <div className="text-[12px] font-medium text-ink-3">{label}</div>
      <div className="mt-2 font-mono text-[1.9rem] font-semibold tracking-tight">{value}</div>
      {note && <div className={`mt-1 text-[13px] font-medium ${color}`}>{note}</div>}
    </motion.div>
  );
}

function Card({ icon, step, title, caption, children }: { icon: React.ReactNode; step: string; title: string; caption: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-surface p-6 ring-1 ring-hairline">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-ink-2">{icon}</span>
        Stage {step}
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-ink-3">{caption}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Pipeline({ result }: { result: RecResult }) {
  const max = Math.max(...result.stages.map((s) => s.latencyMs), 1);
  const colors = ["var(--coral)", "var(--text-3)", "var(--amber)", "var(--orchid)"];
  return (
    <div className="mt-10 grid gap-3 md:grid-cols-4">
      {result.stages.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 * i, duration: 0.5, ease }}
          className="relative rounded-3xl bg-surface p-5 ring-1 ring-hairline"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-ink-3">0{i + 1}</span>
            <span className="font-mono text-sm font-semibold">{ms(s.latencyMs)}</span>
          </div>
          <div className="mt-3 font-semibold">{s.title}</div>
          <div className="mt-0.5 text-[13px] text-ink-3">{s.subtitle}</div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(3, (s.latencyMs / max) * 100)}%` }}
              transition={{ delay: 0.3 + 0.12 * i, duration: 0.8, ease }}
              className="h-full rounded-full"
              style={{ background: colors[i] }}
            />
          </div>
          <div className="mt-2 text-[12px] text-ink-3">{s.inputTokens ? `${s.inputTokens.toLocaleString()} tokens · ${s.questions} question${s.questions > 1 ? "s" : ""}` : "Plain code · no model call"}</div>
          {i < result.stages.length - 1 && (
            <ArrowRight size={16} className="absolute -right-[13px] top-1/2 z-10 hidden -translate-y-1/2 text-ink-3 md:block" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function Bars({ items, color, limit = 5 }: { items: { name: string; p: number }[]; color: string; limit?: number }) {
  return (
    <div className="space-y-2.5">
      {items.slice(0, limit).map((g, i) => (
        <div key={g.name} className="grid grid-cols-[92px_1fr_48px] items-center gap-3 text-sm">
          <span className={i === 0 ? "font-medium" : "text-ink-2"}>{g.name}</span>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(1, g.p * 100)}%` }}
              transition={{ duration: 0.9, ease, delay: i * 0.05 }}
              className="h-full rounded-full"
              style={{ background: color, opacity: i === 0 ? 1 : 0.55 }}
            />
          </div>
          <span className="text-right font-mono text-xs text-ink-2">{pct(g.p)}</span>
        </div>
      ))}
    </div>
  );
}

function Gauge({ label, value, legend }: { label: string; value: number; legend: string[] }) {
  const pos = (value / (legend.length - 1)) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-ink-2">{label}</span>
        <span className="font-mono text-xs text-ink-3">score {value.toFixed(2)}</span>
      </div>
      <div className="relative mt-2.5 h-2 rounded-full bg-gradient-to-r from-mint/70 via-amber/70 to-coral/80">
        <motion.div
          initial={{ left: "50%" }}
          animate={{ left: `${pos}%` }}
          transition={{ duration: 1, ease }}
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-ink shadow"
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-ink-3">
        <span>{legend[0].split(",")[0].replace("Mostly ", "")}</span>
        <span>{legend[legend.length - 1].split(",")[0].replace("Mostly ", "")}</span>
      </div>
    </div>
  );
}

function Ring({ label, value, color }: { label: string; value: number; color: string }) {
  const c = 2 * Math.PI * 22;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <svg width="64" height="64" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,.07)" strokeWidth="5" fill="none" />
        <motion.circle
          cx="28"
          cy="28"
          r="22"
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 1, ease }}
        />
      </svg>
      <div className="-mt-[52px] mb-5 font-mono text-[13px] font-semibold">{value.toFixed(2)}</div>
      <div className="text-[12px] leading-tight text-ink-3">{label}</div>
    </div>
  );
}

export function TasteProfile({ result }: { result: RecResult }) {
  const p = result.profile;
  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Genre affinity · Noul × 11</div>
        <Bars items={p.genres} color="linear-gradient(90deg, var(--coral), var(--amber))" />
      </div>
      <div>
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Language · Choice</div>
        <Bars items={p.languages} color="linear-gradient(90deg, var(--orchid), var(--sky))" limit={3} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Gauge label="Tone · Score" value={p.mood.score} legend={p.mood.legend} />
        <Gauge label="Era · Score" value={p.recency.score} legend={p.recency.legend} />
      </div>
      <div>
        <div className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-3">Yes / no · Noul</div>
        <div className="grid grid-cols-3 gap-2">
          <Ring label="Watches 3+ languages" value={p.multilingual} color="var(--sky)" />
          <Ring label="Seeks acclaim" value={p.acclaim} color="var(--amber)" />
          <Ring label="Family-friendly" value={p.family} color="var(--mint)" />
        </div>
      </div>
    </div>
  );
}

function Funnel({ result }: { result: RecResult }) {
  const max = result.funnel[0]?.count || 1;
  return (
    <div className="space-y-3">
      {result.funnel.map((f, i) => (
        <div key={f.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className={i === result.funnel.length - 1 ? "font-medium text-ink" : "text-ink-2"}>{f.label}</span>
            <span className="font-mono text-ink">{f.count}</span>
          </div>
          <div className="flex justify-center">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: `${Math.max(6, (f.count / max) * 100)}%` }}
              transition={{ duration: 1, delay: 0.15 * i, ease }}
              className="h-9 rounded-xl"
              style={{
                background: `linear-gradient(90deg, hsl(${12 + i * 14} 95% ${62 - i * 3}% / ${0.9 - i * 0.1}), hsl(${30 + i * 18} 95% 60% / ${0.75 - i * 0.08}))`,
              }}
            />
          </div>
        </div>
      ))}
      {result.filters.relaxed.length > 0 && (
        <p className="pt-2 text-[13px] text-ink-3">
          Too few titles survived, so the code relaxed: <span className="text-ink-2">{result.filters.relaxed.join(", ")}</span>. That&apos;s a rule you
          own — not a prompt.
        </p>
      )}
      <div className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-[13px] leading-relaxed text-ink-3">
        The candidate list is capped at 30, so the expensive step never sees the whole catalog — whether you stream {CATALOG.length} films or
        40,000.
      </div>
    </div>
  );
}

function Ranking({ result }: { result: RecResult }) {
  const top = result.ranking.slice(0, 10);
  const rest = result.ranking.slice(10).reduce((s, x) => s + x.p, 0);
  const max = top[0]?.p || 1;
  return (
    <div className="space-y-2">
      {top.map((r, i) => {
        const mv = MOVIES_BY_ID[r.id];
        return (
          <div key={r.id} className="grid grid-cols-[22px_34px_1fr_auto] items-center gap-3">
            <span className="text-right font-mono text-xs text-ink-3">{i + 1}</span>
            <Poster movie={mv} showTitle={false} className="aspect-[2/3] w-[34px] rounded-md" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{mv.title}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, (r.p / max) * 100)}%` }}
                  transition={{ duration: 0.9, delay: i * 0.04, ease }}
                  className="h-full rounded-full bg-gradient-to-r from-amber to-coral"
                />
              </div>
            </div>
            <span className="w-14 text-right font-mono text-xs text-ink-2">{r.p.toFixed(3)}</span>
          </div>
        );
      })}
      {result.ranking.length > 10 && (
        <div className="pl-[34px] pt-1 text-[12px] text-ink-3">
          + {result.ranking.length - 10} more candidates sharing p = {rest.toFixed(3)}
        </div>
      )}
    </div>
  );
}

function Because({ result }: { result: RecResult }) {
  const rows = result.picks.filter((p) => p.because);
  if (!rows.length) return <p className="text-sm text-ink-3">Available when Jev is connected.</p>;
  return (
    <div className="space-y-3">
      {rows.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3">
          <Poster movie={MOVIES_BY_ID[p.because!.id]} showTitle={false} className="aspect-[2/3] w-9 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] text-ink-3">{p.because!.title}</div>
            <div className="truncate text-sm font-medium">→ {MOVIES_BY_ID[p.id].title}</div>
          </div>
          <span className="rounded-full bg-orchid/15 px-2 py-0.5 font-mono text-[11px] text-orchid">{p.because!.p.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function Versus({ result }: { result: RecResult }) {
  const [catalog, setCatalog] = useState(CATALOG.length);
  const [daily, setDaily] = useState(1_000_000);
  const est = result.llmEstimate;
  const scaled = useMemo(() => {
    // Catalog dominates the brute-force prompt; history + instructions are ~15%.
    const llmTokens = Math.round(est.inputTokens * (0.15 + (0.85 * catalog) / CATALOG.length));
    const llmCost = (llmTokens / 1e6) * 3 + (est.outputTokens / 1e6) * 15;
    return { llmTokens, llmCost, overflow: llmTokens > 200_000 };
  }, [catalog, est]);
  const jevCost = result.totals.costUsd;
  const lat = [
    { name: "Jev pipeline", v: result.totals.latencyMs, color: "var(--mint)" },
    { name: "LLM (estimate)", v: est.latencyMs, color: "rgba(246,241,233,.25)" },
  ];
  const maxLat = Math.max(...lat.map((l) => l.v), 1);

  return (
    <section className="mt-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 ring-1 ring-hairline sm:p-8">
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Versus</div>
      <h3 className="mt-2 font-display text-4xl tracking-tight">Jev vs. a brute-force LLM prompt</h3>
      <p className="mt-2 max-w-2xl text-sm text-ink-3">
        Baseline: paste the full catalog and history into a frontier LLM (≈$3 / $15 per M input / output tokens, ~75 tok/s) and ask for a
        ranked JSON list with reasons. Jev numbers are measured from this run.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 text-sm font-medium">Time to recommendations</div>
          <div className="space-y-4">
            {lat.map((l) => (
              <div key={l.name}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="text-ink-2">{l.name}</span>
                  <span className="font-mono">{ms(l.v)}</span>
                </div>
                <div className="h-3 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.max(1.5, (l.v / maxLat) * 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease }}
                    className="h-full rounded-full"
                    style={{ background: l.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 text-sm font-medium">What happens at scale</div>
          <Slider label="Catalog size" value={catalog} min={CATALOG.length} max={20000} onChange={setCatalog} format={(v) => `${v.toLocaleString()} titles`} />
          <Slider label="Recommendations per day" value={daily} min={10_000} max={10_000_000} onChange={setDaily} format={(v) => v.toLocaleString()} />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-mint/10 p-4 ring-1 ring-mint/25">
              <div className="text-[12px] text-mint">Jev · per day</div>
              <div className="mt-1 font-mono text-xl font-semibold">{usd(jevCost * daily)}</div>
              <div className="mt-1 text-[12px] text-ink-3">{result.totals.inputTokens.toLocaleString()} tok / rec — flat</div>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-hairline">
              <div className="text-[12px] text-ink-2">LLM · per day</div>
              <div className="mt-1 font-mono text-xl font-semibold">{scaled.overflow ? "—" : usd(scaled.llmCost * daily)}</div>
              <div className={`mt-1 text-[12px] ${scaled.overflow ? "text-coral" : "text-ink-3"}`}>
                {scaled.overflow ? `${scaled.llmTokens.toLocaleString()} tok — exceeds a 200k context` : `${scaled.llmTokens.toLocaleString()} tok / rec`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, onChange, format }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; format: (v: number) => string }) {
  // Logarithmic slider so both ends are usable.
  const toPos = (v: number) => (Math.log(v) - Math.log(min)) / (Math.log(max) - Math.log(min));
  const fromPos = (p: number) => Math.round(Math.exp(Math.log(min) + p * (Math.log(max) - Math.log(min))));
  return (
    <label className="mb-4 block">
      <div className="mb-2 flex justify-between text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className="font-mono">{format(value)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(toPos(value) * 1000)}
        onChange={(e) => onChange(fromPos(Number(e.target.value) / 1000))}
        className="w-full accent-[var(--coral)]"
      />
    </label>
  );
}

function RawRequests({ result }: { result: RecResult }) {
  const keys = Object.keys(result.requests);
  const [tab, setTab] = useState(keys[0]);
  return (
    <section className="mt-6 rounded-[28px] bg-[#07060b] p-6 ring-1 ring-hairline">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-3">Under the hood</div>
          <h3 className="mt-1 text-lg font-semibold">The exact requests sent to POST /v1/systemone</h3>
        </div>
        <div className="flex rounded-[10px] bg-surface p-0.5 text-[12px]">
          {keys.map((k) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 font-mono ${tab === k ? "bg-surface-3 text-ink" : "text-ink-3"}`}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <pre className="no-scrollbar mt-5 max-h-[420px] overflow-auto rounded-2xl bg-white/[0.02] p-5 font-mono text-[12px] leading-relaxed text-ink-2">
        {JSON.stringify(result.requests[tab] ?? result.requests[keys[0]], null, 2)}
      </pre>
    </section>
  );
}
