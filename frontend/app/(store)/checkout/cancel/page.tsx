"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function CheckoutCancelPage() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#D6DEC8] border-t-[#55624A]" />
                        <p className="mt-4 text-sm text-gray-500">
                            A preparar a sua encomenda...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F8F4] px-4 py-10 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-3xl">
                <div className="overflow-hidden rounded-[2rem] border border-[#E2E7DD] bg-white shadow-[0_20px_60px_rgba(47,59,42,0.08)]">
                    <div className="px-6 pb-10 pt-10 text-center sm:px-12 sm:pb-12 sm:pt-14">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF4DD]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C28A32] text-white">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="h-6 w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 8v4m0 4h.01M10.3 3.7 2.8 17a2 2 0 0 0 1.75 3h14.9a2 2 0 0 0 1.75-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#FFF4DD] px-3.5 py-1.5 text-xs font-semibold text-[#9A6B18]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C28A32]" />
                            Pagamento pendente
                        </div>

                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#2F3B2A] sm:text-4xl">
                            A sua encomenda ficou guardada
                        </h1>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500 sm:text-base">
                            O pagamento não foi concluído neste momento, mas
                            não se preocupe — a sua encomenda continua
                            disponível.
                        </p>
                    </div>

                    <div className="border-t border-[#E8ECE4] bg-[#FBFCFA] px-6 py-8 sm:px-12">
                        <div className="mx-auto max-w-xl">
                            <div className="rounded-[1.5rem] border border-[#E1E7DC] bg-white p-5 sm:p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2E9] text-[#55624A]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[#2F3B2A]">
                                            Pode pagar mais tarde
                                        </h2>

                                        <p className="mt-1.5 text-sm leading-6 text-gray-500">
                                            A sua encomenda pode ser paga nas
                                            próximas horas através da área
                                            <span className="font-medium text-[#55624A]">
                                                {" "}
                                                As minhas encomendas
                                            </span>
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[1.5rem] border border-[#E1E7DC] bg-white p-5 sm:p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2E9] text-[#55624A]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13ZM7 7h10M7 11h10M7 15h6"
                                            />
                                        </svg>
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="font-semibold text-[#2F3B2A]">
                                            Consulte o seu email
                                        </h2>

                                        <p className="mt-1.5 text-sm leading-6 text-gray-500">
                                            A confirmação da encomenda será
                                            enviada para o endereço de email
                                            associado à sua conta.
                                        </p>

                                        {user?.email && (
                                            <p className="mt-3 truncate rounded-xl bg-[#F5F7F2] px-3.5 py-2.5 text-sm font-medium text-[#55624A]">
                                                {user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-[1.5rem] border border-[#E1E7DC] bg-white p-5 sm:p-6">
                                <div className="flex gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2E9] text-[#55624A]">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3 7.5h18v13H3zM3 8l9 6 9-6"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-[#2F3B2A]">
                                            Não perdeu a encomenda
                                        </h2>

                                        <p className="mt-1.5 text-sm leading-6 text-gray-500">
                                            Se decidir continuar, basta voltar
                                            às suas encomendas e selecionar a
                                            opção de pagamento.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Link
                                    href="/account/orders"
                                    className="inline-flex items-center justify-center rounded-full bg-[#55624A] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                                >
                                    Ir para as minhas encomendas
                                </Link>

                                <Link
                                    href="/products"
                                    className="inline-flex items-center justify-center rounded-full border border-[#D6DEC8] bg-white px-7 py-3.5 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EF]"
                                >
                                    Continuar a explorar
                                </Link>
                            </div>

                            <p className="mt-7 text-center text-xs leading-5 text-gray-400">
                                Pode voltar quando quiser para concluir o
                                pagamento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
