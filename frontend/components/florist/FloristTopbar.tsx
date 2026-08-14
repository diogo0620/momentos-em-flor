"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
    Search,
    Bell,
    ChevronDown,
    LogOut,
} from "lucide-react";

import FloristBreadcrumb from "./FloristBreadcrumb";
import { useAuth } from "@/lib/auth/AuthProvider";

const pageTitles: Record<string, string> = {
    "/florist": "Dashboard",
    "/florist/orders": "Encomendas",
    "/florist/products": "Produtos",
    "/florist/profile": "Perfil",
};

function getRoleLabel(role: string) {
    switch (role) {
        case "FLORIST":
            return "Administrador de Florista";

        case "SYSTEM_ADMIN":
            return "Administrador";

        case "CUSTOMER":
            return "Cliente";

        default:
            return role;
    }
}

export default function FloristTopbar() {
    const pathname = usePathname();
    const router = useRouter();

    const { user, logout } = useAuth();

    const [isUserMenuOpen, setIsUserMenuOpen] =
        useState(false);

    const pageTitle = useMemo(() => {
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }

        const match = Object.keys(
            pageTitles,
        ).find((key) =>
            pathname.startsWith(key),
        );

        return match
            ? pageTitles[match]
            : "Portal da Florista";
    }, [pathname]);

    async function handleLogout() {
        setIsUserMenuOpen(false);

        try {
            await logout();
        } finally {
            router.replace("/login");
        }
    }

    const userInitial =
        user?.firstName
            ?.charAt(0)
            .toUpperCase() ?? "U";

    return (
        <header
            className="
                sticky
                top-0
                z-50
                flex
                h-20
                items-center
                justify-between
                border-b
                border-gray-200
                bg-white/90
                px-8
                backdrop-blur-md
            "
        >

            {/* LEFT */}

            <div>

                <FloristBreadcrumb />

                <h1 className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                    {pageTitle}
                </h1>

            </div>

            {/* CENTER */}

            <div className="hidden w-full max-w-xl px-10 xl:block">

                <div className="relative">

                    <Search
                        size={18}
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        placeholder="Pesquisar..."
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-[#F8F9F5]
                            py-3
                            pl-11
                            pr-4
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:bg-white
                        "
                    />

                </div>

            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-5">

                {/* NOTIFICATIONS */}

                <button
                    type="button"
                    className="
                        relative
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        transition
                        hover:bg-[#F3F5EE]
                    "
                >
                    <Bell size={20} />

                    <span
                        className="
                            absolute
                            right-2
                            top-2
                            h-2
                            w-2
                            rounded-full
                            bg-red-500
                        "
                    />

                </button>

                {/* USER */}

                <div className="relative">

                    <button
                        type="button"
                        onClick={() =>
                            setIsUserMenuOpen(
                                (current) =>
                                    !current,
                            )
                        }
                        className="
                            flex
                            items-center
                            gap-3
                            rounded-2xl
                            p-2
                            transition
                            hover:bg-[#F5F7F2]
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                bg-[#55624A]
                                text-lg
                                font-semibold
                                text-white
                            "
                        >
                            {userInitial}
                        </div>

                        <div className="hidden text-left lg:block">

                            <p className="font-semibold text-[#2F3B2A]">
                                {user
                                    ? `${user.firstName} ${user.lastName}`
                                    : "Utilizador"}
                            </p>

                            <p className="text-sm text-gray-500">
                                {user
                                    ? getRoleLabel(
                                          user.role,
                                      )
                                    : ""}
                            </p>

                        </div>

                        <ChevronDown
                            size={18}
                            className={`
                                text-gray-400
                                transition-transform
                                ${
                                    isUserMenuOpen
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />

                    </button>

                    {/* DROPDOWN */}

                    {isUserMenuOpen && (
                        <div
                            className="
                                absolute
                                right-0
                                top-full
                                mt-3
                                w-72
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
                                    {user
                                        ? `${user.firstName} ${user.lastName}`
                                        : "Utilizador"}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {user?.email}
                                </p>

                                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#55624A]">
                                    {user
                                        ? getRoleLabel(
                                              user.role,
                                          )
                                        : ""}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-5
                                    py-4
                                    text-left
                                    text-sm
                                    font-medium
                                    text-red-600
                                    transition
                                    hover:bg-red-50
                                "
                            >
                                <LogOut size={18} />

                                Terminar sessão
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
}