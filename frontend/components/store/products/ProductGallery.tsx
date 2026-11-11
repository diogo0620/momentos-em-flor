"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { Flower2 } from "lucide-react";

type Photo = { src: string; label: string };

function PhotoImage({ photo, main = false }: { photo: Photo; main?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!photo.src || failed)
    return (
      <div className="flex h-full items-center justify-center text-[#88937c]">
        <Flower2 size={main ? 56 : 24} strokeWidth={1} />
      </div>
    );
  return (
    <Image
      src={photo.src}
      alt={photo.label}
      fill
      preload={main}
      sizes={main ? "(max-width: 1023px) 100vw, 55vw" : "80px"}
      className="object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductGallery({
  initialImage,
  images,
  name,
  children,
}: {
  initialImage: string;
  images: Photo[];
  name: string;
  children?: ReactNode;
}) {
  const [selected, setSelected] = useState(initialImage);
  const photos = images.filter(
    (photo, index) =>
      photo.src && images.findIndex((item) => item.src === photo.src) === index,
  );
  const photo = photos.find((item) => item.src === selected) ?? {
    src: initialImage,
    label: name,
  };
  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#e8e5da] bg-white sm:aspect-square lg:aspect-[4/5]">
        <PhotoImage key={photo.src} photo={photo} main />
        {children}
      </div>
      {photos.length > 1 && (
        <div
          role="group"
          aria-label="Fotografias do produto"
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
        >
          {photos.map((item) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setSelected(item.src)}
              aria-label={`Ver fotografia: ${item.label}`}
              aria-pressed={photo.src === item.src}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition-colors sm:w-20 ${photo.src === item.src ? "border-[#40513c]" : "border-transparent hover:border-[#b3bdab]"}`}
            >
              <PhotoImage photo={item} />
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-[#707766]">
        Imagem ilustrativa. A composição final pode apresentar variações.
      </p>
    </div>
  );
}
