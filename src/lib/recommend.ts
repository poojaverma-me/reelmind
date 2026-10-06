import "server-only";
import { CATALOG, MOVIES_BY_ID } from "./catalog";
import { GENRES, LANGUAGES, type GenreProb, type Movie, type RecResult, type Stage } from "./types";
import { askJev, choice, costUsd, hasJevKey, JEV_MODEL, noul, score, type Question } from "./jev";

const GENRE_HINTS: Record<string, string> = {
  Superhero: "Marvel, DC and other comic-book heroes",
  "Sci-Fi": "Space, future tech, time, AI, big speculative ideas",
  Horror: "Ghosts, curses, monsters, dread and scares (including horror-comedy)",
  Thriller: "Suspense, twists, mysteries and cat-and-mouse tension",
  Crime: "Gangsters, detectives, heists and the underworld",
  Drama: "Character-driven, emotional, true-to-life stories",
  Comedy: "Laughs, banter and feel-good fun",
  Romance: "Love stories and relationships",
  Action: "Fights, chases, spectacle and adrenaline",
  Animation: "Animated films, often family-friendly",
  Fantasy: "Myth, magic and folklore worlds",
};

const MOOD_LEVELS = ["Light, feel-good and comforting", "Balanced mix of light and serious", "Dark, tense and intense"];
const ERA_LEVELS = ["Mostly classics (before 2000)", "Mostly 2000s and 2010s", "Mostly recent releases (2018 onward)"];

// Assumptions for the brute-force LLM baseline shown in the UI.
const LLM_USD_PER_MTOK_IN = 3;
const LLM_USD_PER_MTOK_OUT = 15;
const LLM_OUTPUT_TOKENS = 700;
const LLM_TTFT_MS = 900;
const LLM_TOKENS_PER_SEC = 75;

const SHORTLIST = 10;
const EXPLAIN = 5;

function historyRow(mv: Movie) {
  return { title: mv.title, year: mv.year, language: mv.language, genres: mv.genres, tone: mv.mood };
}

function candidateLabel(mv: Movie) {
  return `${mv.language} · ${mv.genres.join("/")} · ${mv.year} · ${mv.mood} tone — ${mv.synopsis}`;
}

function sortProbs(probs: Record<string, number>): GenreProb[] {
  return Object.entries(probs)
    .map(([name, p]) => ({ name, p }))
    .sort((a, b) => b.p - a.p);
}

/** Take options from the top until their probabilities cover `mass`. */
function topByMass(probs: GenreProb[], mass: number, max: number) {
  const out: string[] = [];
  let acc = 0;
  for (const g of probs) {
    if (out.length >= max || (acc >= mass && out.length > 0)) break;
    if (g.p < 0.04 && out.length > 0) break;
    out.push(g.name);
    acc += g.p;
  }
  return out;
}

function estimateTokens(value: unknown) {
  return Math.ceil(JSON.stringify(value).length / 3.6);
}

function llmEstimate(history: Movie[]) {
  // A brute-force LLM prompt carries the whole catalog plus history plus instructions, and generates prose.
  const prompt = {
    instructions:
      "You are a movie recommender. Given the user's watch history and our full catalog, return the 10 best titles in ranked order with a short reason for each, as JSON.",
    history: history.map(historyRow),
    catalog: CATALOG.map((mv) => ({ ...historyRow(mv), rating: mv.rating, synopsis: mv.synopsis })),
  };
  const inputTokens = estimateTokens(prompt);
  return {
    inputTokens,
    outputTokens: LLM_OUTPUT_TOKENS,
    costUsd: (inputTokens / 1e6) * LLM_USD_PER_MTOK_IN + (LLM_OUTPUT_TOKENS / 1e6) * LLM_USD_PER_MTOK_OUT,
    latencyMs: Math.round(LLM_TTFT_MS + (LLM_OUTPUT_TOKENS / LLM_TOKENS_PER_SEC) * 1000),
  };
}

type Profile = RecResult["profile"];

function narrow(profile: Profile, watched: Set<string>) {
  const unwatched = CATALOG.filter((mv) => !watched.has(mv.id));
  const relaxed: string[] = [];
  // Genres the viewer clearly enjoys (affinity ≥ 0.5), at most three, always at least one.
  let genres = profile.genres.filter((g) => g.p >= 0.5).slice(0, 3).map((g) => g.name);
  if (!genres.length) genres = [profile.genres[0].name];
  const languages = profile.multilingual > 0.65 ? null : topByMass(profile.languages, 0.85, 3);

  const familySafe = (mv: Movie) => profile.family < 0.6 || mv.mood !== "dark";
  const genreFilter = (g: string[]) => unwatched.filter((mv) => familySafe(mv) && mv.genres.some((x) => g.includes(x)));

  let byGenre = genreFilter(genres);
  let byLanguage = languages ? byGenre.filter((mv) => languages.includes(mv.language)) : byGenre;

  if (byLanguage.length < 8 && languages) {
    // Not enough in the preferred languages — keep the genre, open up the language.
    const extra = byGenre.filter((mv) => !byLanguage.includes(mv));
    byLanguage = [...byLanguage, ...extra];
    relaxed.push("language");
  }
  let idx = genres.length;
  while (byLanguage.length < 8 && idx < profile.genres.length) {
    genres = [...genres, profile.genres[idx].name];
    byGenre = genreFilter(genres);
    byLanguage = byGenre;
    relaxed.push(`+${profile.genres[idx].name}`);
    idx++;
  }

  const gw = Object.fromEntries(profile.genres.map((g) => [g.name, g.p]));
  const lw = Object.fromEntries(profile.languages.map((g) => [g.name, g.p]));
  const prior = (mv: Movie) =>
    mv.genres.reduce((s, g, i) => s + (gw[g] ?? 0) * (i === 0 ? 1 : 0.6), 0) + (lw[mv.language] ?? 0) * 0.8 + (mv.rating ?? 7) / 40;
  const candidates = [...byLanguage].sort((a, b) => prior(b) - prior(a)).slice(0, 30);

  const funnel = [
    { label: "Full catalog", count: CATALOG.length },
    { label: "Not yet watched", count: unwatched.length },
    { label: `Genre · ${genres.join(", ")}`, count: byGenre.length },
    { label: languages ? `Language · ${languages.join(", ")}${relaxed.includes("language") ? " (relaxed)" : ""}` : "Any language", count: byLanguage.length },
    { label: "Sent to Jev for ranking", count: candidates.length },
    { label: "Top picks", count: Math.min(SHORTLIST, candidates.length) },
  ];
  const sets = {
    unwatched: unwatched.map((mv) => mv.id),
    genre: byGenre.map((mv) => mv.id),
    language: byLanguage.map((mv) => mv.id),
    candidates: candidates.map((mv) => mv.id),
  };
  return { candidates, genres, languages, relaxed, funnel, prior, sets };
}

function toMatch(rank: number, p: number, pmax: number) {
  const rel = pmax > 0 ? p / pmax : 0;
  return Math.max(61, Math.min(99, Math.round(98 - rank * 2.4 - (1 - Math.sqrt(rel)) * 14)));
}

export async function recommend(historyIds: string[]): Promise<RecResult> {
  const history = historyIds.map((id) => MOVIES_BY_ID[id]).filter(Boolean);
  if (!hasJevKey()) return heuristic(history, "TYPESAFE_API_KEY is not set");
  try {
    return await recommendWithJev(history);
  } catch (err) {
    return heuristic(history, err instanceof Error ? err.message : String(err));
  }
}

async function recommendWithJev(history: Movie[]): Promise<RecResult> {
  const watched = new Set(history.map((mv) => mv.id));
  const stages: Stage[] = [];

  // ── Stage 1: build a taste profile from the last ~25 titles, all questions in one call (fan-out).
  const profileState = { watch_history_most_recent_first: history.slice(0, 25).map(historyRow) };
  const profileQuestions: Record<string, Question> = {
    // One Noul per genre gives an independent affinity for each, instead of a single winner-takes-all Choice.
    ...Object.fromEntries(
      GENRES.map((g) => [
        `genre_${g}`,
        { type: "noul", instructions: `Judging by their watch history, does this viewer enjoy ${g} films (${GENRE_HINTS[g]})?` } satisfies Question,
      ]),
    ),
    language: {
      type: "choice",
      instructions: "Which language does this viewer most prefer to watch films in?",
      criteria: Object.fromEntries(LANGUAGES.map((l) => [l, null])),
    },
    mood: { type: "score", instructions: "What tone of film does this viewer prefer?", criteria: MOOD_LEVELS },
    era: { type: "score", instructions: "Which release era does this viewer mostly watch?", criteria: ERA_LEVELS },
    multilingual: {
      type: "noul",
      instructions: "Does this viewer regularly watch films in three or more different languages?",
    },
    acclaim: {
      type: "noul",
      instructions: "Does this viewer favour critically acclaimed, festival-calibre films over mainstream crowd-pleasers?",
    },
    family: {
      type: "noul",
      instructions: "Is this viewer's history mostly family-friendly films suitable for young children?",
    },
  };
  const p1 = await askJev(profileState, profileQuestions);
  const affinity: Record<string, number> = Object.fromEntries(GENRES.map((g) => [g, noul(p1.answers[`genre_${g}`])]));
  const l = choice(p1.answers.language);
  const mood = score(p1.answers.mood);
  const era = score(p1.answers.era);
  const profile: Profile = {
    genres: sortProbs(affinity),
    languages: sortProbs(l.probabilities),
    mood: { score: mood.score, probs: Object.values(mood.probabilities), legend: MOOD_LEVELS, confidence: mood.confidence },
    recency: { score: era.score, probs: Object.values(era.probabilities), legend: ERA_LEVELS, confidence: era.confidence },
    multilingual: noul(p1.answers.multilingual),
    acclaim: noul(p1.answers.acclaim),
    family: noul(p1.answers.family),
  };
  stages.push({
    id: "profile",
    title: "Taste profile",
    subtitle: `${history.length} titles → genre affinities, language, tone, era`,
    latencyMs: p1.latencyMs,
    inputTokens: p1.usage.input_tokens,
    outputTokens: p1.usage.output_tokens,
    questions: Object.keys(profileQuestions).length,
  });

  // ── Stage 2: narrow the catalog in code — no model call, no tokens.
  const t2 = performance.now();
  const { candidates, genres, languages, relaxed, funnel, sets } = narrow(profile, watched);
  stages.push({
    id: "filter",
    title: "Hierarchical narrowing",
    subtitle: `${CATALOG.length} → ${candidates.length} candidates, in code`,
    latencyMs: Math.max(1, Math.round(performance.now() - t2)),
    inputTokens: 0,
    outputTokens: 0,
    questions: 0,
  });

  // ── Stage 3: one Choice over the narrowed candidates — the distribution is the ranking.
  const rankState = {
    viewer: {
      genre_affinity: profile.genres.slice(0, 4).map((x) => `${x.name} (${Math.round(x.p * 100)}%)`),
      preferred_languages: profile.languages.slice(0, 3).map((x) => `${x.name} (${Math.round(x.p * 100)}%)`),
      preferred_tone: MOOD_LEVELS[Math.round(mood.score)],
      recently_watched: history.slice(0, 10).map((mv) => `${mv.title} (${mv.language}, ${mv.genres.join("/")})`),
    },
  };
  const rankQuestions: Record<string, Question> = {
    next_watch: {
      type: "choice",
      instructions: "Which one of these films is this viewer most likely to love watching next?",
      criteria: Object.fromEntries(candidates.map((mv) => [mv.title, candidateLabel(mv)])),
    },
  };
  const p3 = await askJev(rankState, rankQuestions);
  const rankAnswer = choice(p3.answers.next_watch);
  const byTitle = Object.fromEntries(candidates.map((mv) => [mv.title, mv]));
  const ranking = sortProbs(rankAnswer.probabilities)
    .filter((r) => byTitle[r.name])
    .map((r) => ({ id: byTitle[r.name].id, p: r.p }));
  stages.push({
    id: "rank",
    title: "Rank the shortlist",
    subtitle: `1 Choice across ${candidates.length} titles`,
    latencyMs: p3.latencyMs,
    inputTokens: p3.usage.input_tokens,
    outputTokens: p3.usage.output_tokens,
    questions: 1,
  });

  // ── Stage 4: "Because you watched…" — one Choice per top pick (which history title it echoes),
  // plus one Choice per anchor title to build distinct rows that skip the top picks. All fanned out in one call.
  const top = ranking.slice(0, EXPLAIN).map((r) => MOVIES_BY_ID[r.id]);
  const recent = history.slice(0, 14);
  const topIds = new Set(ranking.slice(0, SHORTLIST).map((r) => r.id));
  const anchors: Movie[] = [];
  for (const h of history.slice(0, 12)) {
    if (anchors.length >= 2) break;
    if (!anchors.some((a) => a.genres[0] === h.genres[0])) anchors.push(h);
  }
  const anchorPool = CATALOG.filter((mv) => !watched.has(mv.id) && !topIds.has(mv.id));
  const explainQuestions: Record<string, Question> = Object.fromEntries([
    ...top.map((mv, i) => [
      `because_${i}`,
      {
        type: "choice",
        instructions: {
          candidate: { title: mv.title, language: mv.language, genres: mv.genres, synopsis: mv.synopsis },
          question: "Which film from the viewer's history is most similar in spirit to `candidate`?",
        },
        criteria: Object.fromEntries(recent.map((h) => [h.title, `${h.language} · ${h.genres.join("/")}`])),
      } satisfies Question,
    ]),
    ...anchors.map((a, i) => [
      `anchor_${i}`,
      {
        type: "choice",
        instructions: {
          loved: { title: a.title, year: a.year, genres: a.genres },
          question: "Someone just loved `loved`. Which of these films should they watch next?",
        },
        criteria: Object.fromEntries(anchorPool.map((mv) => [mv.title, candidateLabel(mv)])),
      } satisfies Question,
    ]),
  ]);
  const p4 = await askJev({ watch_history: recent.map((h) => h.title) }, explainQuestions);
  const recentByTitle = Object.fromEntries(recent.map((h) => [h.title, h]));
  const poolByTitle = Object.fromEntries(anchorPool.map((mv) => [mv.title, mv]));
  const anchorRows = anchors.map((a, i) => {
    const ans = p4.answers[`anchor_${i}`];
    const ranked = ans && ans.type === "choice" ? sortProbs(ans.probabilities).filter((x) => poolByTitle[x.name]) : [];
    return { id: a.id, title: a.title, ranking: ranked.slice(0, 12).map((x) => ({ id: poolByTitle[x.name].id, p: x.p })) };
  });
  stages.push({
    id: "explain",
    title: "Explain & expand",
    subtitle: `${top.length} “because you watched” + ${anchors.length} anchor rows`,
    latencyMs: p4.latencyMs,
    inputTokens: p4.usage.input_tokens,
    outputTokens: p4.usage.output_tokens,
    questions: Object.keys(explainQuestions).length,
  });

  const pmax = ranking[0]?.p ?? 1;
  const picks = ranking.slice(0, SHORTLIST).map((r, i) => {
    const a = p4.answers[`because_${i}`];
    const because =
      a && a.type === "choice" && recentByTitle[a.choice]
        ? { id: recentByTitle[a.choice].id, title: a.choice, p: a.probabilities[a.choice] ?? 0 }
        : undefined;
    return { id: r.id, probability: r.p, match: toMatch(i, r.p, pmax), because };
  });

  const inputTokens = stages.reduce((s, x) => s + x.inputTokens, 0);
  const outputTokens = stages.reduce((s, x) => s + x.outputTokens, 0);
  return {
    source: "jev",
    model: p1.model,
    profile,
    filters: { genres, languages, relaxed },
    funnel,
    sets,
    anchors: anchorRows,
    picks,
    ranking,
    stages,
    totals: {
      latencyMs: stages.reduce((s, x) => s + x.latencyMs, 0),
      inputTokens,
      outputTokens,
      costUsd: costUsd(inputTokens),
    },
    llmEstimate: llmEstimate(history),
    requests: { "1 · profile": p1.request, "3 · rank": p3.request, "4 · explain": p4.request },
  };
}

/** Offline fallback so the UI still works without a key or network. Counts, doesn't understand. */
function heuristic(history: Movie[], error: string): RecResult {
  const watched = new Set(history.map((mv) => mv.id));
  const tally = (key: (mv: Movie) => string[], options: readonly string[]) => {
    const counts: Record<string, number> = Object.fromEntries(options.map((o) => [o, 0]));
    history.forEach((mv, i) => {
      const w = 1 / (1 + i * 0.05);
      key(mv).forEach((k, j) => (counts[k] = (counts[k] ?? 0) + w * (j === 0 ? 1 : 0.5)));
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return sortProbs(Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v / total])));
  };
  const genres = tally((mv) => mv.genres, GENRES);
  const languages = tally((mv) => [mv.language], LANGUAGES);
  const moodVal = history.reduce((s, mv) => s + (mv.mood === "light" ? 0 : mv.mood === "balanced" ? 1 : 2), 0) / (history.length || 1);
  const eraVal = history.reduce((s, mv) => s + (mv.year < 2000 ? 0 : mv.year < 2018 ? 1 : 2), 0) / (history.length || 1);
  const langCount = new Set(history.map((mv) => mv.language)).size;
  const profile: Profile = {
    genres,
    languages,
    mood: { score: moodVal, probs: [0, 0, 0], legend: MOOD_LEVELS, confidence: 0 },
    recency: { score: eraVal, probs: [0, 0, 0], legend: ERA_LEVELS, confidence: 0 },
    multilingual: langCount >= 3 ? 0.8 : 0.2,
    acclaim: 0.5,
    family: genres[0]?.name === "Animation" ? 0.8 : 0.1,
  };
  const { candidates, genres: g, languages: l, relaxed, funnel, prior, sets } = narrow(profile, watched);
  const scored = candidates.map((mv) => ({ id: mv.id, s: prior(mv) }));
  const total = scored.reduce((a, b) => a + b.s, 0) || 1;
  const ranking = scored.map((x) => ({ id: x.id, p: x.s / total })).sort((a, b) => b.p - a.p);
  const pmax = ranking[0]?.p ?? 1;
  return {
    source: "fallback",
    model: "local heuristic",
    error,
    profile,
    filters: { genres: g, languages: l, relaxed },
    funnel,
    sets,
    anchors: [],
    picks: ranking.slice(0, SHORTLIST).map((r, i) => ({ id: r.id, probability: r.p, match: toMatch(i, r.p, pmax) })),
    ranking,
    stages: [],
    totals: { latencyMs: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 },
    llmEstimate: llmEstimate(history),
    requests: { note: `Jev unavailable (${error}); model would be ${JEV_MODEL}` },
  };
}
