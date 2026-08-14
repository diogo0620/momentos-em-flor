"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labels: Record<string, string> = {
    florist: "Dashboard",
    offers: "Propostas",
    orders: "Encomendas",
    products: "Produtos",
    profile: "Perfil",
};

export default function FloristBreadcrumb() {
    const pathname = usePathname();

    const segments = pathname
        .split("/")
        .filter(Boolean);

    let currentPath = "";

    return (
        <div className="flex items-center gap-2 text-sm">

            <Link
                href="/florist"
                className="text-gray-500 transition hover:text-[#55624A]"
            >
                Home
            </Link>

            {segments
                .slice(1)
                .map((segment, index) => {
                    currentPath += `/${segment}`;

                    const href =
                        `/florist${currentPath}`;

                    const isLast =
                        index ===
                        segments.slice(1).length - 1;

                    const label =
                        labels[segment] ??
                        decodeURIComponent(
                            segment,
                        );

                    return (
                        <div
                            key={href}
                            className="flex items-center gap-2"
                        >
                            <ChevronRight
                                size={16}
                                className="text-gray-400"
                            />

                            {isLast ? (
                                <span className="font-semibold text-[#2F3B2A]">
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    href={href}
                                    className="text-gray-500 transition hover:text-[#55624A]"
                                >
                                    {label}
                                </Link>
                            )}
                        </div>
                    );
                })}

        </div>
    );
}