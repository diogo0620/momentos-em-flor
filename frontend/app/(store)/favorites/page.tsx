"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    ArrowUpRight,
    ChevronRight,
    Flower2,
    Heart,
    Trash2,
} from "lucide-react";

import { useWishlist } from "@/contexts/WishlistContext";

export default function FavoritesPage() {
    const { items, removeFromWishlist } = useWishlist();
    const hasFavorites = items.length > 0;

    return (
        <div className="min-h-[65vh] bg-[#F8F9F5]">
            <section className="border-b border-[#E8EBE4] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                    <nav
                        aria-label="Navegação estrutural"
                        className="mb-7 flex items-center gap-2 text-xs font-medium text-[#8B9484]"
                    >
                        <Link href="/" className="transition-colors hover:text-[#55624A]">
                            Início
                        </Link>
                        <ChevronRight size={13} aria-hidden="true" />
                        <span className="text-[#55624A]">Favoritos</span>
                    </nav>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#55624A]">
                                <Heart size={14} strokeWidth={1.8} />
                                A sua coleção pessoal
                            </div>
                            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#2F3B2A] sm:text-4xl lg:text-[42px]">
                                Os seus favoritos
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#747D6E] sm:text-base sm:leading-7">
                                Guarde as flores de que mais gosta e volte a encontrá-las sempre que precisar de tornar um momento especial.
                            </p>
                        </div>

                        {hasFavorites && (
                            <div className="flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-[#E5E9DF] bg-[#FAFBF8] px-4 py-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EDDF] text-[#55624A]">
                                    <Heart size={18} strokeWidth={1.8} fill="currentColor" />
                                </span>
                                <div>
                                    <p className="text-lg font-semibold leading-5 text-[#2F3B2A]">{items.length}</p>
                                    <p className="mt-1 text-xs text-[#7B8574]">
                                        {items.length === 1 ? "produto guardado" : "produtos guardados"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                {hasFavorites ? (
                    <>
                        <div className="mb-6 flex flex-col gap-3 border-b border-[#E4E8DF] pb-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-[#7B8574]">
                                A sua seleção, pronta para a próxima ocasião.
                            </p>
                            <Link
                                href="/products"
                                className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#55624A] transition-colors hover:text-[#2F3B2A]"
                            >
                                Descobrir mais flores
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="group overflow-hidden rounded-3xl border border-[#E5E7E0] bg-white shadow-[0_3px_16px_rgba(47,59,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-[#D5DCCB] hover:shadow-[0_14px_35px_rgba(47,59,42,0.09)]"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F1F3EC]">
                                        <Link href={`/products/${item.slug}`} className="block h-full" aria-label={`Ver ${item.name}`}>
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Flower2 size={46} strokeWidth={1.1} className="text-[#B6C1A7]" />
                                                </div>
                                            )}
                                        </Link>

                                        <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#55624A] shadow-sm backdrop-blur-sm">
                                            Favorito
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromWishlist(item.id)}
                                            aria-label={`Remover ${item.name} dos favoritos`}
                                            title="Remover dos favoritos"
                                            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#55624A] shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-red-100 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55624A] focus-visible:ring-offset-2"
                                        >
                                            <Heart size={18} strokeWidth={1.8} fill="currentColor" />
                                        </button>
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <h2 className="line-clamp-2 min-h-7 text-lg font-semibold tracking-[-0.02em] text-[#2F3B2A] transition-colors group-hover:text-[#55624A] sm:text-xl">
                                            {item.name}
                                        </h2>
                                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#EEF0EB] pt-4">
                                            <Link
                                                href={`/products/${item.id}`}
                                                className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#55624A] transition-all hover:gap-3 hover:text-[#2F3B2A]"
                                            >
                                                Ver produto
                                                <ArrowUpRight size={16} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-[#8B9484] transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                                            >
                                                <Trash2 size={14} />
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyFavorites />
                )}
            </section>
        </div>
    );
}

function EmptyFavorites() {
    return (
        <div className="relative isolate overflow-hidden rounded-[28px] border border-[#E5E9DF] bg-white px-5 py-14 text-center shadow-[0_4px_24px_rgba(47,59,42,0.035)] sm:px-10 sm:py-20">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-56 w-56 rounded-full bg-[#F3F5EE]" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-12 -z-10 h-48 w-48 rounded-full bg-[#F7F8F4]" />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#E5E9DF] bg-[#F3F5EE] text-[#55624A]">
                <Heart size={32} strokeWidth={1.35} />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#7D8972]">
                Um espaço à sua medida
            </p>
            <h2 className="mx-auto mt-3 max-w-lg text-2xl font-semibold tracking-[-0.035em] text-[#2F3B2A] sm:text-3xl">
                Ainda não guardou os seus favoritos
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7B8574] sm:text-base sm:leading-7">
                Explore a coleção e toque no coração dos bouquets de que mais gosta. Ficam guardados aqui para voltar a eles quando quiser.
            </p>
            <Link
                href="/products"
                className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#46523D] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55624A] focus-visible:ring-offset-2"
            >
                Explorar flores
                <ArrowRight size={17} />
            </Link>
        </div>
    );
}
