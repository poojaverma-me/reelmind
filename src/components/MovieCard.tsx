"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import type { Movie } from "@/lib/types";
import { Poster } from "./Poster";

type Props = {
  movie: Movie;
  onOpen: (id: string) => void;
  match?: number;
  progress?: number;
  className?: string;
  size?: "sm" | "md";
};

export default function MovieCard({ movie, onOpen, match, progress, className = "w-[164px] sm:w-[184px]", size = "md" }: Props) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 200, damping: 18 });
  const glare = useTransform([mx, my] as never, ([x, y]: number[]) =>
    `radial-gradient(260px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,.22), transparent 55%)`,
  );

  return (
    <motion.button
      onClick={() => onOpen(movie.id)}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => {
        mx.set(0.5);
        my.set(0.5);
      }}
      whileHover={{ scale: 1.045, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      className={`group relative shrink-0 snap-start text-left ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[14px] shadow-[0_10px_30px_-12px_rgba(0,0,0,.8)] ring-1 ring-white/10">
        <Poster movie={movie} className="h-full w-full" size={size} />
        <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: glare }} />
        {match !== undefined && (
          <div className="glass-light absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-mint">{match}%</div>
        )}
        {progress !== undefined && (
          <div className="absolute inset-x-3 bottom-2.5 h-[3px] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-coral" style={{ width: `${progress * 100}%` }} />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5 px-0.5 text-[11.5px] text-ink-3">
        {movie.rating && (
          <span className="flex items-center gap-0.5 text-amber">
            <Star size={10} fill="currentColor" strokeWidth={0} />
            {movie.rating.toFixed(1)}
          </span>
        )}
        <span className="truncate">{movie.genres.join(" · ")}</span>
      </div>
    </motion.button>
  );
}
