"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  ArrowUpRight,
  Heart,
  LayoutDashboard,
  LockKeyhole,
  Package,
  UserRound,
} from "lucide-react";

const links = [
  { href: "/account", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Encomendas", icon: Package },
  { href: "/account/profile", label: "Dados pessoais", icon: UserRound },
  { href: "/account/security", label: "Segurança", icon: LockKeyhole },
  { href: "/favorites", label: "Favoritos", icon: Heart, external: true },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "A minha conta";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "MF";

  return (
    <div className="min-h-[70vh] bg-[#F8F9F5]">
      <section className="border-b border-[#E8EBE2] bg-[#F1F4EB]">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#667557]">Momentos em Flor · Área pessoal</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A] sm:text-4xl">A minha conta</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#73796D] sm:text-base">Tudo o que precisa para acompanhar as suas encomendas e gerir os seus dados.</p>
            </div>
            <Link href="/products" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#55624A] transition hover:text-[#2F3B2A]">
              Continuar a descobrir flores <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-3xl border border-[#E8EBE2] bg-white p-4 shadow-[0_4px_20px_rgba(47,59,42,0.03)] lg:sticky lg:top-28">
          <div className="flex items-center gap-3 border-b border-[#EEF0EA] px-2 pb-5 pt-1">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D6DEC8] text-sm font-semibold text-[#46523C]">{initials}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#2F3B2A]">{fullName}</p>
              <p className="mt-1 truncate text-xs text-[#8A8F83]">{user?.email ?? "Área de cliente"}</p>
            </div>
          </div>
          <nav aria-label="Navegação da conta" className="mt-3 flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition lg:w-full ${active ? "bg-[#F1F4EB] text-[#394633]" : "text-[#747A6E] hover:bg-[#F8F9F5] hover:text-[#2F3B2A]"}`}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{label}</span>
                  {active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-[#71805F] lg:block" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-5 hidden rounded-2xl bg-[#F8F9F5] p-4 lg:block">
            <p className="text-sm font-semibold text-[#394633]">Flores para cada momento</p>
            <p className="mt-1 text-xs leading-5 text-[#818679]">Encontre o bouquet certo para surpreender alguém especial.</p>
            <Link href="/products" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#55624A] hover:underline">Ver coleção <ArrowUpRight size={13} /></Link>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
