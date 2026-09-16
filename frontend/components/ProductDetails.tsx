"use client";

import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Check,
} from "lucide-react";
import { useMemo, useState } from "react";

import AddToCartButton from "@/components/store/AddToCartButton";
import type { ProductDetail } from "@/types/product";
import WishlistButton from "./wishlist/WishlistButton";

type Props = {
    product: ProductDetail;
};

export default function ProductDetails({
    product,
}: Props) {
    const [quantity, setQuantity] = useState(1);

    const [selectedVariantId, setSelectedVariantId] =
        useState<number | null>(
            product.variants?.length
                ? product.variants[0].id
                : null,
        );

    const [componentQuantities, setComponentQuantities] =
        useState<Record<number, number>>({});

    const [selectedImage, setSelectedImage] =
        useState(0);

    /*
     * ============================================================
     * VARIANT
     * ============================================================
     */

    const selectedVariant = useMemo(() => {
        if (!selectedVariantId) {
            return null;
        }

        return (
            product.variants?.find(
                (variant) =>
                    variant.id === selectedVariantId,
            ) ?? null
        );
    }, [
        product.variants,
        selectedVariantId,
    ]);

    /*
     * ============================================================
     * PRICE
     * ============================================================
     */

    const unitPrice =
        selectedVariant?.price ??
        product.price;

    /*
     * ============================================================
     * COMPONENTS
     * ============================================================
     */

    const componentsTotal = useMemo(() => {
        if (!product.components?.length) {
            return 0;
        }

        return product.components.reduce(
            (total, component) => {
                const currentQuantity =
                    componentQuantities[
                        component.id
                    ] ??
                    component.recommendedQuantity;

                const additionalUnits =
                    Math.max(
                        0,
                        currentQuantity -
                            component.minQuantity,
                    );

                return (
                    total +
                    additionalUnits *
                        component.customerPricePerAdditionalUnit
                );
            },
            0,
        );
    }, [
        product.components,
        componentQuantities,
    ]);

    const unitTotal =
        unitPrice + componentsTotal;

    const total =
        unitTotal * quantity;

    /*
     * ============================================================
     * IMAGES
     * ============================================================
     */

    const images = product.images ?? [];

    const hasImages = images.length > 0;

    const currentImage =
        images[selectedImage];

    const nextImage = () => {
        if (!images.length) return;

        setSelectedImage(
            (current) =>
                (current + 1) %
                images.length,
        );
    };

    const previousImage = () => {
        if (!images.length) return;

        setSelectedImage(
            (current) =>
                (current - 1 + images.length) %
                images.length,
        );
    };

    /*
     * ============================================================
     * COMPONENT QUANTITY
     * ============================================================
     */

    const getComponentQuantity = (
        componentId: number,
        recommendedQuantity: number,
    ) =>
        componentQuantities[
            componentId
        ] ?? recommendedQuantity;

    const updateComponentQuantity = (
        componentId: number,
        value: number,
    ) => {
        setComponentQuantities(
            (current) => ({
                ...current,
                [componentId]: value,
            }),
        );
    };

    return (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
            {/* ==================================================
                LEFT — GALLERY
            ================================================== */}

            <div className="lg:sticky lg:top-24 lg:self-start">
                <div
                    className="
                        group
                        relative
                        overflow-hidden
                        rounded-[2rem]
                        bg-[#F6F7F1]
                    "
                >
                    <div className="aspect-[4/5]">
                        {hasImages ? (
                            <img
                                src={currentImage.url}
                                alt={product.name}
                                className="
                                    h-full
                                    w-full
                                    object-cover
                                    transition
                                    duration-500
                                    group-hover:scale-[1.02]
                                "
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <span className="text-[100px]">
                                    🌸
                                </span>
                            </div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={previousImage}
                                className="
                                    absolute
                                    left-5
                                    top-1/2
                                    flex
                                    h-11
                                    w-11
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/90
                                    text-[#2F3B2A]
                                    shadow-lg
                                    backdrop-blur
                                    transition
                                    hover:scale-105
                                "
                                aria-label="Imagem anterior"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <button
                                type="button"
                                onClick={nextImage}
                                className="
                                    absolute
                                    right-5
                                    top-1/2
                                    flex
                                    h-11
                                    w-11
                                    -translate-y-1/2
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white/90
                                    text-[#2F3B2A]
                                    shadow-lg
                                    backdrop-blur
                                    transition
                                    hover:scale-105
                                "
                                aria-label="Próxima imagem"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}

                    {images.length > 1 && (
                        <div
                            className="
                                absolute
                                bottom-5
                                left-1/2
                                flex
                                -translate-x-1/2
                                gap-1.5
                                rounded-full
                                bg-black/20
                                px-3
                                py-2
                                backdrop-blur
                            "
                        >
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() =>
                                        setSelectedImage(index)
                                    }
                                    className={`
                                        h-1.5
                                        rounded-full
                                        transition-all
                                        ${
                                            selectedImage ===
                                            index
                                                ? "w-6 bg-white"
                                                : "w-1.5 bg-white/60"
                                        }
                                    `}
                                    aria-label={`Ver imagem ${
                                        index + 1
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* THUMBNAILS */}

                {images.length > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() =>
                                    setSelectedImage(index)
                                }
                                className={`
                                    relative
                                    h-20
                                    w-20
                                    shrink-0
                                    overflow-hidden
                                    rounded-xl
                                    transition
                                    ${
                                        selectedImage === index
                                            ? "ring-2 ring-[#55624A] ring-offset-2"
                                            : "opacity-70 hover:opacity-100"
                                    }
                                `}
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

            {/* ==================================================
                RIGHT — PRODUCT INFO
            ================================================== */}

            <div>
                {/* CATEGORY */}

                <span
                    className="
                        inline-flex
                        rounded-full
                        bg-[#D6DEC8]
                        px-4
                        py-2
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wide
                        text-[#55624A]
                    "
                >
                    {product.category.name}
                </span>

                {/* NAME */}

                <div className="mt-5 flex items-start justify-between gap-5">
    <h1
        className="
            text-4xl
            font-semibold
            tracking-tight
            text-[#263020]
            sm:text-5xl
        "
    >
        {product.name}
    </h1>

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

                {/* DESCRIPTION */}

                <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
                    {product.description ??
                        "Flores frescas preparadas por floristas locais para tornar os seus momentos especiais."}
                </p>

                {/* PRICE */}

                <div className="mt-7 flex items-end gap-3">
                    <span className="text-3xl font-bold text-[#55624A]">
                        {unitTotal.toFixed(2)} €
                    </span>

                    {componentsTotal > 0 && (
                        <span className="mb-1 text-sm text-gray-400">
                            preço por unidade
                        </span>
                    )}
                </div>

                {/* FEATURES */}

                <div className="mt-7 grid gap-3 border-y border-gray-100 py-6 sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check
                            size={16}
                            className="text-[#55624A]"
                        />
                        Flores frescas
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check
                            size={16}
                            className="text-[#55624A]"
                        />
                        Entrega local
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check
                            size={16}
                            className="text-[#55624A]"
                        />
                        Preparado no dia
                    </div>
                </div>

                {/* ==================================================
                    VARIANTS
                ================================================== */}

                {product.variants?.length > 0 && (
                    <div className="mt-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-semibold text-[#2F3B2A]">
                                Escolha o tamanho
                            </h2>

                            {selectedVariant && (
                                <span className="text-sm text-gray-400">
                                    {selectedVariant.name}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {product.variants.map(
                                (variant) => {
                                    const selected =
                                        variant.id ===
                                        selectedVariantId;

                                    return (
                                        <button
                                            key={variant.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedVariantId(
                                                    variant.id,
                                                )
                                            }
                                            className={`
                                                rounded-2xl
                                                border
                                                p-4
                                                text-left
                                                transition-all
                                                ${
                                                    selected
                                                        ? "border-[#55624A] bg-[#F5F7F0] shadow-sm"
                                                        : "border-gray-200 hover:border-[#AEB8A3] hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        {
                                                            variant.name
                                                        }
                                                    </p>

                                                    {variant.code && (
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {
                                                                variant.code
                                                            }
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
                                },
                            )}
                        </div>
                    </div>
                )}

                {/* ==================================================
                    COMPONENTS
                ================================================== */}

                {product.components?.length > 0 && (
                    <div className="mt-9">
                        <div className="mb-4">
                            <h2 className="font-semibold text-[#2F3B2A]">
                                Personalize o seu bouquet
                            </h2>

                            <p className="mt-1 text-sm text-gray-400">
                                Ajuste as quantidades ao seu gosto.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {product.components.map(
                                (component) => {
                                    const currentQuantity =
                                        getComponentQuantity(
                                            component.id,
                                            component.recommendedQuantity,
                                        );

                                    const additionalUnits =
                                        Math.max(
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
                                            className="
                                                rounded-2xl
                                                border
                                                border-gray-200
                                                p-4
                                            "
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-medium text-[#2F3B2A]">
                                                        {
                                                            component.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        {
                                                            component.minQuantity
                                                        }{" "}
                                                        a{" "}
                                                        {
                                                            component.maxQuantity
                                                        }{" "}
                                                        unidades
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 rounded-full border border-gray-200 p-1">
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
                                                        className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            transition
                                                            hover:bg-[#F3F5EE]
                                                        "
                                                    >
                                                        <Minus size={15} />
                                                    </button>

                                                    <span className="w-7 text-center text-sm font-semibold">
                                                        {
                                                            currentQuantity
                                                        }
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
                                                        className="
                                                            flex
                                                            h-8
                                                            w-8
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            transition
                                                            hover:bg-[#F3F5EE]
                                                        "
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {additionalPrice > 0 && (
                                                <div className="mt-3 flex justify-between text-xs">
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
                                },
                            )}
                        </div>
                    </div>
                )}

                {/* ==================================================
                    QUANTITY
                ================================================== */}

                <div className="mt-9">
                    <label className="mb-3 block font-semibold text-[#2F3B2A]">
                        Quantidade
                    </label>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center rounded-full border border-gray-200 p-1">
                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity(
                                        (current) =>
                                            Math.max(
                                                1,
                                                current - 1,
                                            ),
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    transition
                                    hover:bg-[#F3F5EE]
                                "
                            >
                                <Minus size={16} />
                            </button>

                            <span className="w-10 text-center text-sm font-semibold">
                                {quantity}
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setQuantity(
                                        (current) =>
                                            Math.min(
                                                20,
                                                current + 1,
                                            ),
                                    )
                                }
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    transition
                                    hover:bg-[#F3F5EE]
                                "
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    PURCHASE CARD
                ================================================== */}

                <div
                    className="
                        mt-9
                        rounded-[1.75rem]
                        bg-[#F3F5EE]
                        p-5
                        sm:p-6
                    "
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total
                            </p>

                            <p className="mt-1 text-3xl font-bold text-[#2F3B2A]">
                                {total.toFixed(2)} €
                            </p>
                        </div>

                        <div className="text-right text-xs text-gray-400">
                            <p>
                                {quantity}{" "}
                                {quantity === 1
                                    ? "unidade"
                                    : "unidades"}
                            </p>

                            <p className="mt-1">
                                {unitTotal.toFixed(2)} €
                                {" / unidade"}
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
        selectedVariantId ??
        undefined
    }
    variantName={
        selectedVariant?.name
    }
    components={product.components?.map(
        (component) => ({
            componentId: component.id,
            name: component.name,
            quantity:
                componentQuantities[
                    component.id
                ] ??
                component.recommendedQuantity,
        }),
    )}
/>
                    </div>

                    <p className="mt-3 text-center text-xs text-gray-400">
                        Entrega preparada por um florista local
                    </p>
                </div>
            </div>
        </div>
    );
}

