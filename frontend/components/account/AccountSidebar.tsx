"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    User,
    Package,
    Lock,
    LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";

const links = [
    {
        href: "/account",
        label: "Perfil",
        icon: User,
    },
    {
        href: "/account/orders",
        label: "Encomendas",
        icon: Package,
    },
    {
        href: "/account/security",
        label: "Segurança",
        icon: Lock,
    },
];

export default function AccountSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.push("/");
    }

    return (
        <aside className="h-fit rounded-3xl bg-white p-4 shadow-sm">

            <nav className="space-y-1">

                {links.map((item) => {
                    const Icon = item.icon;

                    const active =
                        item.href === "/account"
                            ? pathname === "/account"
                            : pathname.startsWith(
                                  item.href,
                              );

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
                                text-sm
                                font-medium
                                transition
                                ${
                                    active
                                        ? "bg-[#55624A] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-[#F5F7F2] hover:text-[#55624A]"
                                }
                            `}
                        >
                            <Icon size={19} />

                            {item.label}
                        </Link>
                    );
                })}

            </nav>

            <div className="my-4 border-t border-gray-100" />

            <button
                type="button"
                onClick={handleLogout}
                className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-2xl
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-gray-500
                    transition
                    hover:bg-red-50
                    hover:text-red-600
                "
            >
                <LogOut size={19} />

                Terminar sessão
            </button>

        </aside>
    );
}