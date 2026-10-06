"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ms, usd } from "@/lib/format";
import type { RecResult } from "@/lib/types";

export default function JevPill({ result, loading, visible, onClick }: { result?: RecResult; loading: boolean; visible: boolean; onClick: () => void }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={onClick}
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="glass fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full py-2 pl-2 pr-5 text-[13px] shadow-[0_20px_60px_-15px_rgba(0,0,0,.8)] transition hover:bg-white/10"
        >
          <span className={`grid h-8 w-8 place-items-center rounded-full ${result?.source === "fallback" ? "bg-amber/20 text-amber" : "bg-mint/15 text-mint"}`}>
            {loading ? <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent spin" /> : <Zap size={15} fill="currentColor" />}
          </span>
          <AnimatePresence mode="wait">
            <motion.span key={loading ? "l" : (result?.totals.latencyMs ?? 0)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="whitespace-nowrap">
              {loading ? (
                <span className="text-ink-2">Jev is re-ranking the catalog…</span>
              ) : result?.source === "jev" ? (
                <>
                  <span className="font-medium">Ranked by Jev</span>
                  <span className="mx-2 text-ink-3">·</span>
                  <span className="font-mono">{ms(result.totals.latencyMs)}</span>
                  <span className="mx-2 hidden text-ink-3 sm:inline">·</span>
                  <span className="hidden font-mono sm:inline">{result.totals.inputTokens.toLocaleString()} tok</span>
                  <span className="mx-2 text-ink-3">·</span>
                  <span className="font-mono text-mint">{usd(result.totals.costUsd)}</span>
                </>
              ) : result ? (
                <span className="text-amber">Offline heuristic — Jev unreachable</span>
              ) : (
                <span className="text-ink-2">Waiting for Jev…</span>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
