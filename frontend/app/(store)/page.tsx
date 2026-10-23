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
        video: "/social/reel-1.mp4",
        label: "Um bouquet para dizer obrigado",
        tag: "Inspiração",
    },
    {
        video: "/social/reel-2.mp4",
        label: "Por dentro da Momentos em Flor",
        tag: "Bastidores",
    },
    {
        video: "/social/reel-3.mp4",
        label: "Ideias para surpreender",
        tag: "Ideias para oferecer",
    },
    {
        video: "/social/reel-4.mp4",
        label: "Flores que falam por si",
        tag: "Pequenos gestos",
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
                    src="/hero.png"
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
                        {collections.map((collection, index) => (
                            <Link
                                key={collection.title}
                                href="/products"
                                className={`group relative overflow-hidden rounded-[1.75rem] shadow-[0_12px_35px_rgba(47,59,42,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(47,59,42,0.14)] ${index === 0 ? "lg:translate-y-5" : ""}`}
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

                    <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.name}
                                href="/products"
                                className="group"
                            >
                                <div className="relative aspect-[0.82] overflow-hidden rounded-[1.5rem] bg-[#EEF1EB] shadow-[0_10px_28px_rgba(47,59,42,0.06)]">

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
                                    <p className="mt-2 text-xs text-[#8A9284]">
                                        Preparado com cuidado, pensado para surpreender.
                                    </p>
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

            {/* SOCIAL / REELS */}
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

                        <a
                            href="#"
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#394633] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#46523D] hover:shadow-md"
                        >
                            Seguir no Instagram
                            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-5 lg:grid-cols-4">
                        {reels.map((reel, index) => (
                            <article
                                key={reel.video ?? reel.image}
                                className={`group relative isolate aspect-[0.72] overflow-hidden rounded-[1.6rem] bg-[#DDE4D5] shadow-[0_14px_40px_rgba(47,59,42,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(47,59,42,0.18)] ${
                                    index === 0 ? "ring-2 ring-white ring-offset-2 ring-offset-[#F0F3EB]" : ""
                                }`}
                            >
                                {reel.video ? (
                                    <video
                                        src={reel.video}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        aria-label={reel.label}
                                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                                    />
                                ) : (
                                    <img
                                        src={reel.image}
                                        alt={reel.label}
                                        loading="lazy"
                                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                                    />
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-[#172015]/85 via-[#172015]/10 to-black/10" />

                                <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 sm:p-4">
                                    <span className="rounded-full border border-white/25 bg-black/20 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-md sm:text-[10px]">
                                        {reel.tag}
                                    </span>
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition group-hover:scale-110 group-hover:bg-white group-hover:text-[#35412F]">
                                        <Play size={12} fill="currentColor" />
                                    </span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
                                    <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
                                        Momentos em Flor
                                    </span>
                                    <h3 className="max-w-[220px] text-sm font-semibold leading-5 sm:text-base sm:leading-6">
                                        {reel.label}
                                    </h3>
                                    <div className="mt-3 h-px w-8 bg-white/70 transition-all duration-300 group-hover:w-14" />
                                </div>
                            </article>
                        ))}
                    </div>

                    <p className="mt-6 text-center text-xs leading-5 text-[#77816F]">
                        Um gesto, uma flor, uma memória. Descobre a inspiração por detrás de cada ramo.
                    </p>
                </div>
            </section>

            {/* RENTAL / FLORIST EQUIPMENT */}
            <section className="overflow-hidden bg-[#F8F9F5] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#34412F] text-white shadow-[0_24px_70px_rgba(47,59,42,0.16)]">
                        <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full bg-[#D6DEC8]/15 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                        <div className="relative grid gap-10 px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-16 lg:py-16">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[#E5EBDD] backdrop-blur-sm">
                                    <Sparkles size={14} strokeWidth={1.8} />
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                                        Para profissionais floristas
                                    </span>
                                </div>

                                <h2 className="mt-6 text-3xl font-medium leading-[1.05] tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                                    O teu próximo projeto merece o equipamento certo.
                                </h2>

                                <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
                                    Também disponibilizamos equipamento e acessórios para aluguer,
                                    pensados para apoiar outras floristas nos seus trabalhos,
                                    eventos e grandes ideias — sem precisares de comprar tudo.
                                </p>

                                <Link
                                    href="/products?type=rental"
                                    className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#D6DEC8] px-6 py-3.5 text-sm font-semibold text-[#34412F] transition hover:-translate-y-0.5 hover:bg-white"
                                >
                                    Explorar equipamento para aluguer
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>

                                <p className="mt-4 text-xs text-white/55">
                                    Uma solução prática para dar vida às tuas composições.
                                </p>
                            </div>

                            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                                <div className="absolute -inset-3 rounded-[1.75rem] border border-white/15 rotate-3" />
                                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
                                    <img
                                        src="/rental-equipment.jpg"
                                        alt="Equipamento e acessórios disponíveis para aluguer por floristas"
                                        className="aspect-[1.08] w-full rounded-[1.1rem] object-cover"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-x-3 bottom-3 rounded-b-[1.1rem] bg-gradient-to-t from-[#172015]/85 via-[#172015]/35 to-transparent px-5 pb-5 pt-12">
                                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                                            Momentos em Flor
                                        </p>
                                        <p className="mt-1 text-lg font-medium text-white">
                                            Mais possibilidades. Menos investimento.
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -left-3 rounded-2xl border border-[#E4E9DE] bg-white px-4 py-3 text-[#394633] shadow-lg sm:-left-5">
                                    <p className="text-xs font-semibold">Feito para floristas</p>
                                    <p className="mt-0.5 text-[11px] text-[#788272]">Aluga o que precisas</p>
                                </div>
                            </div>
                        </div>
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
