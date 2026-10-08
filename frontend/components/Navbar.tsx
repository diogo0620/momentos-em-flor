"use client";

import Link from "next/link";
import Image from "next/image";

import {
    Heart,
    ShoppingBag,
    Search,
    Menu,
    X,
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";

import { useState } from "react";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/auth/AuthProvider";

const menuItems = [
    "Bouquets",
    "Rosas",
    "Romântico",
    "Casamentos",
    "Condolências",
];

export default function Navbar() {
    const { items } = useCart();

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
    } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout() {
        try {
            setIsLoggingOut(true);
            setAccountOpen(false);
            setMobileOpen(false);

            await logout();
        } finally {
            setIsLoggingOut(false);
        }
    }

    function closeMobile() {
        setMobileOpen(false);
    }

    return (
        <>
            <nav className="sticky top-0 z-[9999] border-b border-[#E8EBE4] bg-white/95 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid h-[76px] grid-cols-[1fr_auto_1fr] items-center lg:h-[88px]">

                        {/* MOBILE MENU */}

                        <div className="flex lg:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setMobileOpen((current) => !current)
                                }
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#35412F]
                                    transition
                                    duration-200
                                    hover:bg-[#F3F5EE]
                                    hover:text-[#55624A]
                                "
                                aria-label={
                                    mobileOpen
                                        ? "Fechar menu"
                                        : "Abrir menu"
                                }
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen ? (
                                    <X
                                        size={21}
                                        strokeWidth={1.8}
                                    />
                                ) : (
                                    <Menu
                                        size={21}
                                        strokeWidth={1.8}
                                    />
                                )}
                            </button>
                        </div>

                        {/* LOGO */}

                        <div className="flex justify-start">
                            <Link
                                href="/"
                                className="group flex items-center"
                                onClick={closeMobile}
                            >
                                <Image
                                    src="/logo.svg"
                                    alt="Momentos em Flor"
                                    width={220}
                                    height={80}
                                    className="
                                        h-12
                                        w-auto
                                        object-contain
                                        transition-transform
                                        duration-300
                                        group-hover:scale-[1.02]
                                        sm:h-14
                                        lg:h-16
                                    "
                                    priority
                                />
                            </Link>
                        </div>

                        {/* DESKTOP MENU */}

                        <div className="hidden items-center justify-center gap-7 lg:flex xl:gap-9">
                            {menuItems.map((item) => (
                                <Link
                                    key={item}
                                    href="/products"
                                    className="
                                        group
                                        relative
                                        flex
                                        h-10
                                        items-center
                                        text-[13px]
                                        font-semibold
                                        tracking-[0.01em]
                                        text-[#4B5547]
                                        transition-colors
                                        duration-200
                                        hover:text-[#55624A]
                                    "
                                >
                                    {item}

                                    <span
                                        className="
                                            absolute
                                            bottom-0
                                            left-1/2
                                            h-[1.5px]
                                            w-0
                                            -translate-x-1/2
                                            rounded-full
                                            bg-[#55624A]
                                            transition-all
                                            duration-300
                                            group-hover:w-full
                                        "
                                    />
                                </Link>
                            ))}
                        </div>

                        {/* ACTIONS */}

                        <div className="flex items-center justify-end gap-1 sm:gap-2">

                            {/* SEARCH */}

                            <Link
                                href="/products"
                                aria-label="Pesquisar"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#35412F]
                                    transition-all
                                    duration-200
                                    hover:bg-[#F3F5EE]
                                    hover:text-[#55624A]
                                "
                            >
                                <Search
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </Link>

                            {/* FAVORITES */}

                            <Link
                                href="/favorites"
                                aria-label="Favoritos"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#35412F]
                                    transition-all
                                    duration-200
                                    hover:bg-[#F3F5EE]
                                    hover:text-[#55624A]
                                "
                            >
                                <Heart
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </Link>

                            {/* CART */}

                            <Link
                                href="/cart"
                                aria-label="Carrinho"
                                className="
                                    relative
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    text-[#35412F]
                                    transition-all
                                    duration-200
                                    hover:bg-[#F3F5EE]
                                    hover:text-[#55624A]
                                "
                            >
                                <ShoppingBag
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                {items.length > 0 && (
                                    <span
                                        className="
                                            absolute
                                            right-0
                                            top-0
                                            flex
                                            h-[17px]
                                            min-w-[17px]
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-[#55624A]
                                            px-1
                                            text-[9px]
                                            font-semibold
                                            text-white
                                            ring-2
                                            ring-white
                                        "
                                    >
                                        {items.length}
                                    </span>
                                )}
                            </Link>

                            {/* SEPARATOR */}

                            <div className="ml-1 hidden h-7 w-px bg-[#E5E8E1] sm:block" />

                            {/* ACCOUNT */}

                            {isLoading ? (
                                <div
                                    className="
                                        hidden
                                        h-10
                                        w-20
                                        animate-pulse
                                        rounded-full
                                        bg-[#F3F5EE]
                                        sm:block
                                    "
                                />
                            ) : isAuthenticated && user ? (
                                <div className="relative hidden sm:block">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAccountOpen(
                                                (current) => !current,
                                            )
                                        }
                                        className="
                                            flex
                                            h-10
                                            items-center
                                            gap-2
                                            rounded-full
                                            px-1.5
                                            transition
                                            duration-200
                                            hover:bg-[#F3F5EE]
                                        "
                                        aria-label="Conta"
                                        aria-expanded={accountOpen}
                                    >
                                        {/* AVATAR */}

                                        <span
                                            className="
                                                flex
                                                h-8
                                                w-8
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#D6DEC8]
                                                text-xs
                                                font-semibold
                                                text-[#55624A]
                                            "
                                        >
                                            {user.firstName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>

                                        {/* NAME */}

                                        <span
                                            className="
                                                hidden
                                                max-w-24
                                                truncate
                                                text-sm
                                                font-medium
                                                text-[#35412F]
                                                xl:block
                                            "
                                        >
                                            {user.firstName}
                                        </span>

                                        <ChevronDown
                                            size={14}
                                            className={`
                                                text-[#8B9484]
                                                transition-transform
                                                duration-200
                                                ${
                                                    accountOpen
                                                        ? "rotate-180"
                                                        : ""
                                                }
                                            `}
                                        />
                                    </button>

                                    {/* ACCOUNT DROPDOWN */}

                                    {accountOpen && (
                                        <div
                                            className="
                                                absolute
                                                right-0
                                                top-12
                                                z-50
                                                w-64
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-[#E6E9E2]
                                                bg-white
                                                shadow-[0_20px_50px_rgba(47,59,42,0.12)]
                                            "
                                        >
                                            {/* USER INFO */}

                                            <div className="border-b border-[#EEF0EB] px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
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
                                                    </span>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-[#2F3B2A]">
                                                            {user.firstName}{" "}
                                                            {user.lastName}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-gray-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* MENU */}

                                            <div className="p-2">

                                                <Link
                                                    href="/account"
                                                    onClick={() =>
                                                        setAccountOpen(false)
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
                                                        size={17}
                                                        strokeWidth={1.8}
                                                    />

                                                    Minha conta
                                                </Link>

                                                <Link
                                                    href="/account/orders"
                                                    onClick={() =>
                                                        setAccountOpen(false)
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
                                                    <ShoppingBag
                                                        size={17}
                                                        strokeWidth={1.8}
                                                    />

                                                    As minhas encomendas
                                                </Link>

                                                <div className="my-1 border-t border-[#EEF0EB]" />

                                                <button
                                                    type="button"
                                                    disabled={isLoggingOut}
                                                    onClick={handleLogout}
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
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-50
                                                    "
                                                >
                                                    <LogOut
                                                        size={17}
                                                        strokeWidth={1.8}
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
                                        hidden
                                        h-10
                                        items-center
                                        gap-2
                                        rounded-full
                                        bg-[#55624A]
                                        px-4
                                        text-sm
                                        font-semibold
                                        text-white
                                        transition
                                        duration-200
                                        hover:bg-[#46523D]
                                        sm:flex
                                    "
                                >
                                    <User
                                        size={17}
                                        strokeWidth={1.8}
                                    />

                                    Entrar
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* MOBILE MENU */}

                {mobileOpen && (
                    <div className="border-t border-[#E8EBE4] bg-white lg:hidden">
                        <div className="mx-auto max-w-7xl px-5 pb-6 pt-4 sm:px-6">

                            {/* TITLE */}

                            <div className="mb-3 px-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9AA394]">
                                    Descobrir
                                </p>
                            </div>

                            {/* LINKS */}

                            <div className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item}
                                        href="/products"
                                        onClick={closeMobile}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            rounded-xl
                                            px-3
                                            py-3.5
                                            text-[15px]
                                            font-medium
                                            text-[#35412F]
                                            transition
                                            hover:bg-[#F5F7F2]
                                        "
                                    >
                                        {item}

                                        <span className="text-[#A3AA9D]">
                                            →
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            {/* ACCOUNT */}

                            <div className="mt-4 border-t border-[#EEF0EB] pt-4">

                                {isLoading ? (
                                    <div className="h-12 animate-pulse rounded-xl bg-[#F5F7F2]" />
                                ) : isAuthenticated && user ? (
                                    <div className="space-y-2">

                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                bg-[#F5F7F2]
                                                px-4
                                                py-3
                                            "
                                        >
                                            <span
                                                className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-[#D6DEC8]
                                                    text-xs
                                                    font-semibold
                                                    text-[#55624A]
                                                "
                                            >
                                                {user.firstName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[#35412F]">
                                                    {user.firstName}{" "}
                                                    {user.lastName}
                                                </p>

                                                <p className="truncate text-xs text-[#8B9484]">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href="/account"
                                            onClick={closeMobile}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-4
                                                py-3
                                                text-sm
                                                font-medium
                                                text-[#55624A]
                                                transition
                                                hover:bg-[#F5F7F2]
                                            "
                                        >
                                            <User
                                                size={17}
                                                strokeWidth={1.8}
                                            />

                                            Minha conta
                                        </Link>

                                        <Link
                                            href="/account/orders"
                                            onClick={closeMobile}
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-4
                                                py-3
                                                text-sm
                                                font-medium
                                                text-[#55624A]
                                                transition
                                                hover:bg-[#F5F7F2]
                                            "
                                        >
                                            <ShoppingBag
                                                size={17}
                                                strokeWidth={1.8}
                                            />

                                            As minhas encomendas
                                        </Link>

                                        <button
                                            type="button"
                                            disabled={isLoggingOut}
                                            onClick={handleLogout}
                                            className="
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-4
                                                py-3
                                                text-sm
                                                font-medium
                                                text-gray-500
                                                transition
                                                hover:bg-red-50
                                                hover:text-red-600
                                                disabled:opacity-50
                                            "
                                        >
                                            <LogOut
                                                size={17}
                                                strokeWidth={1.8}
                                            />

                                            {isLoggingOut
                                                ? "A terminar sessão..."
                                                : "Terminar sessão"}
                                        </button>

                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={closeMobile}
                                        className="
                                            flex
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            bg-[#55624A]
                                            px-4
                                            py-3.5
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-[#46523D]
                                        "
                                    >
                                        <User
                                            size={17}
                                            strokeWidth={1.8}
                                        />

                                        Entrar na minha conta
                                    </Link>
                                )}
                            </div>

                            {/* MOBILE ACTIONS */}

                            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#EEF0EB] pt-4">

                                <Link
                                    href="/favorites"
                                    onClick={closeMobile}
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-[#F5F7F2]
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        text-[#55624A]
                                    "
                                >
                                    <Heart
                                        size={16}
                                        strokeWidth={1.8}
                                    />

                                    Favoritos
                                </Link>

                                <Link
                                    href="/cart"
                                    onClick={closeMobile}
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-[#55624A]
                                        px-4
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-white
                                    "
                                >
                                    <ShoppingBag
                                        size={16}
                                        strokeWidth={1.8}
                                    />

                                    Carrinho

                                    {items.length > 0 && (
                                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
                                            {items.length}
                                        </span>
                                    )}
                                </Link>

                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}