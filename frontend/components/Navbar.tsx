"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button, ButtonLink } from "@/components/ui/Button";

const navigation = [
    { href: "/products", label: "Todos os produtos" },
    { href: "/products?occasion=romance", label: "Romance" },
    { href: "/products?occasion=birthday", label: "Aniversários" },
    { href: "/delivery-policy", label: "Entregas" },
];

function Counter({ value }: { value: number }) {
    if (!value) return null;
    return <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#26392f] px-1 text-[9px] font-bold text-white ring-2 ring-white">{value > 99 ? "99+" : value}</span>;
}

export default function Navbar() {
    const { items: cartItems } = useCart();
    const { items: wishlistItems } = useWishlist();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const accountHref = user?.role === "SYSTEM_ADMIN" ? "/admin" : user?.role === "FLORIST" ? "/florist" : "/account";

    async function handleLogout() {
        setAccountOpen(false);
        setMobileOpen(false);
        await logout();
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[#e7e3d8] bg-[#fbfaf7]/95 backdrop-blur-xl">
            <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-3 sm:px-7 lg:h-[82px] lg:px-12">
                <button type="button" onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-[#40513c] transition hover:bg-[#eeece4] lg:hidden" aria-label="Abrir menu"><Menu size={20} /></button>
                <Link href="/" className="shrink-0" aria-label="Momentos em Flor — início">
                    <Image src="/logo.svg" alt="Momentos em Flor" width={184} height={58} className="h-10 w-auto sm:h-12" priority />
                </Link>

                <nav aria-label="Navegação da loja" className="ml-10 hidden items-center gap-2 lg:flex">
                    {navigation.map((item) => <Link key={item.label} href={item.href} className="px-3 py-2 text-[13px] font-medium text-[#566259] transition hover:text-[#9d655f]">{item.label}</Link>)}
                </nav>

                <div className="ml-auto flex items-center gap-1">
                    <Link href="/products" className="flex h-10 w-10 items-center justify-center rounded-full text-[#35443b] transition hover:bg-[#eeece4]" aria-label="Pesquisar produtos"><Search size={19} strokeWidth={1.6} /></Link>
                    <Link href="/favorites" className="relative hidden h-10 w-10 items-center justify-center rounded-full text-[#35443b] transition hover:bg-[#eeece4] sm:flex" aria-label="Favoritos"><Heart size={19} strokeWidth={1.6} /><Counter value={wishlistItems.length} /></Link>
                    <Link href="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#35443b] transition hover:bg-[#eeece4]" aria-label="Carrinho"><ShoppingBag size={19} strokeWidth={1.6} /><Counter value={cartItems.length} /></Link>
                    {!isLoading && (isAuthenticated && user ? (
                        <div className="relative ml-1 hidden sm:block">
                            <button className="flex h-10 items-center gap-2 rounded-xl px-2 transition hover:bg-[#f1f4f0]" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfe8df] text-xs font-bold text-[#304b39]">{user.firstName[0]?.toUpperCase()}</span>
                                <span className="hidden max-w-24 truncate text-sm font-semibold text-[#35443b] xl:block">{user.firstName}</span>
                                <ChevronDown size={14} className="text-[#7b857d]" />
                            </button>
                            {accountOpen && (
                                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#e1e5df] bg-white p-2 shadow-[0_18px_50px_rgba(24,43,32,0.14)]">
                                    <div className="px-3 py-2"><p className="truncate text-sm font-semibold text-[#203128]">{user.firstName} {user.lastName}</p><p className="mt-0.5 truncate text-xs text-[#7b857d]">{user.email}</p></div>
                                    <Link href={accountHref} onClick={() => setAccountOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#46534b] hover:bg-[#f1f4f0]"><UserRound size={17} /> Abrir área pessoal</Link>
                                    <Button variant="ghost" className="mt-1 w-full justify-start text-red-700 hover:bg-red-50" onClick={handleLogout}><LogOut size={17} /> Terminar sessão</Button>
                                </div>
                            )}
                        </div>
                    ) : <ButtonLink href="/login" variant="secondary" size="sm" className="ml-1 hidden sm:inline-flex">Entrar</ButtonLink>)}
                </div>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-[90] min-h-dvh lg:hidden">
                    <button className="absolute inset-0 bg-[#14221a]/45 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />
                    <div className="relative flex h-dvh w-[min(88vw,360px)] flex-col bg-[#fbfaf7] p-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#e8ebe7] pb-4"><Image src="/logo.svg" alt="Momentos em Flor" width={158} height={48} className="h-10 w-auto" /><button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f4f0]" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={19} /></button></div>
                        <nav className="flex-1 space-y-1 py-5">{navigation.map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-3 text-base font-semibold text-[#35443b] hover:bg-[#f1f4f0]">{item.label}</Link>)}</nav>
                        <div className="space-y-2 border-t border-[#e8ebe7] pt-4">
                            <ButtonLink href="/favorites" variant="secondary" className="w-full"><Heart size={17} /> Favoritos ({wishlistItems.length})</ButtonLink>
                            {isAuthenticated ? <><ButtonLink href={accountHref} className="w-full"><UserRound size={17} /> Área pessoal</ButtonLink><Button variant="ghost" className="w-full text-red-700" onClick={handleLogout}><LogOut size={17} /> Terminar sessão</Button></> : <ButtonLink href="/login" className="w-full">Entrar na minha conta</ButtonLink>}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
