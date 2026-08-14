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

import { getOrderOffers } from "@/lib/api/order-offers";
import { getOrders } from "@/lib/api/orders";

import type { Order } from "@/types/order";
import type { OrderOffer } from "@/types/order-offer";

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

export default function FloristPage() {
    const [offers, setOffers] =
        useState<OrderOffer[]>([]);

    const [orders, setOrders] =
        useState<Order[]>([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadDashboard() {
            try {
                setIsLoading(true);
                setError(null);

                const [
                    offersResponse,
                    ordersResponse,
                ] = await Promise.all([
                    getOrderOffers(),
                    getOrders({
                        page: 1,
                        pageSize: 100,
                        sort: "createdAt",
                        order: "desc",
                    }),
                ]);

                setOffers(offersResponse);
                setOrders(
                    ordersResponse.data,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar o dashboard.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboard();
    }, []);

    /*
     * Propostas que ainda podem ser
     * aceites ou recusadas.
     */

    const pendingOffers =
        offers.filter(
            (offer) =>
                offer.status === "PENDING" ||
                offer.status === "VIEWED",
        );

    /*
     * Encomendas atualmente na posse
     * da florista.
     */

    const acceptedOrders =
        orders.filter(
            (order) =>
                order.status === "ACCEPTED" ||
                order.status === "PREPARING",
        );

    /*
     * Encomendas que já saíram para
     * entrega.
     */

    const outForDelivery =
        orders.filter(
            (order) =>
                order.status ===
                "OUT_FOR_DELIVERY",
        );

    /*
     * Mostrar apenas as 5 propostas
     * pendentes mais recentes.
     */

    const recentOffers =
        [...pendingOffers]
            .sort(
                (a, b) =>
                    new Date(
                        b.createdAt,
                    ).getTime() -
                    new Date(
                        a.createdAt,
                    ).getTime(),
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

                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="
                                    h-32
                                    animate-pulse
                                    rounded-3xl
                                    bg-gray-100
                                "
                            />
                        ),
                    )}

                </div>

                <div className="mt-8 h-80 animate-pulse rounded-3xl bg-gray-100" />

            </div>
        );
    }

    return (
        <div>

            {/* HEADER */}

            <div className="mb-8">

                <p
                    className="
                        text-sm
                        font-medium
                        uppercase
                        tracking-wider
                        text-[#55624A]
                    "
                >
                    Portal da Florista
                </p>

                <h2 className="mt-2 text-3xl font-bold text-[#2F3B2A]">
                    Bem-vindo
                </h2>

                <p className="mt-2 text-gray-500">
                    Consulte as suas encomendas e propostas
                    de entrega.
                </p>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* STATS */}

            <div className="grid gap-6 md:grid-cols-3">

                {/* PROPOSTAS */}

                <Link
                    href="/florist/offers"
                    className="
                        group
                        rounded-3xl
                        bg-white
                        p-6
                        shadow-sm
                        transition
                        hover:-translate-y-1
                        hover:shadow-md
                    "
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

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                bg-[#F5F7F2]
                                text-[#55624A]
                            "
                        >
                            <Clock size={21} />
                        </div>

                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">

                        Ver propostas

                        <ArrowRight
                            size={15}
                            className="
                                transition-transform
                                group-hover:translate-x-1
                            "
                        />

                    </div>

                </Link>

                {/* ENCOMENDAS ACEITES */}

                <Link
                    href="/florist/orders"
                    className="
                        group
                        rounded-3xl
                        bg-white
                        p-6
                        shadow-sm
                        transition
                        hover:-translate-y-1
                        hover:shadow-md
                    "
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

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                bg-[#F5F7F2]
                                text-[#55624A]
                            "
                        >
                            <CheckCircle2
                                size={21}
                            />
                        </div>

                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">

                        Ver encomendas

                        <ArrowRight
                            size={15}
                            className="
                                transition-transform
                                group-hover:translate-x-1
                            "
                        />

                    </div>

                </Link>

                {/* A ENTREGAR */}

                <Link
                    href="/florist/orders"
                    className="
                        group
                        rounded-3xl
                        bg-white
                        p-6
                        shadow-sm
                        transition
                        hover:-translate-y-1
                        hover:shadow-md
                    "
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

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                                bg-[#F5F7F2]
                                text-[#55624A]
                            "
                        >
                            <Truck size={21} />
                        </div>

                    </div>

                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#55624A]">

                        Ver entregas

                        <ArrowRight
                            size={15}
                            className="
                                transition-transform
                                group-hover:translate-x-1
                            "
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
                                <span
                                    className="
                                        flex
                                        h-7
                                        min-w-7
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-[#55624A]
                                        px-2
                                        text-xs
                                        font-bold
                                        text-white
                                    "
                                >
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
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            bg-[#55624A]
                            px-5
                            py-3
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:opacity-90
                        "
                    >
                        Ver todas
                        <ArrowRight size={16} />
                    </Link>

                </div>

                {recentOffers.length === 0 ? (
                    <div
                        className="
                            mt-8
                            rounded-2xl
                            border
                            border-dashed
                            border-gray-200
                            p-10
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-[#F5F7F2]
                                text-[#55624A]
                            "
                        >
                            <Package size={21} />
                        </div>

                        <p className="mt-4 font-medium text-gray-600">
                            Não existem novas propostas.
                        </p>

                        <p className="mt-2 text-sm text-gray-400">
                            Quando receber uma nova encomenda,
                            aparecerá aqui.
                        </p>

                    </div>
                ) : (
                    <div className="mt-8 divide-y divide-gray-100">

                        {recentOffers.map(
                            (offer) => (
                                <Link
                                    key={offer.id}
                                    href={`/florist/orders/${offer.orderId}`}
                                    className="
                                        group
                                        flex
                                        flex-col
                                        gap-4
                                        py-5
                                        first:pt-0
                                        last:pb-0
                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    "
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#F5F7F2]
                                                text-[#55624A]
                                            "
                                        >
                                            <Package
                                                size={19}
                                            />
                                        </div>

                                        <div>

                                            <div className="flex items-center gap-2">

                                                <p className="font-semibold text-[#2F3B2A]">
                                                    #{offer.orderNumber}
                                                </p>

                                                <span
                                                    className="
                                                        rounded-full
                                                        bg-yellow-50
                                                        px-2.5
                                                        py-1
                                                        text-[11px]
                                                        font-medium
                                                        text-yellow-700
                                                    "
                                                >
                                                    Nova
                                                </span>

                                            </div>

                                            <p className="mt-1 text-sm text-gray-400">
                                                {offer.items.length}{" "}
                                                {offer.items.length ===
                                                1
                                                    ? "produto"
                                                    : "produtos"}
                                                {" · "}
                                                Expira em{" "}
                                                {formatDate(
                                                    offer.expiresAt,
                                                )}
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
                                            className="
                                                text-gray-400
                                                transition
                                                group-hover:translate-x-1
                                                group-hover:text-[#55624A]
                                            "
                                        />

                                    </div>

                                </Link>
                            ),
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}