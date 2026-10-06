/* eslint-disable @next/next/no-img-element */
"use client";

import { memo, useState } from "react";
import images from "@/lib/images.json";
import type { Movie } from "@/lib/types";

type Img = { poster?: string | null; backdrop?: string | null };
const IMAGES = images as Record<string, Img>;

export const posterUrl = (id: string) => IMAGES[id]?.poster ?? null;
export const backdropUrl = (id: string) => IMAGES[id]?.backdrop ?? IMAGES[id]?.poster ?? null;

function Fallback({ movie }: { movie: Movie }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-[#2a2238] to-[#120f1b] p-[9%]">
      <div className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/50">{movie.year}</div>
      <div className="font-display text-[1.2rem] leading-tight text-white" style={{ textWrap: "balance" }}>
        {movie.title}
      </div>
    </div>
  );
}

type Props = { movie: Movie; className?: string; size?: "sm" | "md" | "lg"; showTitle?: boolean };

function PosterImpl({ movie, className = "", size = "md" }: Props) {
  const src = posterUrl(movie.id);
  const [failed, setFailed] = useState(false);
  const sized = src && size === "sm" ? src.replace("/w500/", "/w342/") : src;
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {sized && !failed ? (
        <img
          src={sized}
          alt={`${movie.title} poster`}
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Fallback movie={movie} />
      )}
    </div>
  );
}

export const Poster = memo(PosterImpl);

export function Backdrop({ movie, className = "" }: { movie: Movie; className?: string }) {
  const src = backdropUrl(movie.id);
  if (!src) return <div className={`bg-gradient-to-br from-[#2a2238] to-[#0b0911] ${className}`} />;
  return <img src={src} alt="" aria-hidden draggable={false} className={`object-cover ${className}`} />;
}
