"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { useEffect } from "react";
import { MOVIES_BY_ID } from "@/lib/catalog";
import type { Profile, RecResult } from "@/lib/types";
import { TasteProfile } from "./Lab";
import { Avatar } from "./Nav";
import { Poster } from "./Poster";

type Props = {
  open: boolean;
  profile: Profile;
  result?: RecResult;
  onClose: () => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onOpen: (id: string) => void;
};

export default function HistoryDrawer({ open, profile, result, onClose, onRemove, onReset, onOpen }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="glass fixed inset-y-0 right-0 z-[56] flex w-full max-w-[460px] flex-col border-y-0! border-r-0! shadow-2xl"
          >
            <div className="flex items-center gap-3 p-6 pb-4">
              <Avatar profile={profile} size={44} />
              <div className="flex-1">
                <div className="text-lg font-semibold">{profile.name}</div>
                <div className="text-[13px] text-ink-3">{profile.tagline}</div>
              </div>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 hover:bg-surface-3" aria-label="Close">
                <X size={17} />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
              {result && (
                <section className="rounded-3xl bg-surface p-5 ring-1 ring-hairline">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="font-display text-2xl italic">Taste DNA</h3>
                    <span className="font-mono text-[11px] text-ink-3">{result.model}</span>
                  </div>
                  <TasteProfile result={result} />
                </section>
              )}

              <div className="mb-3 mt-8 flex items-center justify-between">
                <h3 className="font-semibold">
                  Watch history <span className="text-ink-3">· {profile.history.length}</span>
                </h3>
                <button onClick={onReset} className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
                  <RotateCcw size={13} /> Reset
                </button>
              </div>
              <p className="mb-4 text-[13px] text-ink-3">Remove a title and Jev re-ranks the whole catalog instantly.</p>
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {profile.history.map((id, i) => {
                    const mv = MOVIES_BY_ID[id];
                    return (
                      <motion.li
                        key={id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group flex items-center gap-3 rounded-xl p-1.5 hover:bg-surface"
                      >
                        <button onClick={() => onOpen(id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <Poster movie={mv} showTitle={false} className="aspect-[2/3] w-9 shrink-0 rounded-md" />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{mv.title}</div>
                            <div className="truncate text-[12px] text-ink-3">
                              {mv.language} · {mv.genres.join(", ")} · {mv.year}
                            </div>
                          </div>
                        </button>
                        <span className="font-mono text-[11px] text-ink-3 group-hover:hidden">{i === 0 ? "today" : `${i * 2 + 1}d`}</span>
                        <button
                          onClick={() => onRemove(id)}
                          className="hidden h-7 w-7 place-items-center rounded-full bg-surface-2 text-ink-2 hover:bg-coral hover:text-white group-hover:grid"
                          aria-label={`Remove ${mv.title}`}
                        >
                          <X size={14} />
                        </button>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
