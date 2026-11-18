"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, Flower2, Camera, Quote, MapPin } from "lucide-react";
import type { PublicProductList } from "@/types/products/public/public-product-list";
import { publicProductsApi } from "@/lib/api/products/public-products";
import ProductCard from "@/components/store/products/ProductCard";
import SocialVideoCarousel, { type HomeMedia } from "@/components/store/home/SocialVideoCarousel";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";
import type { StoreSettings } from "@/types/store-settings/store-settings";
import { blogPosts } from "@/lib/blog/posts";

const container = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-16";
const mediaItems = (kind: HomeMedia["kind"], values: Array<string | undefined>): HomeMedia[] =>
  values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map((src) => ({ kind, src }));
const configuredMedia: HomeMedia[] = [
  ...mediaItems("video", [
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_1,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_2,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_3,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_4,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_5,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_6,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_7,
    process.env.NEXT_PUBLIC_SOCIAL_VIDEO_8,
  ]),
  ...mediaItems("image", [
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_1,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_2,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_3,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_4,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_5,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_6,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_7,
    process.env.NEXT_PUBLIC_SOCIAL_IMAGE_8,
  ]),
];
const editorialMoments = [
  { number: "01", title: "Escolher com intenção", text: "Cada flor deve dizer alguma coisa — mesmo quando faltam as palavras." },
  { number: "02", title: "Preparar com cuidado", text: "Do primeiro detalhe ao laço final, tudo contribui para tornar o gesto memorável." },
  { number: "03", title: "Entregar emoção", text: "Mais do que uma encomenda, queremos que chegue um momento bonito." },
];
const shoppingMoments = [
  { title: "Aniversários", text: "Para celebrar mais um capítulo.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_BIRTHDAY_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_BIRTHDAY },
  { title: "Amor e romance", text: "Para dizer o que fica por dizer.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_LOVE_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_LOVE },
  { title: "Casamentos", text: "Flores à altura de um dia inesquecível.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_WEDDING_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_WEDDING },
  { title: "Nascimentos", text: "Uma receção delicada para um novo começo.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_NEW_BABY_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_NEW_BABY },
  { title: "Agradecer", text: "Um gesto bonito para reconhecer quem importa.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_THANK_YOU_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_THANK_YOU },
  { title: "Funerais e homenagens", text: "Com respeito, serenidade e significado.", categoryId: process.env.NEXT_PUBLIC_HOME_MOMENT_FUNERAL_CATEGORY_ID, image: process.env.NEXT_PUBLIC_HOME_MOMENT_FUNERAL },
];

export default function HomePage() {
  const [products, setProducts] = useState<PublicProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const videos = configuredMedia;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled([
      publicProductsApi.getAll({ page: 1, pageSize: 4, featured: true }),
      storeSettingsApi.getPublic(),
    ]).then(([featured, settings]) => {
      if (cancelled) return;
      if (featured.status === "fulfilled") setProducts(featured.value.items);
      else setFailed(true);
      if (settings.status === "fulfilled") setStoreSettings(settings.value);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#f8f6f1] text-[#293e32]">
      <section className="relative isolate overflow-hidden bg-[#253c31] text-white">
        <Image
          src={process.env.NEXT_PUBLIC_HOME_HERO || "/hero.png"}
          alt="Ramo de rosas em tons suaves, envolvido em papel kraft"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[65%_center] lg:object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17251b]/85 via-[#17251b]/55 to-[#17251b]/15 lg:via-[#17251b]/35 lg:to-transparent" />
        <div className={container + " flex min-h-[540px] items-center py-16 sm:min-h-[620px] sm:py-20 lg:min-h-[680px]"}>
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.23em] text-white/85">
              Flores, presentes e momentos especiais
            </p>
            <h1 className="mt-6 text-[clamp(2.8rem,5.3vw,5.5rem)] leading-[1.02] tracking-[-.05em]">
              As flores certas.
              <br />
              <em className="font-normal text-[#eee4d1]">Para quem importa.</em>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-white/90">
              Um aniversário, um obrigado ou uma surpresa sem motivo. Encontra
              uma forma bonita de dizer o que sentes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center gap-6 rounded-full bg-[#f8f6f1] px-6 py-4 text-sm font-semibold text-[#293e32] transition-colors hover:bg-white"
              >
                Descobrir a coleção{" "}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#selecao"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-white underline decoration-white/60 underline-offset-4 hover:decoration-white"
              >
                Ver a nossa seleção <ArrowDown size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-[#deded1]">
        <div
          className={
            container +
            " flex flex-wrap justify-center gap-x-8 gap-y-3 py-5 text-center text-[11px] uppercase tracking-[.15em] text-[#63705a] sm:justify-between"
          }
        >
          <span>Para celebrar</span>
          <Flower2 size={16} strokeWidth={1.2} aria-hidden="true" />
          <span>Para agradecer</span>
          <Flower2 size={16} strokeWidth={1.2} aria-hidden="true" />
          <span>Para surpreender</span>
          <span className="hidden sm:inline">E para ti, também</span>
        </div>
      </div>

      <section
        id="selecao"
        aria-labelledby="selection-title"
        className={container + " scroll-mt-24 py-14 sm:py-20 lg:py-24"}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10">
          <div>
            <p className="editorial-kicker">A nossa seleção</p>
            <h2
              id="selection-title"
              className="mt-3 text-4xl leading-tight tracking-[-.04em] sm:text-5xl"
            >
              O próximo sorriso
              <br className="sm:hidden" /> começa aqui.
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center gap-3 border-b border-[#adb4a2] text-sm font-semibold"
          >
            Ver toda a coleção <ArrowUpRight size={18} />
          </Link>
        </div>
        <div
          aria-busy={loading}
          className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="overflow-hidden rounded-2xl bg-white p-2 sm:p-3"
                >
                  <div className="aspect-[4/5] animate-pulse rounded-xl bg-[#eaece4]" />
                  <div className="my-5 h-5 w-3/4 animate-pulse rounded bg-[#eaece4]" />
                  <div className="mb-4 h-4 w-1/3 animate-pulse rounded bg-[#eaece4]" />
                </div>
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
        {!loading && products.length === 0 && (
          <div
            role="status"
            className="rounded-2xl border border-[#deded1] bg-white p-8 text-center"
          >
            <Flower2
              className="mx-auto mb-4 text-[#778269]"
              size={30}
              strokeWidth={1.3}
            />
            <p>
              {failed
                ? "Não foi possível carregar a seleção neste momento."
                : "Descobre as flores e os presentes disponíveis no catálogo."}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
            >
              Explorar catálogo <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="moments-title" className="overflow-hidden bg-[#eeeee6] py-14 sm:py-20 lg:py-24">
        <div className={container}>
          <div className="mb-10 grid gap-5 md:grid-cols-2 md:items-end lg:mb-12">
            <div><p className="editorial-kicker">Escolhe pela ocasião</p><h2 id="moments-title" className="mt-3 text-5xl tracking-[-.05em] sm:text-6xl">Momentos</h2></div>
            <p className="max-w-md text-sm leading-7 text-[#62685c] md:justify-self-end">Há flores para celebrar, agradecer, acolher e recordar. Começa pelo momento que queres tornar especial.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-12 lg:auto-rows-[240px]">
            {shoppingMoments.map((moment, index) => {
              const categoryId = moment.categoryId?.trim();
              const href = categoryId && /^\d+$/.test(categoryId) ? `/products?categoryId=${categoryId}` : "/products";
              const layout = ["lg:col-span-5 lg:row-span-2", "lg:col-span-3", "lg:col-span-4", "lg:col-span-4", "lg:col-span-3", "lg:col-span-7"][index];
              return <Link key={moment.title} href={href} className={`group relative min-h-[230px] overflow-hidden bg-[#dfe2d7] sm:min-h-[300px] lg:min-h-0 ${layout}`}>
                <Image src={moment.image || process.env.NEXT_PUBLIC_HOME_HERO || "/hero.png"} alt={moment.title} fill sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 42vw" className="object-cover transition duration-700 motion-safe:group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#15251d]/85 via-[#15251d]/15 to-transparent" />
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-white/50 text-white transition group-hover:bg-white group-hover:text-[#293e32]"><ArrowUpRight size={16} /></span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/70">Momento {String(index + 1).padStart(2, "0")}</p><h3 className="mt-2 text-xl leading-tight sm:text-3xl">{moment.title}</h3><p className="mt-2 hidden max-w-sm text-sm leading-6 text-white/75 sm:block">{moment.text}</p></div>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#f4ede5] py-16 sm:py-24" aria-labelledby="editorial-reviews-title">
        <div className={container}>
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><Quote size={34} strokeWidth={1} className="text-[#8a5751]" /><p className="editorial-kicker mt-6">A experiência Momentos em Flor</p><h2 id="editorial-reviews-title" className="mt-3 text-4xl leading-tight tracking-[-.045em] sm:text-6xl">Um gesto bonito.<br /><em className="font-normal text-[#8a5751]">Do início ao fim.</em></h2><p className="mt-5 max-w-md text-sm leading-7 text-[#68665f]">Esta é a experiência que orienta cada escolha da marca — sem avaliações inventadas nem promessas vazias.</p></div><div className="grid gap-4 md:grid-cols-3">{editorialMoments.map((moment, index) => <article key={moment.number} className={`min-h-64 border border-[#d9cec0] p-6 ${index === 1 ? "bg-[#293e32] text-white md:-translate-y-8" : "bg-white/70"}`}><p className={`text-xs font-semibold tracking-[.18em] ${index === 1 ? "text-[#cbd5c2]" : "text-[#8a5751]"}`}>{moment.number}</p><h3 className="mt-16 text-2xl leading-tight">{moment.title}</h3><p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-white/70" : "text-[#68665f]"}`}>{moment.text}</p></article>)}</div></div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#f8f6f1] py-16 sm:py-24" aria-labelledby="store-title">
        <div className={container}>
          <div className="grid overflow-hidden bg-[#e9eadf] lg:grid-cols-2 lg:items-stretch">
            <div className="relative min-h-[360px] bg-[#dfe2d7] sm:min-h-[480px]">
              {process.env.NEXT_PUBLIC_HOME_STORE_VIDEO ? (
                <video autoPlay muted loop playsInline preload="metadata" poster={process.env.NEXT_PUBLIC_HOME_STORE_IMAGE} aria-label="Conhece o espaço da Momentos em Flor" className="absolute inset-0 h-full w-full object-cover">
                  <source src={process.env.NEXT_PUBLIC_HOME_STORE_VIDEO} />
                </video>
              ) : (
                <Image src={process.env.NEXT_PUBLIC_HOME_STORE_IMAGE || process.env.NEXT_PUBLIC_HOME_HERO || "/hero.png"} alt="Espaço Momentos em Flor" fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover" />
              )}
            </div>
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
              <p className="editorial-kicker">A nossa casa</p>
              <h2 id="store-title" className="mt-4 text-4xl leading-tight tracking-[-.04em] sm:text-5xl">Onde cada gesto<br /><em className="font-normal text-[#8a5751]">ganha forma.</em></h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-[#5f695e]">Conhece o espaço por detrás da Momentos em Flor: o lugar onde se juntam sensibilidade, cuidado e atenção aos detalhes que chegam a cada entrega.</p>
              {storeSettings?.companyAddress && <div className="mt-7 flex items-start gap-3 border-t border-[#ccd1c4] pt-6"><MapPin size={20} className="mt-0.5 shrink-0 text-[#8a5751]" /><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#596455]">Localização</p><p className="mt-2 text-sm leading-6 text-[#5f695e]">{storeSettings.companyAddress}</p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeSettings.companyAddress)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Ver no mapa <ArrowUpRight size={15} /></a></div></div>}
              <p className="mt-6 text-xs leading-5 text-[#747d70]">Antes de visitar, confirma a disponibilidade através dos nossos contactos.</p>
              <Link href="/contact" className="mt-6 inline-flex min-h-12 w-fit items-center gap-5 rounded-full bg-[#293e32] px-6 py-3 text-sm font-semibold text-white">Contactar a loja <ArrowUpRight size={17} /></Link>
            </div>
          </div>
        </div>
      </section>

      {(instagramUrl || videos.length > 0) && (
        <section
          aria-labelledby="social-title"
          className="overflow-hidden bg-[#253c31] py-14 text-[#f7f4eb] sm:py-20 lg:py-24"
        >
          <div className={container}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#ced7bd]">
                  <Camera size={15} /> O nosso diário floral
                </p>
                <h2
                  id="social-title"
                  className="mt-4 text-4xl leading-[1.08] tracking-[-.035em] sm:text-6xl"
                >
                  A beleza também
                  <br />
                  se vê{" "}
                  <em className="font-normal text-[#d9c9ad]">em movimento.</em>
                </h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#d0d8cc]">
                  Flores de perto, detalhes e inspiração para o teu próximo
                  gesto. Entra no universo Momentos em Flor.
                </p>
              </div>
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-4 rounded-full border border-[#7f9281] px-6 py-3 text-sm transition-colors hover:bg-white/10"
                >
                  Segue-nos no Instagram <ArrowUpRight size={18} />
                </a>
              )}
            </div>
            <SocialVideoCarousel videos={videos} />
          </div>
        </section>
      )}

      <section className={container + " py-16 text-center sm:py-24"}>
        <Flower2
          size={32}
          strokeWidth={1}
          className="mx-auto text-[#8a5751]"
          aria-hidden="true"
        />
        <p className="mt-5 text-[10px] uppercase tracking-[.2em] text-[#62685c]">
          Não precisa de ser uma data especial
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-4xl leading-tight tracking-[-.04em] sm:text-6xl">
          Às vezes, o motivo
          <br />é só{" "}
          <em className="font-normal text-[#8a5751]">gostar de alguém.</em>
        </h2>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center gap-7 rounded-full bg-[#293e32] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#435943]"
        >
          Escolher um gesto <ArrowUpRight size={18} />
        </Link>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="blog-title">
        <div className={container}>
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="editorial-kicker">O nosso diário</p><h2 id="blog-title" className="mt-3 text-4xl tracking-[-.04em] sm:text-5xl">Histórias que florescem.</h2></div><Link href="/blog" className="inline-flex items-center gap-2 border-b border-[#aeb7a5] pb-1 text-sm font-semibold">Ver todos os artigos <ArrowUpRight size={16} /></Link></div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">{blogPosts.map((post) => <article key={post.slug} className="group"><Link href={`/blog/${post.slug}`}><div className="relative aspect-[4/3] overflow-hidden bg-[#e4e5dc]"><Image src={post.image} alt="" fill sizes="(max-width: 767px) 100vw, 33vw" className="object-cover transition duration-700 motion-safe:group-hover:scale-105" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[#8a5751]">{post.category} · {post.readingTime}</p><h3 className="mt-3 text-2xl leading-tight">{post.title}</h3><p className="mt-3 text-sm leading-6 text-[#66705f]">{post.excerpt}</p></Link></article>)}</div>
        </div>
      </section>
    </div>
  );
}
