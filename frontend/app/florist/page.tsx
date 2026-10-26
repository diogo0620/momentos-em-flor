
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    Package,
    Truck,
} from "lucide-react";

/**
 * Tipos temporários para o dashboard.
 *
 * Quando integrares as novas APIs, substitui estes tipos pelos tipos
 * de resposta correspondentes, mantendo a estrutura dos componentes.
 */
type FloristOfferStatus =
    | "PENDING"
    | "VIEWED"
    | "ACCEPTED"
    | "DECLINED"
    | "EXPIRED"
    | "CANCELLED";

type FloristOrderStatus =
    | "CREATED"
    | "PENDING_PAYMENT"
    | "WAITING_FOR_FLORISTS"
    | "ASSIGNED"
    | "IN_PRODUCTION"
    | "READY_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";

type FloristDashboardOffer = {
    id: number;
    orderId: number;
    orderNumber: string;
    status: FloristOfferStatus;
    createdAt: string;
    expiresAt: string;
    compensationAmount: number;
    items: {
        id: number;
        name: string;
        quantity: number;
    }[];
};

type FloristDashboardOrder = {
    id: number;
    orderNumber: string;
    status: FloristOrderStatus;
    createdAt: string;
};

type FloristDashboardData = {
    offers: FloristDashboardOffer[];
    orders: FloristDashboardOrder[];
};

/**
 * Dados dummy temporários.
 *
 * Ponto de integração futuro:
 * substituir getDummyDashboardData() por uma função que consulte
 * as novas APIs da florista e devolva FloristDashboardData.
 */
const DUMMY_DASHBOARD_DATA: FloristDashboardData = {
    offers: [
        {
            id: 1,
            orderId: 101,
            orderNumber: "MF-2026-0101",
            status: "PENDING",
            createdAt: "2026-10-26T10:30:00.000Z",
            expiresAt: "2026-10-28T18:00:00.000Z",
            compensationAmount: 32.5,
            items: [
                {
                    id: 1,
                    name: "Bouquet Primavera",
                    quantity: 1,
                },
            ],
        },
        {
            id: 2,
            orderId: 102,
            orderNumber: "MF-2026-0102",
            status: "VIEWED",
            createdAt: "2026-10-25T14:00:00.000Z",
            expiresAt: "2026-10-27T18:00:00.000Z",
            compensationAmount: 45,
            items: [
                {
                    id: 2,
                    name: "Rosas Vermelhas",
                    quantity: 2,
                },
                {
                    id: 3,
                    name: "Cartão personalizado",
                    quantity: 1,
                },
            ],
        },
        {
            id: 3,
            orderId: 103,
            orderNumber: "MF-2026-0103",
            status: "ACCEPTED",
            createdAt: "2026-10-24T09:00:00.000Z",
            expiresAt: "2026-10-26T18:00:00.000Z",
            compensationAmount: 28,
            items: [
                {
                    id: 4,
                    name: "Bouquet Romântico",
                    quantity: 1,
                },
            ],
        },
    ],

    orders: [
        {
            id: 103,
            orderNumber: "MF-2026-0103",
            status: "ASSIGNED",
            createdAt: "2026-10-24T09:00:00.000Z",
        },
        {
            id: 104,
            orderNumber: "MF-2026-0104",
            status: "IN_PRODUCTION",
            createdAt: "2026-10-23T12:00:00.000Z",
        },
        {
            id: 105,
            orderNumber: "MF-2026-0105",
            status: "READY_FOR_DELIVERY",
            createdAt: "2026-10-22T11:00:00.000Z",
        },
    ],
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

/**
 * Fonte dos dados do dashboard.
 *
 * Atualmente devolve dados dummy.
 * Futuramente, a implementação pode consultar as novas APIs sem
 * obrigar a alterar o layout da página.
 */
async function getDashboardData(): Promise<FloristDashboardData> {
    return DUMMY_DASHBOARD_DATA;
}

export default function FloristPage() {
    const [offers, setOffers] = useState<FloristDashboardOffer[]>([]);
    const [orders, setOrders] = useState<FloristDashboardOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadDashboard() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getDashboardData();

                if (cancelled) {
                    return;
                }

                setOffers(response.offers);
                setOrders(response.orders);
            } catch (err) {
                if (cancelled) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar o dashboard.",
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadDashboard();

        return () => {
            cancelled = true;
        };
    }, []);

    // Propostas que ainda podem ser aceites ou recusadas.
    const pendingOffers = offers.filter(
        (offer) =>
            offer.status === "PENDING" ||
            offer.status === "VIEWED",
    );

    // Encomendas atualmente atribuídas à florista ou em preparação.
    const acceptedOrders = orders.filter(
        (order) =>
            order.status === "ASSIGNED" ||
            order.status === "IN_PRODUCTION",
    );

    // Encomendas prontas para entrega.
    const outForDelivery = orders.filter(
        (order) => order.status === "READY_FOR_DELIVERY",
    );

    // As cinco propostas pendentes mais recentes.
    const recentOffers = [...pendingOffers]
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

    if (isLoading) {
        return (
            <div>
                <div className="mb-8">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-9 w-64 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-gray-100" />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-32 animate-pulse rounded-3xl bg-gray-100"
                        />
                    ))}
                </div>

                <div className="mt-8 h-80 animate-pulse rounded-3xl bg-gray-100" />
            </div>
        );
    }

    return (
        <div>
            {/* HEADER */}
            <div className="mb-8">
                <p className="text-sm font-medium uppercase tracking-wider text-[#55624A]">
                    Portal da Florista
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                    Bem-vindo
                </h2>

                <p className="mt-2 text-gray-500">
                    Consulte as suas encomendas e propostas de entrega.
                </p>
            </div>

            {/* ERROR */}
            {error && (
                <div
                    role="alert"
                    className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {/* STATS */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* PROPOSTAS */}
                <Link
                    href="/florist/offers"
                    className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Novas propostas
                            </p>

                            <p className="mt-2 text-4xl font-bold text-[#2F3B2A]">
                                {pendingOffers.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                            <Clock size={21} />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">
                        Ver propostas
                        <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </div>
                </Link>

                {/* ENCOMENDAS ACEITES */}
                <Link
                    href="/florist/orders"
                    className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Encomendas aceites
                            </p>

                            <p className="mt-2 text-4xl font-bold text-[#2F3B2A]">
                                {acceptedOrders.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                            <CheckCircle2 size={21} />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">
                        Ver encomendas
                        <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </div>
                </Link>

                {/* A ENTREGAR */}
                <Link
                    href="/florist/orders"
                    className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                A entregar
                            </p>

                            <p className="mt-2 text-4xl font-bold text-[#2F3B2A]">
                                {outForDelivery.length}
                            </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                            <Truck size={21} />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">
                        Ver entregas
                        <ArrowRight
                            size={15}
                            className="transition-transform group-hover:translate-x-1"
                        />
                    </div>
                </Link>
            </div>

            {/* PROPOSTAS RECENTES */}
            <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-[#2F3B2A]">
                                Propostas recentes
                            </h2>

                            {pendingOffers.length > 0 && (
                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#55624A] px-2 text-xs font-bold text-white">
                                    {pendingOffers.length}
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Encomendas disponíveis para a sua florista.
                        </p>
                    </div>

                    <Link
                        href="/florist/offers"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                    >
                        Ver todas
                        <ArrowRight size={16} />
                    </Link>
                </div>

                {recentOffers.length === 0 ? (
                    <div className="mt-8 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                            <Package size={21} />
                        </div>

                        <p className="mt-4 font-medium text-gray-600">
                            Não existem novas propostas.
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                            Quando receber uma nova encomenda, aparecerá aqui.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 divide-y divide-gray-100">
                        {recentOffers.map((offer) => (
                            <Link
                                key={offer.id}
                                href={`/florist/orders/${offer.orderId}`}
                                className="group flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5F7F2] text-[#55624A]">
                                        <Package size={19} />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[#2F3B2A]">
                                                #{offer.orderNumber}
                                            </p>

                                            <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-[11px] font-medium text-yellow-700">
                                                {offer.status === "VIEWED"
                                                    ? "Consultada"
                                                    : "Nova"}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-400">
                                            {offer.items.length}{" "}
                                            {offer.items.length === 1
                                                ? "produto"
                                                : "produtos"}
                                            {" · "}
                                            Expira em{" "}
                                            {formatDate(offer.expiresAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-6 sm:justify-end">
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-400">
                                            Compensação
                                        </p>

                                        <p className="mt-1 font-bold text-[#55624A]">
                                            {formatCurrency(
                                                offer.compensationAmount,
                                            )}
                                        </p>
                                    </div>

                                    <ArrowRight
                                        size={19}
                                        className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#55624A]"
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
