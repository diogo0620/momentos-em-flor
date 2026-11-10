"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import AreaNavigation from "./AreaNavigation";
import {
    adminNavigation,
    floristNavigation,
    isNavigationItemActive,
} from "./navigation";

export default function WorkspaceShell({
    children,
    area,
}: {
    children: ReactNode;
    area: "admin" | "florist";
}) {
    const areaLabel = area === "admin" ? "Administração" : "Portal da florista";
    const navigation = area === "admin" ? adminNavigation : floristNavigation;
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);

    const currentPage = useMemo(
        () =>
            [...navigation]
                .sort((a, b) => b.href.length - a.href.length)
                .find((item) => isNavigationItemActive(pathname, item))?.label ?? areaLabel,
        [areaLabel, navigation, pathname],
    );

    async function handleLogout() {
        await logout();
        router.replace("/login");
    }

    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Utilizador";
    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "MF";

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="border-b border-[#e6eae5] px-5 py-6">
                <Link href="/" className="inline-flex" onClick={() => setMenuOpen(false)}>
                    <Image src="/logo.svg" alt="Momentos em Flor" width={168} height={52} className="h-11 w-auto" priority />
                </Link>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#879088]">
                    {areaLabel}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <AreaNavigation items={navigation} onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="border-t border-[#e6eae5] p-3">
                <Button variant="ghost" className="w-full justify-start text-red-700 hover:bg-red-50 hover:text-red-800" onClick={handleLogout}>
                    <LogOut size={18} /> Terminar sessão
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-[#f3f1eb] lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden h-dvh border-r border-[#e3dfd4] bg-[#fbfaf7] lg:sticky lg:top-0 lg:block">
                {sidebar}
            </aside>

            {menuOpen && (
                <div className="fixed inset-0 z-[80] lg:hidden">
                    <button className="absolute inset-0 bg-[#14221a]/45 backdrop-blur-sm" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)} />
                    <aside className="relative h-full w-[min(86vw,320px)] bg-white shadow-2xl">
                        <button className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2f5f1]" onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
                            <X size={19} />
                        </button>
                        {sidebar}
                    </aside>
                </div>
            )}

            <div className="min-w-0">
                <header className="sticky top-0 z-40 border-b border-[#e3dfd4] bg-[#fbfaf7]/95 backdrop-blur-xl">
                    <div className="flex h-16 items-center gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
                        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1e5df] lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
                            <Menu size={20} />
                        </button>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a948c]">{areaLabel}</p>
                            <p className="truncate text-lg font-semibold tracking-tight text-[#203128]">{currentPage}</p>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-[#f2f5f1]" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfe8df] text-xs font-bold text-[#304b39]">{initials}</span>
                                <span className="hidden max-w-40 truncate text-sm font-semibold text-[#34443b] sm:block">{fullName}</span>
                                <ChevronDown size={15} className="hidden text-[#879088] sm:block" />
                            </button>
                            {accountOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e1e5df] bg-white p-2 shadow-[0_18px_50px_rgba(24,43,32,0.14)]">
                                    <div className="px-3 py-2">
                                        <p className="truncate text-sm font-semibold text-[#203128]">{fullName}</p>
                                        <p className="mt-0.5 truncate text-xs text-[#7b857d]">{user?.email}</p>
                                    </div>
                                    <Button variant="ghost" className="mt-1 w-full justify-start text-red-700 hover:bg-red-50" onClick={handleLogout}>
                                        <LogOut size={17} /> Terminar sessão
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="mx-auto w-full max-w-[1480px] p-4 sm:p-7 lg:p-10">{children}</main>
            </div>
        </div>
    );
}
