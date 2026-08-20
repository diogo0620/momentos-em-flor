"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Eye,
    Package,
    Plus,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import SearchInput from "@/components/admin/common/SearchInput";
import FilterBar from "@/components/admin/common/FilterBar";
import DataTable from "@/components/admin/DataTable";

import {
    getOrders,
} from "@/lib/api/orders";

import type {
    Order,
    Pagination,
} from "@/types/order";

function getStatusLabel(
    status: Order["status"],
) {
    switch (status) {
        case "CREATED":
            return "Criada";

        case "WAITING_FOR_FLORISTS":
            return "À espera de florista";

        case "ASSIGNED":
            return "Atribuída";

        case "IN_PRODUCTION":
            return "Em preparação";

        case "READY_FOR_DELIVERY":
            return "Pronta para entrega";

        case "DELIVERED":
            return "Entregue";

        case "CANCELLED":
            return "Cancelada";

        default:
            return status;
    }
}

function getStatusClass(
    status: Order["status"],
) {
    switch (status) {
        case "DELIVERED":
            return "bg-green-100 text-green-700";

        case "CANCELLED":
            return "bg-red-100 text-red-700";

        case "ASSIGNED":
        case "IN_PRODUCTION":
        case "READY_FOR_DELIVERY":
            return "bg-blue-100 text-blue-700";

        case "WAITING_FOR_FLORISTS":
            return "bg-yellow-100 text-yellow-700";

        case "CREATED":
        default:
            return "bg-gray-100 text-gray-600";
    }
}

export default function AdminOrdersPage() {
    const [orders, setOrders] =
        useState<Order[]>([]);

    const [pagination, setPagination] =
        useState<Pagination>({
            page: 1,
            pageSize: 20,
            total: 0,
            pages: 1,
        });

    const [search, setSearch] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    async function loadOrders(
        page = pagination.page,
        currentSearch = search,
    ) {
        try {
            setLoading(true);
            setError(null);

            const response =
                await getOrders({
                    page,
                    pageSize: 20,
                    search:
                        currentSearch ||
                        undefined,
                    sort: "createdAt",
                    order: "desc",
                });

            setOrders(response.data);

            setPagination(
                response.pagination,
            );
        } catch (err) {
            console.error(err);

            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as encomendas.",
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders(1, search);
    }, [search]);

    return (
        <div>

            {/* HEADER */}

            <div className="flex items-start justify-between gap-6">

                <div className="flex-1">
                    <PageHeader
                        title="Encomendas"
                        subtitle="Gerir as encomendas da Momentos em Flor."
                    />
                </div>

                <Link
                    href="/admin/orders/new"
                    className="
                        mt-1
                        inline-flex
                        shrink-0
                        items-center
                        gap-2
                        rounded-full
                        bg-[#55624A]
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        transition
                        hover:opacity-90
                    "
                >
                    <Plus size={17} />
                    Nova encomenda
                </Link>

            </div>

            {/* FILTERS */}

            <div className="mt-8">

                <FilterBar>

                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Pesquisar por encomenda, cliente..."
                    />

                </FilterBar>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* TABLE */}

            <div className="mt-8">

                <DataTable>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>
                                <tr className="border-b border-gray-100 text-left text-sm text-gray-500">

                                    <th className="px-6 py-4 font-medium">
                                        Encomenda
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Cliente
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Entrega
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Total
                                    </th>

                                    <th className="px-6 py-4 font-medium">
                                        Estado
                                    </th>

                                    <th className="px-6 py-4 text-right font-medium">
                                        Ações
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center text-gray-500"
                                        >
                                            A carregar encomendas...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-16 text-center"
                                        >
                                            <Package
                                                size={36}
                                                className="mx-auto text-gray-300"
                                            />

                                            <p className="mt-4 font-medium text-gray-600">
                                                Nenhuma encomenda encontrada
                                            </p>

                                            <p className="mt-1 text-sm text-gray-400">
                                                Tente alterar os critérios de pesquisa.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map(
                                        (order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-gray-50 transition hover:bg-[#F9FAF7]"
                                            >

                                                <td className="px-6 py-5">

                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="font-semibold text-[#2F3B2A] transition hover:text-[#55624A]"
                                                    >
                                                        {order.orderNumber}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        #{order.id}
                                                    </p>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <p className="font-medium text-gray-800">
                                                        {order.customerFirstName}{" "}
                                                        {order.customerLastName}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-400">
                                                        {order.customerEmail}
                                                    </p>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <p className="font-medium text-gray-700">
                                                        {order.recipientFirstName}{" "}
                                                        {order.recipientLastName ?? ""}
                                                    </p>

                                                    <p className="mt-1 text-sm text-gray-400">
                                                        {order.deliveryCity}
                                                    </p>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span className="font-semibold text-[#2F3B2A]">
                                                        {order.total.toFixed(
                                                            2,
                                                        )}{" "}
                                                        €
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5">

                                                    <span
                                                        className={`
                                                            inline-flex
                                                            rounded-full
                                                            px-3
                                                            py-1
                                                            text-xs
                                                            font-medium
                                                            ${getStatusClass(
                                                                order.status,
                                                            )}
                                                        `}
                                                    >
                                                        {getStatusLabel(
                                                            order.status,
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-5 text-right">

                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="
                                                            inline-flex
                                                            h-10
                                                            w-10
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            text-gray-500
                                                            transition
                                                            hover:bg-[#F3F5EE]
                                                            hover:text-[#55624A]
                                                        "
                                                        title="Ver encomenda"
                                                    >
                                                        <Eye
                                                            size={18}
                                                        />
                                                    </Link>

                                                </td>

                                            </tr>
                                        ),
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* PAGINATION */}

                    {!loading &&
                        pagination.pages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">

                                <p className="text-sm text-gray-500">
                                    {pagination.total}{" "}
                                    encomendas
                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page <=
                                            1
                                        }
                                        onClick={() =>
                                            loadOrders(
                                                pagination.page -
                                                    1,
                                            )
                                        }
                                        className="
                                            rounded-xl
                                            border
                                            border-gray-200
                                            px-4
                                            py-2
                                            text-sm
                                            transition
                                            hover:bg-[#F5F7F2]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        Anterior
                                    </button>

                                    <span className="px-3 text-sm text-gray-500">
                                        Página{" "}
                                        {pagination.page}{" "}
                                        de{" "}
                                        {pagination.pages}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={
                                            pagination.page >=
                                            pagination.pages
                                        }
                                        onClick={() =>
                                            loadOrders(
                                                pagination.page +
                                                    1,
                                            )
                                        }
                                        className="
                                            rounded-xl
                                            border
                                            border-gray-200
                                            px-4
                                            py-2
                                            text-sm
                                            transition
                                            hover:bg-[#F5F7F2]
                                            disabled:cursor-not-allowed
                                            disabled:opacity-40
                                        "
                                    >
                                        Seguinte
                                    </button>

                                </div>

                            </div>
                        )}

                </DataTable>

            </div>

        </div>
    );
}