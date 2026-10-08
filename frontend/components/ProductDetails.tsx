"use client";

import {
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Heart,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Truck,
} from "lucide-react";
import { useMemo, useState } from "react";

import AddToCartButton from "@/components/store/AddToCartButton";
import type { ProductDetail } from "@/types/product";

import WishlistButton from "./wishlist/WishlistButton";

type Props = {
    product: ProductDetail;
};

export default function ProductDetails({ product }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product.variants?.length ? product.variants[0].id : null,
    );
    const [componentQuantities, setComponentQuantities] = useState<
        Record<number, number>
    >({});
    const [selectedImage, setSelectedImage] = useState(0);

    const selectedVariant = useMemo(
        () =>
            selectedVariantId
                ? product.variants?.find(
                      (variant) => variant.id === selectedVariantId,
                  ) ?? null
                : null,
        [product.variants, selectedVariantId],
    );

    const unitPrice = selectedVariant?.price ?? product.price;

    const componentsTotal = useMemo(() => {
        if (!product.components?.length) return 0;

        return product.components.reduce((total, component) => {
            const currentQuantity =
                componentQuantities[component.id] ?? component.minQuantity;

            const additionalUnits = Math.max(
                0,
                currentQuantity - component.minQuantity,
            );

            return (
                total +
                additionalUnits *
                    component.customerPricePerAdditionalUnit
            );
        }, 0);
    }, [product.components, componentQuantities]);

    const unitTotal = unitPrice + componentsTotal;
    const total = unitTotal * quantity;

    const images = product.images ?? [];
    const hasImages = images.length > 0;
    const currentImage = images[selectedImage];

    const nextImage = () => {
        if (!images.length) return;
        setSelectedImage((current) => (current + 1) % images.length);
    };

    const previousImage = () => {
        if (!images.length) return;
        setSelectedImage(
            (current) => (current - 1 + images.length) % images.length,
        );
    };

    const getComponentQuantity = (
        componentId: number,
        minQuantity: number,
    ) => componentQuantities[componentId] ?? minQuantity;

    const updateComponentQuantity = (
        componentId: number,
        value: number,
    ) => {
        setComponentQuantities((current) => ({
            ...current,
            [componentId]: value,
        }));
    };

    return (
        <div className="pb-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] lg:gap-16">
                {/* GALLERY */}
                <div className="lg:sticky lg:top-24 lg:self-start">
                    <div className="relative overflow-hidden rounded-[2rem] bg-[#F1F3EB] shadow-[0_18px_50px_rgba(47,59,42,0.08)]">
                        <div className="aspect-[4/5]">
                            {hasImages ? (
                                <img
                                    src={currentImage.url}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition duration-700"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <span className="text-[100px]">🌸</span>
                                </div>
                            )}
                        </div>

                        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#55624A] shadow-sm backdrop-blur">
                            <Sparkles size={14} />
                            Feito para momentos especiais
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={previousImage}
                                    aria-label="Imagem anterior"
                                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2F3B2A] shadow-lg backdrop-blur transition hover:scale-105"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <button
                                    type="button"
                                    onClick={nextImage}
                                    aria-label="Próxima imagem"
                                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2F3B2A] shadow-lg backdrop-blur transition hover:scale-105"
                                >
                                    <ChevronRight size={20} />
                                </button>

                                <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/20 px-3 py-2 backdrop-blur">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() =>
                                                setSelectedImage(index)
                                            }
                                            aria-label={`Ver imagem ${index + 1}`}
                                            className={`h-1.5 rounded-full transition-all ${
                                                selectedImage === index
                                                    ? "w-6 bg-white"
                                                    : "w-1.5 bg-white/60"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => setSelectedImage(index)}
                                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition ${
                                        selectedImage === index
                                            ? "ring-2 ring-[#55624A] ring-offset-2"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <img
                                        src={image.url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* PRODUCT INFO */}
                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-5">
                        <div>
                            <span className="inline-flex rounded-full bg-[#E5EAD9] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#55624A]">
                                {product.category.name}
                            </span>

                            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#263020] sm:text-5xl">
                                {product.name}
                            </h1>
                        </div>

                        <div className="pt-1">
                            <WishlistButton
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    image: product.images?.[0]
                                        ? { url: product.images[0].url }
                                        : null,
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-[#7A8273]">
                        <div className="flex items-center gap-1 text-[#C28A32]">
                            <span>★★★★★</span>
                        </div>
                        <span>Uma escolha especial para oferecer ou celebrar</span>
                    </div>

                    <p className="mt-6 max-w-xl text-[15px] leading-7 text-gray-500">
                        {product.description ??
                            "Uma composição floral pensada para tornar cada momento mais especial, com uma apresentação cuidada e atenção aos detalhes."}
                    </p>

                    <div className="mt-7 flex items-end gap-3">
                        <span className="text-4xl font-bold tracking-tight text-[#55624A]">
                            {unitTotal.toFixed(2)} €
                        </span>
                        {componentsTotal > 0 && (
                            <span className="mb-1.5 text-sm text-gray-400">
                                por unidade
                            </span>
                        )}
                    </div>

                    {/* TRUST / DELIVERY */}
                    <div className="mt-7 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#E5E9E0] bg-[#FAFBF8] p-4">
                            <Truck
                                size={19}
                                className="text-[#55624A]"
                            />
                            <p className="mt-3 text-sm font-semibold text-[#2F3B2A]">
                                Entrega cuidada
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-400">
                                Receba onde e quando escolher.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5E9E0] bg-[#FAFBF8] p-4">
                            <Sparkles
                                size={19}
                                className="text-[#55624A]"
                            />
                            <p className="mt-3 text-sm font-semibold text-[#2F3B2A]">
                                Preparação cuidada
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-400">
                                Atenção a cada detalhe da sua encomenda.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5E9E0] bg-[#FAFBF8] p-4">
                            <ShieldCheck
                                size={19}
                                className="text-[#55624A]"
                            />
                            <p className="mt-3 text-sm font-semibold text-[#2F3B2A]">
                                Compra segura
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-400">
                                Pagamento simples e protegido.
                            </p>
                        </div>
                    </div>

                    {/* VARIANTS */}
                    {product.variants?.length > 0 && (
                        <div className="mt-10">
                            <div className="mb-4 flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                        Escolha o tamanho
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Encontre a opção ideal para a ocasião.
                                    </p>
                                </div>

                                {selectedVariant && (
                                    <span className="rounded-full bg-[#F1F4EC] px-3 py-1.5 text-xs font-semibold text-[#55624A]">
                                        {selectedVariant.name}
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {product.variants.map((variant) => {
                                    const selected =
                                        variant.id === selectedVariantId;

                                    return (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedVariantId(
                                                    variant.id,
                                                )
                                            }
                                            className={`rounded-2xl border p-4 text-left transition-all ${
                                                selected
                                                    ? "border-[#55624A] bg-[#F3F6EF] shadow-[0_8px_25px_rgba(85,98,74,0.08)]"
                                                    : "border-[#E5E7E2] bg-white hover:border-[#AEB8A3] hover:bg-[#FAFBF8]"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        {variant.name}
                                                    </p>
                                                    {variant.code && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {variant.code}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-semibold text-[#55624A]">
                                                        {variant.price.toFixed(
                                                            2,
                                                        )}{" "}
                                                        €
                                                    </p>

                                                    {selected && (
                                                        <div className="mt-1 flex justify-end">
                                                            <Check
                                                                size={15}
                                                                className="text-[#55624A]"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* COMPONENTS */}
                    {product.components?.length > 0 && (
                        <div className="mt-10">
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                    Personalize a sua composição
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Ajuste as quantidades ao seu gosto.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {product.components.map((component) => {
                                    const currentQuantity =
                                        getComponentQuantity(
                                            component.id,
                                            component.minQuantity,
                                        );

                                    const additionalUnits = Math.max(
                                        0,
                                        currentQuantity -
                                            component.minQuantity,
                                    );

                                    const additionalPrice =
                                        additionalUnits *
                                        component.customerPricePerAdditionalUnit;

                                    return (
                                        <div
                                            key={component.id}
                                            className="rounded-2xl border border-[#E5E7E2] bg-white p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-[#2F3B2A]">
                                                        {component.name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {component.minQuantity} a{" "}
                                                        {component.maxQuantity}{" "}
                                                        unidades
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-full border border-[#E2E5DF] p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateComponentQuantity(
                                                                component.id,
                                                                Math.max(
                                                                    component.minQuantity,
                                                                    currentQuantity -
                                                                        1,
                                                                ),
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F3F5EE]"
                                                        aria-label={`Diminuir ${component.name}`}
                                                    >
                                                        <Minus size={15} />
                                                    </button>

                                                    <span className="w-7 text-center text-sm font-semibold">
                                                        {currentQuantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateComponentQuantity(
                                                                component.id,
                                                                Math.min(
                                                                    component.maxQuantity,
                                                                    currentQuantity +
                                                                        1,
                                                                ),
                                                            )
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#F3F5EE]"
                                                        aria-label={`Aumentar ${component.name}`}
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {additionalPrice > 0 && (
                                                <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-xs">
                                                    <span className="text-gray-400">
                                                        Personalização
                                                    </span>
                                                    <span className="font-medium text-[#55624A]">
                                                        +{" "}
                                                        {additionalPrice.toFixed(
                                                            2,
                                                        )}{" "}
                                                        €
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* PURCHASE CARD */}
                    <div className="mt-10 rounded-[2rem] bg-[#F1F4EB] p-5 sm:p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Quantidade
                                </p>

                                <div className="mt-2 flex items-center rounded-full border border-[#DCE2D5] bg-white p-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.max(1, current - 1),
                                            )
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#F3F5EE]"
                                        aria-label="Diminuir quantidade"
                                    >
                                        <Minus size={16} />
                                    </button>

                                    <span className="w-10 text-center text-sm font-semibold text-[#2F3B2A]">
                                        {quantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((current) =>
                                                Math.min(20, current + 1),
                                            )
                                        }
                                        className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#F3F5EE]"
                                        aria-label="Aumentar quantidade"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-xs uppercase tracking-[0.12em] text-gray-400">
                                    Total
                                </p>
                                <p className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A]">
                                    {total.toFixed(2)} €
                                </p>
                            </div>
                        </div>

                        <div className="mt-5">
                            <AddToCartButton
                                product={product}
                                quantity={quantity}
                                price={unitTotal}
                                image={
                                    selectedVariant?.image?.url ??
                                    product.images?.[0]?.url ??
                                    ""
                                }
                                variantId={
                                    selectedVariantId ?? undefined
                                }
                                variantName={selectedVariant?.name}
                                components={product.components?.map(
                                    (component) => ({
                                        componentId: component.id,
                                        name: component.name,
                                        quantity:
                                            componentQuantities[
                                                component.id
                                            ] ?? component.minQuantity,
                                    }),
                                )}
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6D7567]">
                            <ShoppingBag size={14} />
                            Adicione ao carrinho e escolha a entrega no checkout
                        </div>
                    </div>

                    {/* REASSURANCE */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="flex gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-4">
                            <Clock3
                                size={18}
                                className="mt-0.5 shrink-0 text-[#55624A]"
                            />
                            <div>
                                <p className="text-sm font-semibold text-[#2F3B2A]">
                                    Preparado com cuidado
                                </p>
                                <p className="mt-1 text-xs leading-5 text-gray-400">
                                    A sua encomenda é preparada com atenção
                                    para a data escolhida.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-4">
                            <Heart
                                size={18}
                                className="mt-0.5 shrink-0 text-[#55624A]"
                            />
                            <div>
                                <p className="text-sm font-semibold text-[#2F3B2A]">
                                    Pensado para oferecer
                                </p>
                                <p className="mt-1 text-xs leading-5 text-gray-400">
                                    Uma escolha especial para surpreender
                                    alguém ou celebrar consigo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
