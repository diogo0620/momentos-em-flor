"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type Video = { kind: "video" | "iframe"; src: string };

export default function SocialVideoCarousel({ videos }: { videos: Video[] }) {
    const [active, setActive] = useState(0);
    const activeVideo = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        const element = activeVideo.current;
        if (!element) return;
        element.currentTime = 0;
        void element.play().catch(() => undefined);
    }, [active]);
    if (videos.length === 0) return null;
    const select = (index: number) => setActive((index + videos.length) % videos.length);
    const current = videos[active];
    return <div className="mt-10 grid gap-5 sm:mt-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#172015] shadow-[0_28px_70px_rgba(35,48,31,.24)]">
            <div className="aspect-[4/5] max-h-[720px] sm:aspect-[16/10]">
                {current.kind === "video" ? <video ref={activeVideo} key={current.src} src={current.src} autoPlay muted loop playsInline controls className="h-full w-full object-cover" aria-label={`Vídeo Momentos em Flor ${active + 1}`} /> : <iframe src={current.src} title={`Vídeo Momentos em Flor ${active + 1}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full border-0" />}
            </div>
            {videos.length > 1 && <div className="absolute bottom-4 right-4 flex gap-2">
                <button type="button" aria-label="Vídeo anterior" onClick={() => select(active - 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#35412F] backdrop-blur"><ChevronLeft /></button>
                <button type="button" aria-label="Vídeo seguinte" onClick={() => select(active + 1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#35412F] backdrop-blur"><ChevronRight /></button>
            </div>}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {videos.map((video, index) => <button key={video.src} type="button" onClick={() => select(index)} aria-label={`Abrir vídeo ${index + 1}`} aria-current={index === active} className={`group relative min-h-36 overflow-hidden rounded-2xl border-2 bg-[#DDE4D5] text-left transition ${index === active ? "border-[#55624A] shadow-lg" : "border-transparent opacity-80 hover:opacity-100"}`}>
                {video.kind === "video" && <video src={video.src} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />}
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-white"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#35412F]"><Play size={12} fill="currentColor" /></span> Momento {index + 1}</span>
            </button>)}
        </div>
    </div>;
}
