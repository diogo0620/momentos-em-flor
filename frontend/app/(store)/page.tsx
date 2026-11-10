"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PublicCategoryList } from "@/types/categories/public/public-category-list";
import type { PublicProductList } from "@/types/products/public/public-product-list";
import {
    ArrowRight,
    Heart,
    Camera,
    Sparkles,
} from "lucide-react";
import { publicCategoriesApi } from "@/lib/api/categories/public-categories";
import { publicProductsApi } from "@/lib/api/products/public-products";
import ProductCard from "@/components/store/products/ProductCard";
import SocialVideoCarousel from "@/components/store/home/SocialVideoCarousel";
import { apiFetch } from "@/lib/api/common/client";

const reviews: { quote: string; name: string }[] = [];

function getSocialVideoEmbed(url: string) {
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("instagram.com")) {
            return { kind: "iframe" as const, src: `${url.replace(/\/$/, "")}/embed` };
        }
        if (parsed.hostname.includes("tiktok.com")) {
            const videoId = parsed.pathname.match(/\/video\/(\d+)/)?.[1];
            return videoId ? { kind: "iframe" as const, src: `https://www.tiktok.com/embed/v2/${videoId}` } : null;
        }
        if (parsed.hostname.includes("youtube.com")) {
            const videoId = parsed.searchParams.get("v") || parsed.pathname.match(/\/shorts\/([^/]+)/)?.[1];
            return videoId ? { kind: "iframe" as const, src: `https://www.youtube-nocookie.com/embed/${videoId}` } : null;
        }
        if (parsed.hostname === "youtu.be") {
            const videoId = parsed.pathname.slice(1);
            return videoId ? { kind: "iframe" as const, src: `https://www.youtube-nocookie.com/embed/${videoId}` } : null;
        }
        if (/\.(mp4|webm)$/i.test(parsed.pathname)) {
            return { kind: "video" as const, src: url };
        }
    } catch {
        return null;
    }
    return null;
}

export default function HomePage() {
    const [collections, setCollections] = useState<PublicCategoryList[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<PublicProductList[]>([]);
    const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
    const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
    const [socialVideos, setSocialVideos] = useState<NonNullable<ReturnType<typeof getSocialVideoEmbed>>[]>([]);
    useEffect(() => {
        let cancelled = false;
        void apiFetch<{ data: { url: string }[] }>('/home-videos').then(result => {
            if (!cancelled) setSocialVideos(result.data.slice(0, 4).map(video => ({ kind: 'video', src: video.url })));
        }).catch(() => { /* A indisponibilidade dos vídeos não impede a compra. */ });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadFeaturedContent() {
            const [categoriesResponse, productsResponse] = await Promise.allSettled([
                publicCategoriesApi.getAll({
                    page: 1,
                    pageSize: 4,
                    featured: true,
                }),
                publicProductsApi.getAll({
                    page: 1,
                    pageSize: 4,
                    featured: true,
                }),
            ]);

            if (cancelled) return;

            if (categoriesResponse.status === "fulfilled") {
                setCollections(categoriesResponse.value.items);
            } else {
                console.error(
                    "Não foi possível carregar as categorias em destaque:",
                    categoriesResponse.reason,
                );
            }

            if (productsResponse.status === "fulfilled") {
                setFeaturedProducts(productsResponse.value.items);
            } else {
                console.error(
                    "Não foi possível carregar os produtos em destaque:",
                    productsResponse.reason,
                );
            }

            setIsLoadingFeatured(false);
        }

        void loadFeaturedContent();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="bg-[#F8F9F5] text-[#2F3B2A]">

            {/* HERO */}
            <section className="relative min-h-[580px] overflow-hidden sm:min-h-[700px] lg:min-h-[760px]">
                <img
                    src="/hero.png"
                    alt="Composição floral da Momentos em Flor"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-[#1d261d]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1d261d]/70 via-[#1d261d]/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#1d261d]/35 to-transparent" />

                <div className="relative mx-auto flex min-h-[580px] max-w-[1440px] items-end px-6 pb-14 pt-24 sm:min-h-[700px] sm:px-12 sm:pb-20 lg:min-h-[760px] lg:px-20">
                    <div className="max-w-2xl text-white">
                        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-white/75">
                            <span className="h-px w-8 bg-white/60" />
                            Momentos em Flor
                        </div>

                        <h1 className="mt-6 max-w-2xl text-5xl font-medium leading-[.98] tracking-[-0.045em] min-[420px]:text-6xl sm:text-7xl lg:text-[82px]">
                            Há coisas que se dizem melhor com flores.
                        </h1>

                        <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                            Flores escolhidas para celebrar, agradecer,
                            surpreender ou simplesmente tornar um dia mais bonito.
                        </p>

                        <Link
                            href="/products"
                            className="mt-9 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f8f6f1] px-7 py-3.5 text-sm font-semibold text-[#35412F] transition hover:bg-white hover:shadow-lg"
                        >
                            Explorar flores
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* BRAND INTRO */}
            <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Flores com intenção
                            </p>

                            <h2 className="mt-4 max-w-xl text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">
                                Um gesto simples pode dizer tudo.
                            </h2>
                        </div>

                        <div className="lg:pb-1">
                            <p className="max-w-2xl text-base leading-8 text-[#687363]">
                                Criámos a Momentos em Flor para tornar mais fácil
                                escolher flores que tenham significado. Uma coleção
                                pensada para oferecer, personalizar e transformar
                                momentos comuns em memórias.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED CATEGORIES */}
            <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-9 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Explore por ocasião
                            </p>

                            <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                                Flores para cada momento.
                            </h2>
                        </div>

                        <Link
                            href="/products"
                            className="hidden items-center gap-2 text-sm font-semibold text-[#55624A] sm:flex"
                        >
                            Ver coleção
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {isLoadingFeatured ? Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className="aspect-[0.82] animate-pulse rounded-[1.75rem] bg-[#E7EBE2]" />
                        )) : collections.map((collection, index) => (
                            <Link
                                key={collection.id}
                                href={`/products?categoryId=${collection.id}`}
                                className={`group relative overflow-hidden rounded-[1.75rem] shadow-[0_12px_35px_rgba(47,59,42,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(47,59,42,0.14)] ${index === 0 ? "lg:translate-y-5" : ""}`}
                            >
                                <div className="aspect-[0.82] overflow-hidden bg-[#E7EBE2]">
                                    <img
                                        src={collection.image || "/images/floral-placeholder.svg"}
                                        alt={collection.name}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-medium">
                                                {collection.name}
                                            </h3>

                                            <p className="mt-1.5 max-w-[210px] text-xs leading-5 text-white/70">
                                                {collection.description || "Descobre flores escolhidas para tornar cada momento especial."}
                                            </p>
                                        </div>

                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm transition group-hover:bg-white group-hover:text-[#35412F]">
                                            <ArrowRight size={15} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
                <div className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full bg-[#F0F3EB] blur-3xl" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Favoritos da casa
                            </p>

                            <h2 className="mt-3 max-w-xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                                Os ramos que conquistam à primeira vista.
                            </h2>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-[#7B8476]">
                                Uma seleção de composições para oferecer, celebrar e surpreender.
                            </p>
                        </div>

                        <Link
                            href="/products"
                            className="hidden items-center gap-2 text-sm font-semibold text-[#55624A] sm:flex"
                        >
                            Ver todos
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-x-4 gap-y-9 min-[420px]:grid-cols-2 md:grid-cols-4">
                        {isLoadingFeatured ? Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className="overflow-hidden rounded-[1.5rem] bg-white">
                                <div className="aspect-[0.82] animate-pulse bg-[#EEF1EB]" />
                                <div className="space-y-3 px-1 pt-4"><div className="h-4 w-2/3 animate-pulse rounded bg-[#E7EBE2]" /><div className="h-3 w-1/2 animate-pulse rounded bg-[#EEF1EB]" /></div>
                            </div>
                        )) : featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </div>
            </section>

            {/* EDITORIAL STORY */}
            <section className="bg-[#F8F9F5] px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#E6EBE0] lg:grid-cols-2">
                    <div className="relative min-h-[430px] lg:min-h-[600px]">
                        <img
                            src="/hero.png"
                            alt="Detalhe de uma composição floral"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex items-center px-7 py-14 sm:px-12 lg:px-16">
                        <div className="max-w-lg">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/65 text-[#55624A]">
                                <Heart size={19} strokeWidth={1.6} />
                            </div>

                            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-[#74816A]">
                                Mais do que flores
                            </p>

                            <h2 className="mt-4 text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">
                                O cuidado está naquilo que não se vê.
                            </h2>

                            <p className="mt-6 text-base leading-8 text-[#687363]">
                                Da escolha da composição ao momento em que é
                                recebida, queremos que cada encomenda tenha
                                aquele pequeno detalhe que faz a diferença.
                            </p>

                            <Link
                                href="/products"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#55624A] transition hover:gap-3"
                            >
                                Conhecer a coleção
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* REVIEWS */}
            {reviews.length > 0 && (
            <section className="relative overflow-hidden bg-[#F0F3EB] px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
                <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/70 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#D6DEC8]/45 blur-3xl" />

                <div className="relative mx-auto max-w-7xl">
                    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Palavras que nos inspiram
                            </p>
                            <h2 className="mt-4 max-w-lg text-4xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl">
                                O melhor de oferecer flores é o que fica depois.
                            </h2>
                            <p className="mt-5 max-w-md text-sm leading-7 text-[#687363] sm:text-base">
                                Cada entrega leva consigo um gesto. E cada mensagem
                                que recebemos lembra-nos porque fazemos o que fazemos.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {reviews.map((review, index) => (
                                <article
                                    key={review.name}
                                    className={`flex min-h-[260px] flex-col rounded-[1.5rem] border border-white/80 p-5 shadow-[0_14px_36px_rgba(47,59,42,0.06)] sm:p-6 ${index === 1 ? "bg-[#DDE5D5] sm:translate-y-5" : "bg-white/85"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-0.5 text-[#68785A]" aria-label="5 estrelas">
                                            {"★★★★★".split("").map((star, starIndex) => (
                                                <span key={starIndex} className="text-xs">{star}</span>
                                            ))}
                                        </div>
                                        <span className="font-serif text-4xl leading-none text-[#A7B29A]">“</span>
                                    </div>

                                    <p className="mt-4 flex-1 text-sm leading-6 text-[#596255]">
                                        {review.quote}
                                    </p>

                                    <div className="mt-5 border-t border-[#DDE3D8] pt-4">
                                        <p className="text-sm font-semibold text-[#2F3B2A]">
                                            {review.name}
                                        </p>
                                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#899283]">
                                            Cliente Momentos em Flor
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* SOCIAL / REELS */}
            {(instagramUrl || socialVideos.length > 0) && (
            <section className="relative overflow-hidden bg-[#F0F3EB] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#D6DEC8]/50 blur-3xl" />

                <div className="relative mx-auto max-w-7xl">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9E0D1] bg-white/80 px-3.5 py-2 text-[#55624A] shadow-sm">
                                <Camera size={15} strokeWidth={1.8} />
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                                    @momentosemflor
                                </span>
                            </div>

                            <h2 className="mt-5 text-4xl font-medium leading-[1.05] tracking-[-0.045em] text-[#2F3B2A] sm:text-5xl">
                                Um pouco de beleza,
                                <span className="block text-[#718064]">para ver e sentir.</span>
                            </h2>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-[#687363] sm:text-base">
                                Inspiração floral, bastidores e pequenos gestos
                                que tornam os dias mais especiais. Espreita o
                                universo da Momentos em Flor.
                            </p>
                        </div>

                        {instagramUrl && (
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#394633] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#46523D] hover:shadow-md"
                            >
                                Seguir no Instagram
                                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                            </a>
                        )}
                    </div>

                    <SocialVideoCarousel videos={socialVideos} />

                    <p className="mt-6 text-center text-xs leading-5 text-[#77816F]">
                        Um gesto, uma flor, uma memória. Descobre a inspiração por detrás de cada ramo.
                    </p>
                </div>
            </section>
            )}

            {/* FINAL CTA */}
            <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <Sparkles
                        size={22}
                        strokeWidth={1.5}
                        className="mx-auto text-[#55624A]"
                    />

                    <h2 className="mt-6 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">
                        Qual é o próximo momento que quer tornar especial?
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#737C6F]">
                        Encontre as flores certas e transforme um gesto simples
                        numa memória bonita.
                    </p>

                    <Link
                        href="/products"
                        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#394633] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                    >
                        Explorar a coleção
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
