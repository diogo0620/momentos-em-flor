"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

import {
    Search,
    Bell,
    ChevronDown,
} from "lucide-react";
import AdminBreadcrumb from "./AdminBreadcrumb";

const pageTitles: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/orders": "Encomendas",
    "/admin/products": "Produtos",
    "/admin/florists": "Floristas",
    "/admin/customers": "Clientes",
    "/admin/promotions": "Promoções",
    "/admin/settings": "Definições",
};

export default function AdminTopbar() {
    const pathname = usePathname();

    const pageTitle = useMemo(() => {
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }

        const match = Object.keys(pageTitles).find((key) =>
            pathname.startsWith(key)
        );

        return match
            ? pageTitles[match]
            : "Admin";
    }, [pathname]);

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

                <AdminBreadcrumb />

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

                <button
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

                <button
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
                        D
                    </div>

                    <div className="hidden text-left lg:block">

                        <p className="font-semibold text-[#2F3B2A]">
                            Diogo Silva
                        </p>

                        <p className="text-sm text-gray-500">
                            Administrador
                        </p>

                    </div>

                    <ChevronDown
                        size={18}
                        className="text-gray-400"
                    />

                </button>

            </div>

        </header>
    );
}