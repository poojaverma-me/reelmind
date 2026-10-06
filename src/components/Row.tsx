"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

export default function Row({ title, eyebrow, children }: { title: ReactNode; eyebrow?: ReactNode; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="group/row relative mt-10">
      <div className="mx-auto flex max-w-[1440px] items-end justify-between px-4 sm:px-8">
        <div>
          {eyebrow && <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">{eyebrow}</div>}
          <h2 className="text-[1.35rem] font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="hidden gap-1.5 opacity-0 transition group-hover/row:opacity-100 sm:flex">
          <button onClick={() => scroll(-1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 hover:bg-surface-3" aria-label="Scroll left">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 hover:bg-surface-3" aria-label="Scroll right">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        className="no-scrollbar mx-auto flex max-w-[1440px] snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-6 pt-4 sm:scroll-px-8 sm:px-8"
        style={{ perspective: 1000 }}
      >
        {children}
      </div>
    </section>
  );
}
