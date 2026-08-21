"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowRight,
    Heart,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import {
    useState,
} from "react";

type FavoriteProduct = {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string;
};

const initialFavorites: FavoriteProduct[] = [
    {
        id: 1,
        name: "Bouquet Primavera",
        category: "Bouquets",
        price: 34.90,
        image: "/products/bouquet-primavera.jpg",
    },
    {
        id: 2,
        name: "Rosas Vermelhas",
        category: "Rosas",
        price: 29.90,
        image: "/products/rosas-vermelhas.jpg",
    },
    {
        id: 3,
        name: "Bouquet Romântico",
        category: "Bouquets",
        price: 39.90,
        image: "/products/bouquet-romantico.jpg",
    },
];

export default function FavoritesPage() {
    const [favorites, setFavorites] =
        useState<FavoriteProduct[]>(
            initialFavorites,
        );

    function removeFavorite(
        productId: number,
    ) {
        setFavorites((current) =>
            current.filter(
                (product) =>
                    product.id !== productId,
            ),
        );
    }

    return (
        <main className="min-h-screen bg-[#FAFBF8]">

            {/* ================================================================ */}
            {/* PAGE                                                             */}
            {/* ================================================================ */}

            <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">

                {/* ============================================================ */}
                {/* HEADER                                                         */}
                {/* ============================================================ */}

                <div className="rounded-[2rem] bg-[#F1F4EB] px-6 py-8 sm:px-10 sm:py-10">

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">

                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#55624A] shadow-sm">

                                <Heart
                                    size={25}
                                    fill="currentColor"
                                />

                            </div>

                            <div>

                                <p className="text-sm font-medium text-[#7B876F]">
                                    Os meus favoritos
                                </p>

                                <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A] sm:text-4xl">
                                    Flores que adora
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                                    Guarde os seus produtos favoritos
                                    para os encontrar facilmente quando
                                    quiser voltar a encomendar.
                                </p>

                            </div>

                        </div>

                        {favorites.length > 0 && (
                            <div className="shrink-0 self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-[#55624A] shadow-sm sm:self-center">

                                {favorites.length === 1
                                    ? "1 favorito"
                                    : `${favorites.length} favoritos`}

                            </div>
                        )}

                    </div>

                </div>

                {/* ============================================================ */}
                {/* CONTENT                                                        */}
                {/* ============================================================ */}

                {favorites.length > 0 ? (

                    <div className="mt-10">

                        <div className="mb-5 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-[#2F3B2A]">
                                    Os seus favoritos
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Produtos que guardou para mais tarde.
                                </p>

                            </div>

                            <Link
                                href="/products"
                                className="
                                    hidden
                                    items-center
                                    gap-2
                                    text-sm
                                    font-medium
                                    text-[#55624A]
                                    transition
                                    hover:gap-3
                                    sm:inline-flex
                                "
                            >
                                Explorar produtos

                                <ArrowRight
                                    size={17}
                                />

                            </Link>

                        </div>

                        {/* ====================================================== */}
                        {/* PRODUCTS                                                 */}
                        {/* ====================================================== */}

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {favorites.map(
                                (product) => (
                                    <FavoriteCard
                                        key={
                                            product.id
                                        }
                                        product={
                                            product
                                        }
                                        onRemove={() =>
                                            removeFavorite(
                                                product.id,
                                            )
                                        }
                                    />
                                ),
                            )}

                        </div>

                        <div className="mt-8 sm:hidden">

                            <Link
                                href="/products"
                                className="
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-[#55624A]
                                    transition
                                    hover:bg-[#F5F7F2]
                                "
                            >
                                Explorar produtos

                                <ArrowRight
                                    size={17}
                                />

                            </Link>

                        </div>

                    </div>

                ) : (

                    <EmptyFavorites />

                )}

            </div>

        </main>
    );
}

/* ========================================================================== */
/* FAVORITE CARD                                                              */
/* ========================================================================== */

function FavoriteCard({
    product,
    onRemove,
}: {
    product: FavoriteProduct;
    onRemove: () => void;
}) {
    return (
        <article className="group overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            {/* ================================================================== */}
            {/* IMAGE                                                              */}
            {/* ================================================================== */}

            <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F7F2]">

                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                    "
                />

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

                {/* ============================================================== */}
                {/* REMOVE                                                           */}
                {/* ============================================================== */}

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remover ${product.name} dos favoritos`}
                    title="Remover dos favoritos"
                    className="
                        absolute
                        right-4
                        top-4
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-[#55624A]
                        shadow-md
                        transition
                        hover:bg-red-50
                        hover:text-red-500
                    "
                >
                    <Heart
                        size={18}
                        fill="currentColor"
                    />
                </button>

            </div>

            {/* ================================================================== */}
            {/* INFO                                                               */}
            {/* ================================================================== */}

            <div className="p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A957F]">
                            {product.category}
                        </p>

                        <h3 className="mt-2 truncate text-lg font-bold text-[#2F3B2A]">
                            {product.name}
                        </h3>

                    </div>

                    <span className="shrink-0 text-lg font-bold text-[#55624A]">
                        {product.price.toFixed(2)} €
                    </span>

                </div>

                {/* ============================================================== */}
                {/* ACTIONS                                                         */}
                {/* ============================================================== */}

                <div className="mt-5 flex gap-2">

                    <Link
                        href={`/products/${product.id}`}
                        className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            px-3
                            py-3
                            text-sm
                            font-semibold
                            text-[#55624A]
                            transition
                            hover:bg-[#F5F7F2]
                        "
                    >
                        Ver produto
                    </Link>

                    <button
                        type="button"
                        className="
                            flex
                            flex-1
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            bg-[#55624A]
                            px-3
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:bg-[#46523C]
                        "
                    >
                        <ShoppingBag
                            size={16}
                        />

                        Comprar
                    </button>

                </div>

            </div>

        </article>
    );
}

/* ========================================================================== */
/* EMPTY STATE                                                                */
/* ========================================================================== */

function EmptyFavorites() {
    return (
        <div className="mt-10 rounded-[2rem] border border-gray-100 bg-white px-6 py-16 shadow-sm sm:py-20">

            <div className="mx-auto flex max-w-lg flex-col items-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F4EB] text-[#55624A]">

                    <Heart
                        size={32}
                    />

                </div>

                <h2 className="mt-6 text-2xl font-bold text-[#2F3B2A]">
                    Ainda não tem favoritos
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                    Explore os nossos produtos e guarde os seus
                    favoritos para os encontrar facilmente mais tarde.
                </p>

                <Link
                    href="/products"
                    className="
                        mt-7
                        inline-flex
                        items-center
                        gap-2
                        rounded-2xl
                        bg-[#55624A]
                        px-6
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#46523C]
                    "
                >

                    <ShoppingBag
                        size={17}
                    />

                    Explorar produtos

                    <ArrowRight
                        size={17}
                    />

                </Link>

            </div>

        </div>
    );
}