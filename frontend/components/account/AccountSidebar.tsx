"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LogOut,
    MapPin,
    Package,
    Shield,
    UserRound,
} from "lucide-react";

const navigation = [
    {
        href: "/account/profile",
        label: "Perfil",
        description:
            "Dados pessoais e contacto",
        icon: UserRound,
    },
    {
        href: "/account/addresses",
        label: "Moradas",
        description:
            "Moradas de entrega",
        icon: MapPin,
    },
    {
        href: "/account/orders",
        label: "Encomendas",
        description:
            "Histórico e estado",
        icon: Package,
    },
    {
        href: "/account/security",
        label: "Segurança",
        description:
            "Password e segurança",
        icon: Shield,
    },
];

export default function AccountSidebar() {
    const pathname =
        usePathname();

    return (
        <aside className="w-full shrink-0 lg:w-72">

            <div className="rounded-3xl bg-white p-3 shadow-sm">

                <div className="px-4 pb-4 pt-3">

                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Minha conta
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Gerir a sua conta
                    </p>

                </div>

                <nav className="space-y-1">

                    {navigation.map(
                        ({
                            href,
                            label,
                            description,
                            icon: Icon,
                        }) => {
                            const isActive =
                                pathname ===
                                    href ||
                                pathname.startsWith(
                                    `${href}/`,
                                );

                            return (
                                <Link
                                    key={
                                        href
                                    }
                                    href={
                                        href
                                    }
                                    className={`
                                        group
                                        flex
                                        items-center
                                        gap-3
                                        rounded-2xl
                                        px-4
                                        py-3.5
                                        transition
                                        ${
                                            isActive
                                                ? "bg-[#F5F7F2] text-[#55624A]"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-[#55624A]"
                                        }
                                    `}
                                >

                                    <div
                                        className={`
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            transition
                                            ${
                                                isActive
                                                    ? "bg-[#D6DEC8] text-[#55624A]"
                                                    : "bg-gray-50 text-gray-400 group-hover:bg-[#F5F7F2] group-hover:text-[#55624A]"
                                            }
                                        `}
                                    >
                                        <Icon
                                            size={
                                                18
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0">

                                        <p
                                            className={`
                                                text-sm
                                                font-semibold
                                                ${
                                                    isActive
                                                        ? "text-[#55624A]"
                                                        : "text-gray-700"
                                                }
                                            `}
                                        >
                                            {
                                                label
                                            }
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-gray-400">
                                            {
                                                description
                                            }
                                        </p>

                                    </div>

                                </Link>
                            );
                        },
                    )}

                </nav>

                <div className="my-3 border-t border-gray-100" />

                <button
                    type="button"
                    className="
                        group
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-3.5
                        text-left
                        text-gray-500
                        transition
                        hover:bg-red-50
                        hover:text-red-600
                    "
                >

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition group-hover:bg-red-100 group-hover:text-red-500">
                        <LogOut
                            size={18}
                        />
                    </div>

                    <div>

                        <p className="text-sm font-semibold">
                            Terminar sessão
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                            Sair da sua conta
                        </p>

                    </div>

                </button>

            </div>

        </aside>
    );
}