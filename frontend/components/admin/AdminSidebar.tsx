"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Image from "next/image";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Flower2,
    Users,
    TicketPercent,
    Settings,
    LogOut,
} from "lucide-react";

const links = [
    {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        href: "/admin/orders",
        label: "Encomendas",
        icon: ShoppingCart,
    },
    {
        href: "/admin/products",
        label: "Produtos",
        icon: Package,
    },
    {
        href: "/admin/florists",
        label: "Floristas",
        icon: Flower2,
    },
    {
        href: "/admin/customers",
        label: "Clientes",
        icon: Users,
    },
  
];

export default function AdminSidebar() {
    const pathname = usePathname();

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
                    href="/admin"
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

            </div>

            {/* MENU */}

            <nav className="flex-1 p-5">

                <div className="space-y-2">

                    {links.map((item) => {

                        const Icon = item.icon;

                        const active =
                            item.href === "/admin"
                                ? pathname === "/admin"
                                : pathname.startsWith(item.href);

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
                                    ${active
                                        ? "bg-[#55624A] text-white shadow"
                                        : "text-gray-600 hover:bg-[#F5F7F2]"
                                    }
                                `}
                            >

                                <Icon size={20} />

                                <span className="font-medium">
                                    {item.label}
                                </span>

                            </Link>
                        );
                    })}

                </div>

            </nav>

            {/* FOOTER */}

            <div className="border-t border-gray-100 p-5">

                <button
                    className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-2xl
                        px-4
                        py-3
                        text-gray-600
                        transition
                        hover:bg-red-50
                        hover:text-red-600
                    "
                >

                    <LogOut size={20} />

                    Terminar Sessão

                </button>

            </div>

        </aside>
    );
}