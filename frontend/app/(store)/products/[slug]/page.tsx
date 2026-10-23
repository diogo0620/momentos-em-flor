"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Check, ChevronLeft, ChevronRight, Heart, Minus, Plus,
    ShieldCheck, ShoppingBag, Sparkles, Truck,
} from "lucide-react";

import { publicProductsApi } from "@/lib/api/products/public-products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { PublicProductComponent, PublicProductDetail } from "@/types/products/public/public-product-detail";
type ComponentQuantities = Record<number, number>;

const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

function ProductImage({ src, alt, priority = false, sizes = "(max-width: 768px) 100vw, 60vw" }: {
    src: string;
    alt: string;
    priority?: boolean;
    sizes?: string;
}) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-[#F3F5EE] text-[#9AA58D]">
                <Sparkles size={34} strokeWidth={1.3} />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={sizes}
            quality={75}
            className="object-cover"
            onError={() => setFailed(true)}
        />
    );
}

export default function PublicProductDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const { addItem } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const [product, setProduct] = useState<PublicProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [componentQuantities, setComponentQuantities] = useState<ComponentQuantities>({});
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);

    const loadProduct = useCallback(async () => {
        if (!slug) {
            setError("Não foi possível identificar este produto.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await publicProductsApi.getBySlug(slug);


            if (!response?.id) {
                setProduct(null);
                setError("Não foi possível encontrar este produto.");
                return;
            }

            setProduct(response);
            setSelectedVariantId(response.variants?.[0]?.id ?? null);
            setComponentQuantities(Object.fromEntries(
                (response.components ?? []).map((component) => [
                    component.id, component.minQuantity,
                ]),
            ));
            setActiveImageIndex(0);
        } catch (err) {
            setProduct(null);
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao carregar o produto.");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => { void loadProduct(); }, [loadProduct]);

    const selectedVariant = useMemo(
        () => product?.variants?.find((variant) => variant.id === selectedVariantId) ?? null,
        [product, selectedVariantId],
    );

    const galleryImages = useMemo(() => {
        if (!product) return [];
        return [...new Set([
            ...(selectedVariant?.image ? [selectedVariant.image] : []),
            ...(product.images ?? []),
        ].filter(Boolean))];
    }, [product, selectedVariant]);

    useEffect(() => { setActiveImageIndex(0); }, [selectedVariantId]);

    const componentsExtra = useMemo(() => (product?.components ?? []).reduce((total, component) => {
        const selected = componentQuantities[component.id] ?? component.minQuantity;
        return total + Math.max(0, selected - component.minQuantity) *
            component.pricePerAdditionalUnit;
    }, 0), [product, componentQuantities]);

    const unitPrice = selectedVariant?.price ?? product?.price ?? 0;
    const totalUnitPrice = unitPrice + componentsExtra;
    const totalPrice = totalUnitPrice * quantity;
    const activeImage = galleryImages[activeImageIndex] ?? product?.images?.[0] ?? "";
    const favorite = product ? isInWishlist(product.id) : false;

    const updateComponentQuantity = (component: PublicProductComponent, next: number) => {
        setComponentQuantities((current) => ({
            ...current,
            [component.id]: Math.min(component.maxQuantity, Math.max(component.minQuantity, next)),
        }));
        setAddedToCart(false);
    };

    const handleAddToCart = () => {
        if (!product) return;

        const selectedComponents = (product.components ?? []).map(
            (component) => ({
                componentId: component.id,
                name: component.name,
                quantity:
                    componentQuantities[component.id] ??
                    component.minQuantity,
            }),
        );

        const componentLabels = selectedComponents
            .map(
                (component) =>
                    `${component.name}: ${component.quantity}`,
            )
            .join(", ");

        const configurationDescription = [
            selectedVariant
                ? `Tamanho: ${selectedVariant.name}`
                : null,
            componentLabels || null,
        ]
            .filter(Boolean)
            .join(" · ");

        const cartItemId = [
            product.id,
            selectedVariant?.id ?? "default",
            ...selectedComponents.map(
                (component) =>
                    `${component.componentId}-${component.quantity}`,
            ),
        ].join("-");

        console.log("ARTIGO A ADICIONAR AO CARRINHO", {
    productId: product.id,
    selectedVariant,
    selectedComponents,
});

        addItem({
            cartItemId,
            id: product.id,
            name: product.name,
            description: configurationDescription,
            image:
                selectedVariant?.image ??
                product.images?.[0] ??
                "",
            price: totalUnitPrice,
            quantity,

            // Variante selecionada
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name,

            // Componentes e respetivas quantidades
            components: selectedComponents,
        });

        setAddedToCart(true);
    };

    const changeImage = (direction: -1 | 1) => {
        if (galleryImages.length < 2) return;
        setActiveImageIndex((current) =>
            (current + direction + galleryImages.length) % galleryImages.length,
        );
    };

    if (loading) {
        return (
            <main className="min-h-[70vh] bg-[#FCFCF9] px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
                    <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-[#EEF0E9]" />
                    <div className="space-y-5 py-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-[#EEF0E9]" />
                        <div className="h-10 w-3/4 animate-pulse rounded bg-[#EEF0E9]" />
                        <div className="h-6 w-1/3 animate-pulse rounded bg-[#EEF0E9]" />
                        <div className="h-24 animate-pulse rounded-2xl bg-[#EEF0E9]" />
                    </div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-[70vh] bg-[#FCFCF9] px-4 py-16 sm:px-6">
                <div className="mx-auto max-w-xl rounded-[2rem] border border-[#E8EBE4] bg-white p-8 text-center shadow-sm">
                    <Sparkles className="mx-auto text-[#657456]" size={30} />
                    <h1 className="mt-5 text-2xl font-semibold text-[#2F3B2A]">
                        Não encontrámos este produto
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-[#7A8474]">
                        {error ?? "O produto pode ter sido removido ou já não estar disponível."}
                    </p>
                    <button onClick={() => void loadProduct()} className="mt-6 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#414D37]">
                        Tentar novamente
                    </button>
                    <div className="mt-5">
                        <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#657456]">
                            <ArrowLeft size={16} /> Voltar aos produtos
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#FCFCF9] pb-16 text-[#2F3B2A]">
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                <Link href="/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#7A8474] transition hover:text-[#2F3B2A]">
                    <ArrowLeft size={16} /> Voltar à loja
                </Link>

                <div className="mt-6 grid items-start gap-9 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
                    <section className="min-w-0">
                        <div className="relative overflow-hidden rounded-[2rem] bg-[#F3F5EE] shadow-sm">
                            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                                <ProductImage
                                    src={activeImage}
                                    alt={product.name}
                                    priority
                                    sizes="(max-width: 1023px) 100vw, 55vw"
                                />
                                <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#55624A] shadow-sm backdrop-blur">
                                    {product.type === "RENTAL" ? "Aluguer" : "Feito com carinho"}
                                </span>
                                <button
                                    type="button"
                                    aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                    onClick={() => {
                                        toggleWishlist({
                                            id: product.id,
                                            slug: product.slug,
                                            name: product.name,
                                            image: product.images?.[0]
                                        });
                                    }}
                                    className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/70 shadow-sm backdrop-blur ${favorite ? "bg-[#D6DEC8] text-[#3F4B35]" : "bg-white/90 text-[#55624A]"}`}
                                >
                                    <Heart size={19} fill={favorite ? "currentColor" : "none"} />
                                </button>
                                {galleryImages.length > 1 && (
                                    <>
                                        <button type="button" aria-label="Imagem anterior" onClick={() => changeImage(-1)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3F4B35] shadow-sm hover:bg-white">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button type="button" aria-label="Imagem seguinte" onClick={() => changeImage(1)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3F4B35] shadow-sm hover:bg-white">
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white">
                                            {activeImageIndex + 1} / {galleryImages.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {galleryImages.length > 1 && (
                            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                                {galleryImages.map((image, index) => (
                                    <button key={`${image}-${index}`} type="button" onClick={() => setActiveImageIndex(index)} aria-label={`Ver imagem ${index + 1}`} className={`relative aspect-square overflow-hidden rounded-2xl bg-[#F3F5EE] ${activeImageIndex === index ? "ring-2 ring-[#657456] ring-offset-2" : "opacity-75 hover:opacity-100"}`}>
                                        <ProductImage
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            sizes="(max-width: 639px) 22vw, 120px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {product.description && (
                            <div className="mt-8 hidden rounded-[1.75rem] border border-[#E8EBE4] bg-white p-6 lg:block">
                                <h2 className="text-lg font-semibold">Sobre este produto</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#707A69]">{product.description}</p>
                            </div>
                        )}
                    </section>

                    <section className="lg:sticky lg:top-8">
                        {product.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.categories.map((category) => (
                                    <span key={category.id} className="rounded-full bg-[#E9EDE1] px-3 py-1.5 text-xs font-medium text-[#58664D]">{category.name}</span>
                                ))}
                            </div>
                        )}
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#849078]">Momentos em Flor</p>
                        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
                        <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
                            <span className="text-3xl font-semibold tracking-tight text-[#3F4B35]">{formatPrice(totalUnitPrice)}</span>
                            {componentsExtra > 0 && <span className="pb-1 text-sm text-[#7A8474]">inclui personalização</span>}
                        </div>

                        {product.type === "RENTAL" && product.rentalDeposit != null && (
                            <div className="mt-3 rounded-2xl border border-[#E5E9DD] bg-[#F5F7F1] p-4">
                                <p className="text-sm font-medium text-[#3F4B35]">Caução de {formatPrice(product.rentalDeposit)}</p>
                                <p className="mt-1 text-xs leading-5 text-[#7A8474]">A caução é apresentada separadamente do preço do aluguer.</p>
                            </div>
                        )}
                        {product.description && (
                            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[#707A69] lg:hidden">{product.description}</p>
                        )}

                        {!!product.variants?.length && (
                            <div className="mt-8">
                                <div className="flex items-end justify-between gap-3">
                                    <div>
                                        <h2 className="text-base font-semibold">Escolhe o tamanho</h2>
                                        <p className="mt-1 text-sm text-[#7A8474]">Seleciona a opção ideal para o teu momento.</p>
                                    </div>
                                    {selectedVariant && <span className="text-sm font-semibold text-[#55624A]">{selectedVariant.name}</span>}
                                </div>
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {product.variants.map((variant) => {
                                        const selected = selectedVariantId === variant.id;
                                        return (
                                            <button key={variant.id} type="button" onClick={() => { setSelectedVariantId(variant.id); setAddedToCart(false); }} className={`overflow-hidden rounded-2xl border text-left transition ${selected ? "border-[#657456] bg-[#F4F6F0] ring-1 ring-[#657456]" : "border-[#E5E9DD] bg-white hover:border-[#B8C3AA] hover:bg-[#FAFBF8]"}`}>
                                                <div className="flex gap-3 p-3">
                                                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E9EDE1]">
                                                        <ProductImage
                                                            src={variant.image}
                                                            alt={variant.name}
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1 py-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span className="font-semibold text-[#374132]">{variant.name}</span>
                                                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#657456] bg-[#657456] text-white" : "border-[#D5DBCD] text-transparent"}`}><Check size={12} /></span>
                                                        </div>
                                                        <p className="mt-1 text-sm font-semibold text-[#55624A]">{formatPrice(variant.price)}</p>
                                                        {variant.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7A8474]">{variant.description}</p>}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedVariant?.description && (
                                    <div className="mt-3 rounded-xl bg-[#F3F5EE] px-4 py-3 text-sm leading-6 text-[#637057]">
                                        <span className="font-semibold">{selectedVariant.name}:</span> {selectedVariant.description}
                                    </div>
                                )}
                            </div>
                        )}

                        {!!product.components?.length && (
                            <div className="mt-8 border-t border-[#E8EBE4] pt-7">
                                <h2 className="text-base font-semibold">Personaliza o teu produto</h2>
                                <p className="mt-1 text-sm leading-6 text-[#7A8474]">Ajusta as quantidades ao teu gosto.</p>
                                <div className="mt-4 space-y-3">
                                    {product.components.map((component) => {
                                        const selected = componentQuantities[component.id] ?? component.minQuantity;
                                        const extraPrice = Math.max(0, selected - component.minQuantity) * component.pricePerAdditionalUnit;
                                        return (
                                            <div key={component.id} className="flex flex-col gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-[#374132]">{component.name}</p>
                                                    <p className="mt-1 text-xs leading-5 text-[#7A8474]">Mín. {component.minQuantity} · Recomendado {component.recommendedQuantity} · Máx. {component.maxQuantity}</p>
                                                    {extraPrice > 0 && <p className="mt-1 text-xs font-medium text-[#657456]">+{formatPrice(extraPrice)}</p>}
                                                </div>
                                                <div className="flex items-center gap-3 self-start rounded-full border border-[#E5E9DD] bg-[#FAFBF8] p-1 sm:self-auto">
                                                    <button type="button" aria-label={`Diminuir ${component.name}`} disabled={selected <= component.minQuantity} onClick={() => updateComponentQuantity(component, selected - 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#E9EDE1] disabled:opacity-30"><Minus size={15} /></button>
                                                    <span className="min-w-5 text-center text-sm font-semibold">{selected}</span>
                                                    <button type="button" aria-label={`Aumentar ${component.name}`} disabled={selected >= component.maxQuantity} onClick={() => updateComponentQuantity(component, selected + 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#E9EDE1] disabled:opacity-30"><Plus size={15} /></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 border-t border-[#E8EBE4] pt-7">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Quantidade</label>
                                    <div className="flex h-12 w-fit items-center gap-4 rounded-full border border-[#E5E9DD] bg-white px-2">
                                        <button type="button" aria-label="Diminuir quantidade" disabled={quantity <= 1} onClick={() => { setQuantity((value) => Math.max(1, value - 1)); setAddedToCart(false); }} className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#F3F5EE] disabled:opacity-30"><Minus size={16} /></button>
                                        <span className="min-w-4 text-center text-sm font-semibold">{quantity}</span>
                                        <button type="button" aria-label="Aumentar quantidade" onClick={() => { setQuantity((value) => value + 1); setAddedToCart(false); }} className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#F3F5EE]"><Plus size={16} /></button>
                                    </div>
                                </div>
                                <button type="button" onClick={handleAddToCart} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#414D37] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8A987B] focus:ring-offset-2">
                                    {addedToCart ? <Check size={18} /> : <ShoppingBag size={18} />}
                                    {addedToCart ? "Adicionado ao carrinho" : "Adicionar ao carrinho"}
                                </button>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-[#F3F5EE] p-4">
                                <div>
                                    <p className="text-sm font-medium text-[#55624A]">Total</p>
                                    <p className="mt-1 text-xs text-[#7A8474]">{quantity} {quantity === 1 ? "unidade" : "unidades"}{selectedVariant ? ` · ${selectedVariant.name}` : ""}</p>
                                </div>
                                <p className="text-xl font-semibold tracking-tight">{formatPrice(totalPrice)}</p>
                            </div>
                            {addedToCart && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-medium text-[#536548]"><Check size={16} /> Produto adicionado ao carrinho.</p>}
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="flex items-start gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-3">
                                    <Truck size={18} className="mt-0.5 shrink-0 text-[#657456]" />
                                    <div><p className="text-xs font-semibold">Entrega cuidada</p><p className="mt-1 text-xs leading-5 text-[#7A8474]">Preparado com atenção para chegar em boas mãos.</p></div>
                                </div>
                                <div className="flex items-start gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-3">
                                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#657456]" />
                                    <div><p className="text-xs font-semibold">Compra simples</p><p className="mt-1 text-xs leading-5 text-[#7A8474]">Uma forma especial de marcar o momento.</p></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
