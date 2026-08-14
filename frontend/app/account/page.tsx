"use client";

import Link from "next/link";
import {
    User,
    Mail,
    Package,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";

export default function AccountPage() {
    const {
        user,
        isAuthenticated,
        isLoading,
    } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <p className="text-gray-500">
                    A carregar...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

                <h2 className="text-2xl font-bold text-[#2F3B2A]">
                    A sua conta
                </h2>

                <p className="mt-3 text-gray-500">
                    Inicie sessão para consultar a sua conta.
                </p>

                <Link
                    href="/login"
                    className="
                        mt-6
                        inline-flex
                        rounded-full
                        bg-[#55624A]
                        px-8
                        py-4
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    Iniciar sessão
                </Link>

            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* PERFIL */}

            <div className="rounded-3xl bg-white p-7 shadow-sm">

                <div className="flex items-center gap-4">

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[#D6DEC8]
                            text-[#55624A]
                        "
                    >
                        <User size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#2F3B2A]">
                            Dados pessoais
                        </h2>

                        <p className="text-sm text-gray-400">
                            Informação da sua conta
                        </p>
                    </div>

                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">

                    <div className="flex items-start gap-4">

                        <User
                            size={20}
                            className="mt-0.5 text-gray-400"
                        />

                        <div>
                            <p className="text-xs text-gray-400">
                                Nome
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                                {user.firstName}{" "}
                                {user.lastName}
                            </p>
                        </div>

                    </div>

                    <div className="flex items-start gap-4">

                        <Mail
                            size={20}
                            className="mt-0.5 text-gray-400"
                        />

                        <div>
                            <p className="text-xs text-gray-400">
                                Email
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                                {user.email}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* ENCOMENDAS */}

            <div className="rounded-3xl bg-white p-7 shadow-sm">

                <div className="flex items-center gap-4">

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-[#D6DEC8]
                            text-[#55624A]
                        "
                    >
                        <Package size={22} />
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-[#2F3B2A]">
                            Encomendas
                        </h2>

                        <p className="text-sm text-gray-400">
                            Consulte o seu histórico de encomendas.
                        </p>
                    </div>

                </div>

                <Link
                    href="/account/orders"
                    className="
                        mt-6
                        inline-flex
                        rounded-2xl
                        bg-[#F5F7F2]
                        px-5
                        py-3
                        font-medium
                        text-[#55624A]
                        transition
                        hover:bg-[#D6DEC8]
                    "
                >
                    Ver as minhas encomendas
                </Link>

            </div>

        </div>
    );
}