"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthProvider";
import AreaNavigation from "@/components/workspace/AreaNavigation";
import { accountNavigation } from "@/components/workspace/navigation";
import { Surface } from "@/components/ui/Surface";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "A minha conta";
    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "MF";

    return (
        <div className="min-h-[70vh] bg-[#f5f6f2]">
            <section className="border-b border-[#e1e5df] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7d897f]">Área pessoal</p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#203128] sm:text-4xl">A minha conta</h1>
                            <p className="mt-2 text-sm leading-6 text-[#6d776f]">Acompanhe encomendas e mantenha os seus dados atualizados.</p>
                        </div>
                        <Link href="/products" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#42604d] hover:text-[#203128]">
                            Ver flores <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="mt-6 lg:hidden">
                        <AreaNavigation items={accountNavigation} compact />
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
                <Surface className="hidden h-fit p-3 lg:sticky lg:top-28 lg:block">
                    <div className="mb-3 flex items-center gap-3 border-b border-[#e8ebe7] px-2 pb-4 pt-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#dfe8df] text-xs font-bold text-[#304b39]">{initials}</div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#203128]">{fullName}</p>
                            <p className="mt-0.5 truncate text-xs text-[#7b857d]">{user?.email ?? "Cliente"}</p>
                        </div>
                    </div>
                    <AreaNavigation items={accountNavigation} />
                </Surface>
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}
