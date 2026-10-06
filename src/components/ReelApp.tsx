"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MOVIES_BY_ID, PROFILES } from "@/lib/catalog";
import type { Profile, RecResult } from "@/lib/types";
import Nav, { type View } from "./Nav";
import Home from "./Home";
import Browse from "./Browse";
import Lab from "./Lab";
import MovieModal from "./MovieModal";
import HistoryDrawer from "./HistoryDrawer";
import Onboarding from "./Onboarding";
import JevPill from "./JevPill";

const MIN_HISTORY = 3;
const HASH: Record<View, string> = { home: "", browse: "browse", lab: "how-jev-picks" };

export default function ReelApp() {
  const [profiles, setProfiles] = useState<Profile[]>(PROFILES);
  const [activeId, setActiveId] = useState(PROFILES[0].id);
  const [view, setViewState] = useState<View>("home");
  const setView = useCallback((v: View) => {
    setViewState(v);
    window.history.replaceState(null, "", v === "home" ? window.location.pathname : `#${HASH[v]}`);
    window.scrollTo({ top: 0 });
  }, []);
  // Deep links: /#browse and /#how-jev-picks open those pages directly.
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      const v = (Object.keys(HASH) as View[]).find((k) => HASH[k] === h);
      if (v) setViewState(v);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const [results, setResults] = useState<Record<string, RecResult>>({});
  const [failed, setFailed] = useState<Record<string, true>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [latestKey, setLatestKey] = useState<Record<string, string>>({});
  const inflight = useRef<AbortController | null>(null);

  const profile = profiles.find((p) => p.id === activeId)!;
  const historyKey = profile.history.join(",");
  const result = results[historyKey];
  // While re-ranking, keep showing the previous result for this profile so the page doesn't blank out.
  const shown = result ?? results[latestKey[profile.id]];
  const loading = profile.history.length >= MIN_HISTORY && !result && !failed[historyKey];

  useEffect(() => {
    if (profile.history.length < MIN_HISTORY || results[historyKey] || failed[historyKey]) return;
    const profileId = profile.id;
    inflight.current?.abort();
    const ctrl = new AbortController();
    inflight.current = ctrl;
    fetch("/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ history: profile.history }),
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((data: RecResult) => {
        setResults((prev) => ({ ...prev, [historyKey]: data }));
        setLatestKey((prev) => ({ ...prev, [profileId]: historyKey }));
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setFailed((prev) => ({ ...prev, [historyKey]: true }));
      });
    return () => ctrl.abort();
  }, [historyKey, profile.id, profile.history, results, failed]);

  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const setHistory = useCallback(
    (fn: (h: string[]) => string[]) =>
      setProfiles((ps) => ps.map((p) => (p.id === activeId ? { ...p, history: fn(p.history) } : p))),
    [activeId],
  );

  const watch = useCallback(
    (id: string) => {
      setHistory((h) => [id, ...h.filter((x) => x !== id)].slice(0, 25));
      say(`Added “${MOVIES_BY_ID[id].title}” to history — Jev is re-ranking`);
      setSelected(null);
    },
    [setHistory, say],
  );

  const remove = useCallback(
    (id: string) => {
      setHistory((h) => h.filter((x) => x !== id));
      say(`Removed “${MOVIES_BY_ID[id].title}” — Jev is re-ranking`);
    },
    [setHistory, say],
  );

  const reset = useCallback(() => {
    const original = PROFILES.find((p) => p.id === activeId)!;
    setHistory(() => original.history);
    say("History restored");
  }, [activeId, setHistory, say]);

  const switchProfile = useCallback((id: string) => {
    setActiveId(id);
    setView("home");
  }, [setView]);

  const watched = useMemo(() => new Set(profile.history), [profile.history]);
  const needsOnboarding = profile.history.length < MIN_HISTORY;

  return (
    <div className="relative min-h-screen pb-28">
      <Nav
        view={view}
        setView={setView}
        profile={profile}
        profiles={profiles}
        onSwitch={switchProfile}
        onOpenHistory={() => setDrawer(true)}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={`${view}-${profile.id}-${needsOnboarding}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {needsOnboarding && view !== "browse" ? (
            <Onboarding
              profile={profile}
              onDone={(ids) => {
                setHistory(() => ids);
                window.scrollTo({ top: 0 });
                say("Building your taste profile with Jev…");
              }}
            />
          ) : view === "home" ? (
            <Home profile={profile} result={shown} loading={loading} onOpen={setSelected} onWatch={watch} onLab={() => setView("lab")} />
          ) : view === "browse" ? (
            <Browse result={shown} watched={watched} onOpen={setSelected} />
          ) : (
            <Lab
              profile={profile}
              result={shown}
              loading={loading}
              onResult={(data) => {
                setResults((prev) => ({ ...prev, [historyKey]: data }));
                setLatestKey((prev) => ({ ...prev, [profile.id]: historyKey }));
              }}
            />
          )}
        </motion.main>
      </AnimatePresence>

      <JevPill result={shown} loading={loading} visible={!needsOnboarding} onClick={() => setView("lab")} />

      <AnimatePresence>
        {selected && (
          <MovieModal
            key="modal"
            id={selected}
            result={shown}
            watched={watched}
            onWatch={watch}
            onClose={() => setSelected(null)}
            onOpen={setSelected}
          />
        )}
      </AnimatePresence>

      <HistoryDrawer
        open={drawer}
        profile={profile}
        result={shown}
        onClose={() => setDrawer(false)}
        onRemove={remove}
        onReset={reset}
        onOpen={(id) => {
          setDrawer(false);
          setSelected(id);
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="glass fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm text-ink shadow-2xl"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
