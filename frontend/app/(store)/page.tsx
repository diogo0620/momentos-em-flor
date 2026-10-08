import Link from "next/link";
import {
    ArrowRight,
    CalendarDays,
    Heart,
    Camera,
    Play,
    ShieldCheck,
    Sparkles,
    Truck,
} from "lucide-react";

const collections = [
    {
        title: "Bouquets",
        text: "Composições pensadas para surpreender.",
        image: "/categories/bouquets.jpg",
    },
    {
        title: "Rosas",
        text: "Um clássico que nunca deixa de dizer muito.",
        image: "/categories/roses.jpg",
    },
    {
        title: "Romântico",
        text: "Para quando as palavras não chegam.",
        image: "/categories/romantic.jpg",
    },
    {
        title: "Aniversário",
        text: "Para tornar um dia especial ainda mais especial.",
        image: "/categories/birthday.jpg",
    },
];

const featuredProducts = [
    {
        name: "Bouquet Primavera",
        price: "35,00 €",
        category: "Bouquets",
        image: "/products/bouquet-primavera.jpg",
    },
    {
        name: "Rosas Vermelhas",
        price: "42,00 €",
        category: "Rosas",
        image: "/products/rosas-vermelhas.jpg",
    },
    {
        name: "Bouquet Romântico",
        price: "39,00 €",
        category: "Romântico",
        image: "/products/bouquet-romantico.jpg",
    },
    {
        name: "Bouquet Delicado",
        price: "32,00 €",
        category: "Bouquets",
        image: "/products/bouquet-delicado.jpg",
    },
];

const reels = [
    {
        image: "/social/reel-1.jpg",
        label: "Um bouquet para dizer obrigado",
    },
    {
        image: "/social/reel-2.jpg",
        label: "Por dentro da Momentos em Flor",
    },
    {
        image: "/social/reel-3.jpg",
        label: "Ideias para surpreender",
    },
    {
        image: "/social/reel-4.jpg",
        label: "Flores que falam por si",
    },
];

const reviews = [
    {
        quote: "As flores chegaram lindas e exatamente no dia que tinha escolhido. Foi uma surpresa perfeita.",
        name: "Mariana S.",
    },
    {
        quote: "O bouquet era ainda mais bonito ao vivo. A apresentação estava impecável.",
        name: "Beatriz M.",
    },
    {
        quote: "Foi muito simples encomendar e o resultado superou completamente as expectativas.",
        name: "João R.",
    },
];

export default function HomePage() {
    return (
        <div className="bg-[#F8F9F5] text-[#2F3B2A]">

            {/* HERO */}
            <section className="relative min-h-[600px] overflow-hidden sm:min-h-[660px]">
                <img
                    src="/hero.jpg"
                    alt="Composição floral da Momentos em Flor"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/25 to-transparent" />

                <div className="relative mx-auto flex min-h-[600px] max-w-7xl items-end px-5 pb-14 pt-24 sm:min-h-[660px] sm:px-8 sm:pb-16 lg:px-10">
                    <div className="max-w-2xl text-white">
                        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.25em] text-white/75">
                            <span className="h-px w-8 bg-white/60" />
                            Momentos em Flor
                        </div>

                        <h1 className="mt-6 max-w-2xl text-5xl font-medium leading-[0.96] tracking-[-0.05em] sm:text-6xl lg:text-[68px]">
                            Há coisas que se dizem melhor com flores.
                        </h1>

                        <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                            Flores escolhidas para celebrar, agradecer,
                            surpreender ou simplesmente tornar um dia mais bonito.
                        </p>

                        <Link
                            href="/products"
                            className="mt-9 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#35412F] transition hover:bg-[#EEF1E9]"
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

            {/* COLLECTIONS */}
            <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-9 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Descubra
                            </p>

                            <h2 className="mt-3 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                                Encontre a sua flor.
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
                        {collections.map((collection) => (
                            <Link
                                key={collection.title}
                                href="/products"
                                className="group relative overflow-hidden rounded-[1.75rem]"
                            >
                                <div className="aspect-[0.82] overflow-hidden bg-[#E7EBE2]">
                                    <img
                                        src={collection.image}
                                        alt={collection.title}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-medium">
                                                {collection.title}
                                            </h3>

                                            <p className="mt-1.5 max-w-[210px] text-xs leading-5 text-white/70">
                                                {collection.text}
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
            <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                                Seleção da casa
                            </p>

                            <h2 className="mt-3 max-w-xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                                As escolhas que tornam o gesto inesquecível.
                            </h2>
                        </div>

                        <Link
                            href="/products"
                            className="hidden items-center gap-2 text-sm font-semibold text-[#55624A] sm:flex"
                        >
                            Ver todos
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.name}
                                href="/products"
                                className="group"
                            >
                                <div className="relative aspect-[0.82] overflow-hidden rounded-[1.5rem] bg-[#EEF1EB]">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                                    />

                                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[#55624A] backdrop-blur-sm">
                                        {product.category}
                                    </span>

                                    <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-[#35412F] opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <ArrowRight size={16} />
                                    </span>
                                </div>

                                <div className="px-1 pt-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm font-medium text-[#2F3B2A] sm:text-base">
                                            {product.name}
                                        </h3>

                                        <p className="shrink-0 text-sm font-semibold text-[#55624A]">
                                            {product.price}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* EDITORIAL STORY */}
            <section className="bg-[#F8F9F5] px-5 py-20 sm:px-8 lg:px-10 lg:py-32">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-[#E6EBE0] lg:grid-cols-2">
                    <div className="relative min-h-[430px] lg:min-h-[600px]">
                        <img
                            src="/flower-detail.jpg"
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
            <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.23em] text-[#7A876F]">
                            Quem já ofereceu
                        </p>

                        <h2 className="mx-auto mt-4 max-w-2xl text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">
                            Há gestos que ficam na memória.
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {reviews.map((review) => (
                            <div
                                key={review.name}
                                className="rounded-[1.5rem] border border-[#E5E9E1] bg-[#F8F9F5] p-7 sm:p-8"
                            >
                                <div className="flex gap-1 text-[#55624A]">
                                    {"★★★★★".split("").map((star, index) => (
                                        <span key={index} className="text-xs">
                                            {star}
                                        </span>
                                    ))}
                                </div>

                                <p className="mt-7 min-h-[112px] text-[15px] leading-7 text-[#596255]">
                                    “{review.quote}”
                                </p>

                                <div className="mt-6 border-t border-[#E2E6DF] pt-5">
                                    <p className="text-sm font-semibold text-[#2F3B2A]">
                                        {review.name}
                                    </p>
                                    <p className="mt-1 text-xs text-[#92998E]">
                                        Cliente Momentos em Flor
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOCIAL / REELS */}
            <section className="overflow-hidden bg-[#F8F9F5] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-[#55624A]">
                                <Camera size={18} strokeWidth={1.7} />

                                <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                                    @momentosemflor
                                </p>
                            </div>

                            <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
                                Flores, inspiração e momentos.
                            </h2>

                            <p className="mt-4 max-w-xl text-sm leading-7 text-[#737C6F]">
                                Acompanhe-nos nas redes sociais para descobrir
                                novas flores, ideias para oferecer e um pouco do
                                mundo da Momentos em Flor.
                            </p>
                        </div>

                        <a
                            href="#"
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DCE1D8] bg-white px-5 py-3 text-sm font-semibold text-[#55624A] transition hover:border-[#55624A]"
                        >
                            Seguir no Instagram
                            <ArrowRight size={15} />
                        </a>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {reels.map((reel) => (
                            <a
                                key={reel.image}
                                href="#"
                                className="group relative aspect-[0.72] overflow-hidden rounded-[1.4rem] bg-[#E5E9E0]"
                            >
                                <img
                                    src={reel.image}
                                    alt={reel.label}
                                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.045]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 opacity-80" />

                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white">
                                    <p className="text-xs font-medium leading-5 text-white/90">
                                        {reel.label}
                                    </p>

                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                                        <Play size={12} fill="currentColor" />
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

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
