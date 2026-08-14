"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    UserCircle,
    ClipboardList,
} from "lucide-react";

import { getOrderOffers } from "@/lib/api/order-offers";

const links = [
    {
        href: "/florist",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/florist/offers",
        label: "Propostas",
        icon: ClipboardList,
    },
    {
        href: "/florist/orders",
        label: "Encomendas",
        icon: ShoppingCart,
    },
    {
        href: "/florist/products",
        label: "Produtos",
        icon: Package,
    },
    {
        href: "/florist/profile",
        label: "Perfil",
        icon: UserCircle,
    },
];

export default function FloristSidebar() {
    const pathname = usePathname();

    const [pendingOffers, setPendingOffers] =
        useState(0);

    useEffect(() => {
        async function loadPendingOffers() {
            try {
                const offers =
                    await getOrderOffers();

                const pending =
                    offers.filter(
                        (offer) =>
                            offer.status ===
                                "PENDING" ||
                            offer.status ===
                                "VIEWED",
                    ).length;

                setPendingOffers(pending);
            } catch {
                // Se a API falhar, não mostramos o badge.
                setPendingOffers(0);
            }
        }

        loadPendingOffers();
    }, [pathname]);

    return (
        <aside
            className="
                flex
                h-screen
                w-72
                flex-col
                border-r
                border-gray-200
                bg-white
            "
        >
            {/* LOGO */}

            <div className="border-b border-gray-100 p-8">

                <Link
                    href="/florist"
                    className="flex items-center gap-4"
                >
                    <Image
                        src="/logo.svg"
                        alt="Momentos em Flor"
                        width={170}
                        height={50}
                        className="h-12 w-auto"
                    />
                </Link>

                <p
                    className="
                        mt-4
                        text-xs
                        font-semibold
                        uppercase
                        tracking-wider
                        text-gray-400
                    "
                >
                    Portal da Florista
                </p>

            </div>

            {/* MENU */}

            <nav className="flex-1 p-5">

                <div className="space-y-2">

                    {links.map((item) => {
                        const Icon = item.icon;

                        const active =
                            item.href === "/florist"
                                ? pathname ===
                                  "/florist"
                                : pathname.startsWith(
                                      item.href,
                                  );

                        const isOffers =
                            item.href ===
                            "/florist/offers";

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    px-4
                                    py-3
                                    transition-all
                                    duration-200
                                    ${
                                        active
                                            ? "bg-[#55624A] text-white shadow"
                                            : "text-gray-600 hover:bg-[#F5F7F2]"
                                    }
                                `}
                            >
                                <Icon size={20} />

                                <span className="flex-1 font-medium">
                                    {item.label}
                                </span>

                                {isOffers &&
                                    pendingOffers >
                                        0 && (
                                        <span
                                            className={`
                                                flex
                                                h-6
                                                min-w-6
                                                items-center
                                                justify-center
                                                rounded-full
                                                px-1.5
                                                text-xs
                                                font-bold
                                                ${
                                                    active
                                                        ? "bg-white text-[#55624A]"
                                                        : "bg-[#55624A] text-white"
                                                }
                                            `}
                                        >
                                            {pendingOffers >
                                            99
                                                ? "99+"
                                                : pendingOffers}
                                        </span>
                                    )}
                            </Link>
                        );
                    })}

                </div>

            </nav>

            {/* FOOTER */}

            <div className="border-t border-gray-100 p-5">

                <p className="px-4 text-xs text-gray-400">
                    Área reservada a floristas
                </p>

            </div>

        </aside>
    );
}