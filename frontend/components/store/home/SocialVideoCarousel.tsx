"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Play, Film } from "lucide-react";

type Video = { kind: "video" | "iframe"; src: string };

function Reel({
  video,
  active,
  index,
  select,
}: {
  video: Video;
  active: boolean;
  index: number;
  select: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (active && visible && !motion.matches && !document.hidden) {
        void element.play().catch(() => undefined);
      } else element.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [active]);

  return (
    <div
      className={
        "relative aspect-[9/16] overflow-hidden rounded-2xl border bg-[#324c3d] transition-colors " +
        (active ? "border-[#ddd4bd]" : "border-white/15")
      }
    >
      {failed ? (
        <div
          role="status"
          className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-sm text-white"
        >
          <Film size={28} strokeWidth={1} />
          <p>Este vídeo não está disponível neste momento.</p>
        </div>
      ) : video.kind === "video" ? (
        <video
          ref={ref}
          src={video.src}
          muted
          loop
          playsInline
          controls={active}
          preload="metadata"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-center"
          aria-label={`Momento em Flor — vídeo ${index + 1}`}
        />
      ) : active ? (
        <iframe
          src={video.src}
          title={`Momento em Flor — vídeo ${index + 1}`}
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <Film
          size={44}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50"
        />
      )}
      {!active && (
        <button
          type="button"
          onClick={select}
          aria-label={`Ver vídeo ${index + 1}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/15 text-white transition-colors hover:bg-black/25"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/60 bg-black/20 backdrop-blur-sm">
            <Play size={20} fill="currentColor" />
          </span>
          <span className="text-xs font-semibold">Ver momento</span>
        </button>
      )}
      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-white backdrop-blur-sm">
        {String(index + 1).padStart(2, "0")} / Momentos
      </span>
    </div>
  );
}

export default function SocialVideoCarousel({ videos }: { videos: Video[] }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const manualScroll = useRef(false);
  const selected = Math.min(active, Math.max(0, videos.length - 1));
  const select = (index: number) => {
    const element = track.current;
    if (!element) return;
    const next = Math.max(0, Math.min(index, videos.length - 1));
    const card = element.children[next] as HTMLElement | undefined;
    if (!card) return;
    manualScroll.current = false;
    setActive(next);
    element.scrollTo({
      left: card.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  if (!videos.length) return null;
  return (
    <div
      className="mt-9 sm:mt-12"
      role="region"
      aria-label="Galeria de vídeos Momentos em Flor"
      aria-roledescription="carrossel"
    >
      <div
        ref={track}
        onPointerDown={() => {
          manualScroll.current = true;
        }}
        onWheel={() => {
          manualScroll.current = true;
        }}
        onScroll={() => {
          const element = track.current;
          if (!element || !manualScroll.current) return;
          let nearest = 0;
          let distance = Infinity;
          Array.from(element.children).forEach((child, index) => {
            const offset = Math.abs(
              (child as HTMLElement).offsetLeft - element.scrollLeft,
            );
            if (offset < distance) {
              distance = offset;
              nearest = index;
            }
          });
          setActive(
            element.scrollLeft + element.clientWidth >= element.scrollWidth - 4
              ? videos.length - 1
              : nearest,
          );
        }}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-5 [scrollbar-width:thin] sm:gap-5"
      >
        {videos.map((video, index) => (
          <div
            key={video.src}
            className="w-[78%] max-w-[360px] shrink-0 snap-start sm:w-[43%] lg:w-[calc((100%_-_60px)/4)]"
          >
            <Reel
              video={video}
              active={index === selected}
              index={index}
              select={() => select(index)}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/20 pt-5">
        <p className="text-xs text-[#d0d8cc]" aria-live="polite">
          <span className="font-semibold text-white">
            {String(selected + 1).padStart(2, "0")}
          </span>{" "}
          / {String(videos.length).padStart(2, "0")}{" "}
          <span className="ml-3 hidden sm:inline">
            Pequenos detalhes. Grandes sentimentos.
          </span>
        </p>
        {videos.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => select(selected - 1)}
              disabled={selected === 0}
              aria-label="Vídeo anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => select(selected + 1)}
              disabled={selected === videos.length - 1}
              aria-label="Vídeo seguinte"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-30"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
