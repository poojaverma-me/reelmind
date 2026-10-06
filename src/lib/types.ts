export const GENRES = [
  "Superhero",
  "Sci-Fi",
  "Horror",
  "Thriller",
  "Crime",
  "Drama",
  "Comedy",
  "Romance",
  "Action",
  "Animation",
  "Fantasy",
] as const;
export type Genre = (typeof GENRES)[number];

export const LANGUAGES = ["English", "Korean", "Japanese", "Spanish", "French", "German", "Portuguese", "Telugu"] as const;
export type Language = (typeof LANGUAGES)[number];

export type Mood = "light" | "balanced" | "dark";

export type Movie = {
  id: string;
  title: string;
  year: number;
  language: Language;
  genres: Genre[];
  mood: Mood;
  /** Out of 10. */
  rating?: number;
  runtime?: number;
  synopsis?: string;
  studio?: string;
  /** True for titles currently streaming on ReelMind (recommendable). */
  inCatalog: boolean;
};

export type Profile = {
  id: string;
  name: string;
  tagline: string;
  /** Movie ids, most recent first. */
  history: string[];
  hue: number;
};

export type GenreProb = { name: string; p: number };

export type Stage = {
  id: "profile" | "filter" | "rank" | "explain";
  title: string;
  subtitle: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  questions: number;
};

export type Pick = {
  id: string;
  probability: number;
  match: number;
  because?: { id: string; title: string; p: number };
};

export type RecResult = {
  source: "jev" | "fallback";
  model: string;
  error?: string;
  profile: {
    genres: GenreProb[];
    languages: GenreProb[];
    mood: { score: number; probs: number[]; legend: string[]; confidence: number };
    recency: { score: number; probs: number[]; legend: string[]; confidence: number };
    multilingual: number;
    acclaim: number;
    family: number;
  };
  filters: { genres: string[]; languages: string[] | null; relaxed: string[] };
  funnel: { label: string; count: number }[];
  /** Movie ids surviving each narrowing step (for the step-by-step visual). */
  sets: { unwatched: string[]; genre: string[]; language: string[]; candidates: string[] };
  /** "Because you watched X" rows, each its own Jev Choice over titles outside the top picks. */
  anchors: { id: string; title: string; ranking: { id: string; p: number }[] }[];
  picks: Pick[];
  ranking: { id: string; p: number }[];
  stages: Stage[];
  totals: { latencyMs: number; inputTokens: number; outputTokens: number; costUsd: number };
  llmEstimate: { inputTokens: number; outputTokens: number; costUsd: number; latencyMs: number };
  requests: Record<string, unknown>;
};
