
"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    Heart,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import { useWishlist } from "@/contexts/WishlistContext";

export default function FavoritesPage() {
    const {
        items,
        removeFromWishlist,
    } = useWishlist();

    return (
        <main className="min-h-screen bg-white">
            {/* HERO / HEADER */}

            <section className="bg-[#F1F4EB]">
                <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#55624A]">
                                Os meus favoritos
                            </p>

                            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#263020] sm:text-5xl">
                                Flores que adora
                            </h1>

                            <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
                                Guarde aqui os bouquets e flores que mais
                                gostou para os encontrar facilmente mais tarde.
                            </p>
                        </div>

                        {items.length > 0 && (
                            <div
                                className="
                                    inline-flex
                                    w-fit
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-white
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-[#55624A]
                                    shadow-sm
                                "
                            >
                                <Heart
                                    size={16}
                                    fill="currentColor"
                                />

                                <span>
                                    {items.length}{" "}
                                    {items.length === 1
                                        ? "favorito"
                                        : "favoritos"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CONTENT */}

            <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
                {items.length === 0 ? (
                    <EmptyFavorites />
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <article
                                key={item.id}
                                className="
                                    group
                                    overflow-hidden
                                    rounded-3xl
                                    border
                                    border-[#E5E7E0]
                                    bg-white
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-xl
                                "
                            >
                                {/* IMAGE */}

                                <div className="relative aspect-[4/3] overflow-hidden bg-[#FAFAF7]">
                                    <Link
                                        href={`/products/${item.id}`}
                                        className="block h-full"
                                    >
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                unoptimized
                                                className="
                                                    object-cover
                                                    transition-transform
                                                    duration-500
                                                    group-hover:scale-105
                                                "
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Heart
                                                    size={48}
                                                    strokeWidth={1.2}
                                                    className="text-[#D6DEC8]"
                                                />
                                            </div>
                                        )}
                                    </Link>

                                    {/* REMOVE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromWishlist(item.id)
                                        }
                                        aria-label={`Remover ${item.name} dos favoritos`}
                                        className="
                                            absolute
                                            right-4
                                            top-4
                                            z-10
                                            flex
                                            h-10
                                            w-10
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-white
                                            text-[#55624A]
                                            shadow-md
                                            transition-all
                                            duration-300
                                            hover:scale-105
                                            hover:bg-red-50
                                            hover:text-red-500
                                        "
                                    >
                                        <Heart
                                            size={19}
                                            strokeWidth={1.8}
                                            fill="currentColor"
                                        />
                                    </button>
                                </div>

                                {/* INFO */}

                                <div className="p-6">
                                    <h2
                                        className="
                                            text-xl
                                            font-semibold
                                            text-[#2F3B2A]
                                        "
                                    >
                                        {item.name}
                                    </h2>

                                    <div className="mt-6 flex items-center justify-between gap-4">
                                        <Link
                                            href={`/products/${item.id}`}
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                text-sm
                                                font-medium
                                                text-[#55624A]
                                                transition
                                                hover:gap-3
                                            "
                                        >
                                            Ver produto
                                            <ArrowRight size={16} />
                                        </Link>

                                        <Link
                                            href={`/products/${item.id}`}
                                            className="
                                                inline-flex
                                                h-10
                                                items-center
                                                gap-2
                                                rounded-full
                                                bg-[#55624A]
                                                px-4
                                                text-sm
                                                font-medium
                                                text-white
                                                transition-all
                                                duration-300
                                                hover:bg-[#46523D]
                                                hover:shadow-md
                                            "
                                        >
                                            <ShoppingBag size={16} />
                                            Comprar
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function EmptyFavorites() {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div
                className="
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F3F5EE]
                    text-[#55624A]
                "
            >
                <Heart
                    size={34}
                    strokeWidth={1.4}
                />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-[#2F3B2A]">
                Ainda não tem favoritos
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                Explore os nossos bouquets e guarde os seus favoritos
                para os encontrar facilmente mais tarde.
            </p>

            <Link
                href="/products"
                className="
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#55624A]
                    px-6
                    py-3
                    text-sm
                    font-medium
                    text-white
                    transition-all
                    duration-300
                    hover:bg-[#46523D]
                    hover:shadow-md
                "
            >
                Explorar flores
                <ArrowRight size={17} />
            </Link>
        </div>
    );
}

