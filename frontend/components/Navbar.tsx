"use client";

import Link from "next/link";
import Image from "next/image";

import {
    Heart,
    ShoppingBag,
    Search,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";

import { useState } from "react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function Navbar() {
    const { items } = useCart();

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
    } = useAuth();

    const [accountOpen, setAccountOpen] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    async function handleLogout() {
        try {
            setIsLoggingOut(true);
            setAccountOpen(false);

            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <nav
            className="
                sticky
                top-0
                z-[9999]
                border-b
                border-gray-100
                bg-white/90
                shadow-[0_4px_20px_rgba(0,0,0,0.04)]
                backdrop-blur-md
            "
        >
            <div className="mx-auto max-w-7xl px-6">

                <div className="grid h-24 grid-cols-3 items-center">

                    {/* LOGO */}

                    <div className="flex justify-start">

                        <Link
                            href="/"
                            className="shrink-0"
                        >
                            <Image
                                src="/logo.svg"
                                alt="Momentos em Flor"
                                width={220}
                                height={80}
                                className="h-16 w-auto object-contain"
                                priority
                            />
                        </Link>

                    </div>

                    {/* MENU */}

                    <div className="hidden items-center justify-center gap-8 lg:flex">

                        {[
                            "Bouquets",
                            "Rosas",
                            "Romântico",
                            "Casamentos",
                            "Condolências",
                        ].map((item) => (
                            <Link
                                key={item}
                                href="/products"
                                className="
                                    group
                                    relative
                                    text-lg
                                    font-semibold
                                    text-gray-700
                                    transition-colors
                                    duration-300
                                    hover:text-[#55624A]
                                "
                            >
                                {item}

                                <span
                                    className="
                                        absolute
                                        -bottom-2
                                        left-0
                                        h-[2px]
                                        w-0
                                        bg-[#55624A]
                                        transition-all
                                        duration-300
                                        group-hover:w-full
                                    "
                                />
                            </Link>
                        ))}

                    </div>

                    {/* ICONS */}

                    <div className="flex items-center justify-end gap-2">

                        {/* SEARCH */}

                        <button
                            type="button"
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                transition-all
                                duration-300
                                hover:scale-110
                                hover:bg-[#F3F5EE]
                            "
                            aria-label="Pesquisar"
                        >
                            <Search
                                size={22}
                                strokeWidth={1.8}
                            />
                        </button>

                        {/* FAVORITES */}

                        <Link
                            href="/favorites"
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                transition-all
                                duration-300
                                hover:scale-110
                                hover:bg-[#F3F5EE]
                            "
                            aria-label="Favoritos"
                        >
                            <Heart
                                size={22}
                                strokeWidth={1.8}
                            />
                        </Link>

                        {/* CART */}

                        <Link
                            href="/cart"
                            className="
                                relative
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                transition-all
                                duration-300
                                hover:scale-110
                                hover:bg-[#F3F5EE]
                            "
                            aria-label="Carrinho"
                        >
                            <ShoppingBag
                                size={22}
                                strokeWidth={1.8}
                            />

                            {items.length > 0 && (
                                <span
                                    className="
                                        absolute
                                        -right-1
                                        -top-1
                                        flex
                                        h-5
                                        w-5
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#55624A]
                                        text-xs
                                        font-medium
                                        text-white
                                    "
                                >
                                    {items.length}
                                </span>
                            )}

                        </Link>

                        {/* ACCOUNT */}

                        {isLoading ? (
                            <div
                                className="
                                    h-11
                                    w-11
                                    animate-pulse
                                    rounded-full
                                    bg-[#F3F5EE]
                                "
                            />
                        ) : isAuthenticated &&
                          user ? (
                            <div className="relative">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setAccountOpen(
                                            (open) =>
                                                !open,
                                        )
                                    }
                                    className="
                                        flex
                                        h-11
                                        items-center
                                        gap-2
                                        rounded-full
                                        px-3
                                        transition-all
                                        duration-300
                                        hover:bg-[#F3F5EE]
                                    "
                                    aria-label="Conta"
                                    aria-expanded={
                                        accountOpen
                                    }
                                >

                                    <div
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#D6DEC8]
                                            text-sm
                                            font-semibold
                                            text-[#55624A]
                                        "
                                    >
                                        {user.firstName
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>

                                    <span className="hidden max-w-24 truncate text-sm font-medium text-[#2F3B2A] xl:block">
                                        Olá,{" "}
                                        {
                                            user.firstName
                                        }
                                    </span>

                                    <ChevronDown
                                        size={16}
                                        className={`
                                            hidden
                                            text-gray-400
                                            transition-transform
                                            xl:block
                                            ${
                                                accountOpen
                                                    ? "rotate-180"
                                                    : ""
                                            }
                                        `}
                                    />

                                </button>

                                {accountOpen && (
                                    <div
                                        className="
                                            absolute
                                            right-0
                                            top-14
                                            z-50
                                            w-64
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-gray-100
                                            bg-white
                                            shadow-xl
                                        "
                                    >

                                        <div className="border-b border-gray-100 px-5 py-4">

                                            <p className="font-semibold text-[#2F3B2A]">
                                                {
                                                    user.firstName
                                                }{" "}
                                                {
                                                    user.lastName
                                                }
                                            </p>

                                            <p className="mt-1 truncate text-sm text-gray-400">
                                                {
                                                    user.email
                                                }
                                            </p>

                                        </div>

                                        <div className="p-2">

                                            <Link
                                                href="/account"
                                                onClick={() =>
                                                    setAccountOpen(
                                                        false,
                                                    )
                                                }
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-gray-700
                                                    transition
                                                    hover:bg-[#F5F7F2]
                                                    hover:text-[#55624A]
                                                "
                                            >
                                                <User
                                                    size={18}
                                                />

                                                Minha conta
                                            </Link>

                                            <button
                                                type="button"
                                                disabled={
                                                    isLoggingOut
                                                }
                                                onClick={
                                                    handleLogout
                                                }
                                                className="
                                                    flex
                                                    w-full
                                                    items-center
                                                    gap-3
                                                    rounded-xl
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-gray-600
                                                    transition
                                                    hover:bg-red-50
                                                    hover:text-red-600
                                                    disabled:opacity-50
                                                "
                                            >
                                                <LogOut
                                                    size={18}
                                                />

                                                {isLoggingOut
                                                    ? "A terminar sessão..."
                                                    : "Terminar sessão"}
                                            </button>

                                        </div>

                                    </div>
                                )}

                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="
                                    flex
                                    h-11
                                    items-center
                                    gap-2
                                    rounded-full
                                    bg-[#55624A]
                                    px-5
                                    text-sm
                                    font-medium
                                    text-white
                                    transition
                                    hover:opacity-90
                                "
                            >
                                <User size={18} />

                                Entrar
                            </Link>
                        )}

                        

                    </div>

                </div>

            </div>
        </nav>
    );
}