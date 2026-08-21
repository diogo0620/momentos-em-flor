"use client";

import Image from "next/image";
import Link from "next/link";

import {
    ArrowLeft,
    LogOut,
    UserRound,
} from "lucide-react";

import {
    useAuth,
} from "@/lib/auth/AuthProvider";

export default function AccountTopBar() {
    const {
        user,
        logout,
    } = useAuth();

    return (
        <header className="border-b border-gray-100 bg-white">
            <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 lg:px-8">

                {/* ========================================================== */}
                {/* LOGO                                                         */}
                {/* ========================================================== */}

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

                {/* ========================================================== */}
                {/* RIGHT SIDE                                                   */}
                {/* ========================================================== */}

                <div className="flex items-center gap-5">

                    {/* ====================================================== */}
                    {/* BACK TO WEBSITE                                        */}
                    {/* ====================================================== */}

                    <Link
                        href="/"
                        className="
                            hidden
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-medium
                            text-gray-500
                            transition
                            hover:bg-[#F5F7F2]
                            hover:text-[#55624A]
                            sm:inline-flex
                        "
                    >
                        <ArrowLeft
                            size={16}
                        />

                        Voltar ao site

                    </Link>

                    {/* ====================================================== */}
                    {/* USER                                                     */}
                    {/* ====================================================== */}

                    {user && (
                        <div className="hidden text-right md:block">

                            <p className="text-sm font-semibold text-[#2F3B2A]">
                                {user.firstName}{" "}
                                {user.lastName}
                            </p>

                            <p className="text-xs text-gray-400">
                                {user.email}
                            </p>

                        </div>
                    )}

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                        <UserRound
                            size={19}
                        />
                    </div>

                    {/* ====================================================== */}
                    {/* LOGOUT                                                   */}
                    {/* ====================================================== */}

                    <button
                        type="button"
                        onClick={logout}
                        title="Terminar sessão"
                        aria-label="Terminar sessão"
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            text-gray-400
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                        "
                    >
                        <LogOut
                            size={18}
                        />
                    </button>

                </div>

            </div>

            {/* ============================================================== */}
            {/* MOBILE BACK TO WEBSITE                                         */}
            {/* ============================================================== */}

            <div className="border-t border-gray-100 px-6 py-3 sm:hidden">

                <Link
                    href="/"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-[#55624A]
                    "
                >
                    <ArrowLeft
                        size={16}
                    />

                    Voltar ao site

                </Link>

            </div>

        </header>
    );
}