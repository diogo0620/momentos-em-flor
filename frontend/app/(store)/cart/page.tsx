"use client";

import Image from "next/image";
import Link from "next/link";
import {
    ArrowRight,
    ChevronRight,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from "lucide-react";

import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
    const { items, updateQuantity, removeItem } = useCart();

    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );

    const totalQuantity = items.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const formatPrice = (value: number) =>
        new Intl.NumberFormat("pt-PT", {
            style: "currency",
            currency: "EUR",
        }).format(value);

    return (
        <div className="min-h-screen bg-[#F8F9F5]">
            {/* HEADER — alinhado visualmente com a página de favoritos */}
            <section className="border-b border-[#E8EBE4] bg-white">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                    <nav
                        aria-label="Navegação estrutural"
                        className="mb-7 flex items-center gap-2 text-xs font-medium text-[#8B9484]"
                    >
                        <Link href="/" className="transition-colors hover:text-[#55624A]">
                            Início
                        </Link>
                        <ChevronRight size={13} aria-hidden="true" />
                        <span className="text-[#55624A]">Carrinho</span>
                    </nav>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-semibold tracking-wide text-[#55624A]">
                                <ShoppingBag size={14} strokeWidth={1.8} />
                                A sua seleção
                            </div>
                            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#2F3B2A] sm:text-4xl lg:text-[42px]">
                                O seu carrinho
                            </h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-[#747D6E] sm:text-base sm:leading-7">
                                Reúna as suas flores favoritas e prepare uma encomenda especial, ao seu ritmo.
                            </p>
                        </div>

                        {items.length > 0 && (
                            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                <div className="flex w-fit shrink-0 items-center gap-3 rounded-2xl border border-[#E5E9DF] bg-[#FAFBF8] px-4 py-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EDDF] text-[#55624A]">
                                        <ShoppingBag size={18} strokeWidth={1.8} />
                                    </span>
                                    <div>
                                        <p className="text-lg font-semibold leading-5 text-[#2F3B2A]">
                                            {totalQuantity}
                                        </p>
                                        <p className="mt-1 text-xs text-[#7B8574]">
                                            {totalQuantity === 1 ? "artigo no carrinho" : "artigos no carrinho"}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/products"
                                    className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#55624A] transition-colors hover:text-[#2F3B2A]"
                                >
                                    Continuar a comprar
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
                {/* EMPTY CART */}
                {items.length === 0 ? (
                    <div className="overflow-hidden rounded-[32px] border border-[#E5E9E1] bg-white shadow-[0_8px_30px_rgba(47,59,42,0.05)]">
                        <div className="flex min-h-[460px] flex-col items-center justify-center px-6 py-16 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2E9] text-[#55624A]">
                                <ShoppingBag size={32} strokeWidth={1.6} />
                            </div>

                            <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-[#8A9384]">
                                Ainda não há flores aqui
                            </p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#2F3B2A] sm:text-3xl">
                                O seu carrinho está vazio
                            </h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A8373] sm:text-base">
                                Explore a nossa coleção e encontre o bouquet perfeito para tornar o seu momento especial.
                            </p>

                            <Link
                                href="/products"
                                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#55624A] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(85,98,74,0.18)] transition hover:bg-[#46543C]"
                            >
                                Explorar coleção
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-8">
                        {/* ITEMS */}
                        <div className="space-y-3">
                            {items.map((item) => {
                                // A descrição guarda a configuração criada na página de detalhe.
                                // A verificação mantém compatibilidade com itens adicionados anteriormente.
                                const itemDescription =
                                    "description" in item && typeof item.description === "string"
                                        ? item.description
                                        : "";

                                return (
                                    <article
                                        key={item.cartItemId}
                                        className="group rounded-[28px] border border-[#E5E9E1] bg-white p-4 shadow-[0_6px_24px_rgba(47,59,42,0.045)] transition hover:border-[#D9E0D4] hover:shadow-[0_10px_30px_rgba(47,59,42,0.07)] sm:p-5"
                                    >
                                        <div className="flex gap-4 sm:gap-5">
                                            {/* IMAGE */}
                                            <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[20px] bg-[#F1F3ED] sm:h-36 sm:w-32">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        sizes="(max-width: 639px) 96px, 128px"
                                                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-4xl">
                                                        🌸
                                                    </div>
                                                )}
                                            </div>

                                            {/* CONTENT */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-base font-bold text-[#2F3B2A] sm:text-lg">
                                                            {item.name}
                                                        </h2>

                                                        {item.variantName && (
                                                            <p className="mt-1 text-sm text-[#7A8373]">
                                                                {item.variantName}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.cartItemId)}
                                                        aria-label={`Remover ${item.name}`}
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#A0A69C] transition hover:bg-[#FDEFEF] hover:text-[#C95D5D]"
                                                    >
                                                        <Trash2 size={17} strokeWidth={1.8} />
                                                    </button>
                                                </div>

                                                {itemDescription && (
                                                    <p
                                                        className="mt-1 line-clamp-1 text-sm text-[#7A8373]"
                                                        title={itemDescription.replace(/\s+/g, " ")}
                                                    >
                                                        {itemDescription.replace(/\s+/g, " ")}
                                                    </p>
                                                )}

                                                {/* BOTTOM */}
                                                <div className="mt-4 flex items-end justify-between gap-4">
                                                    {/* QUANTITY */}
                                                    <div className="inline-flex items-center rounded-full border border-[#E0E5DC] bg-[#FAFBF8] p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.cartItemId,
                                                                    item.quantity - 1,
                                                                )
                                                            }
                                                            disabled={item.quantity <= 1}
                                                            aria-label="Diminuir quantidade"
                                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#66705F] transition hover:bg-white hover:text-[#2F3B2A] disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="min-w-8 text-center text-sm font-bold text-[#2F3B2A]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item.cartItemId,
                                                                    item.quantity + 1,
                                                                )
                                                            }
                                                            aria-label="Aumentar quantidade"
                                                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#66705F] transition hover:bg-white hover:text-[#2F3B2A]"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* PRICE */}
                                                    <div className="text-right">
                                                        <p className="text-[11px] text-[#9AA094]">
                                                            {formatPrice(item.price)} / unidade
                                                        </p>
                                                        <p className="mt-0.5 text-lg font-bold text-[#55624A] sm:text-xl">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* SUMMARY */}
                        <aside className="lg:sticky lg:top-28">
                            <div className="overflow-hidden rounded-[28px] border border-[#DCE3D6] bg-white shadow-[0_10px_35px_rgba(47,59,42,0.07)]">
                                <div className="bg-[#EEF2E9] px-6 py-5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7A8373]">
                                        A sua encomenda
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#2F3B2A]">
                                        Resumo
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-3.5 text-sm">
                                        <div className="flex items-center justify-between text-[#7A8373]">
                                            <span>Produtos</span>
                                            <span className="font-medium text-[#3F4A38]">
                                                {totalQuantity}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[#7A8373]">
                                            <span>Subtotal</span>
                                            <span className="font-medium text-[#3F4A38]">
                                                {formatPrice(total)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-dashed border-[#DDE3D8]" />

                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-[#8A9384]">Total</p>
                                            <p className="mt-0.5 text-xl font-bold text-[#2F3B2A]">
                                                {formatPrice(total)}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#F4F6F1] px-3 py-1 text-[10px] font-semibold text-[#66705F]">
                                            IVA incluído
                                        </span>
                                    </div>

                                    <Link
                                        href="/checkout"
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#55624A] py-4 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(85,98,74,0.18)] transition hover:bg-[#46543C]"
                                    >
                                        Finalizar compra
                                        <ArrowRight size={16} />
                                    </Link>

                                    <Link
                                        href="/products"
                                        className="mt-4 block text-center text-sm font-medium text-[#7A8373] transition hover:text-[#55624A]"
                                    >
                                        Continuar a comprar
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-3 rounded-2xl border border-[#E4E9E0] bg-[#F3F5EF] px-4 py-3 text-center text-[11px] leading-5 text-[#7A8373]">
                                Os custos de entrega serão calculados no checkout com base no local de entrega.
                            </div>
                        </aside>
                    </div>
                )}
            </section>
        </div>
    );
}
