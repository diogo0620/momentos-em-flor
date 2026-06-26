"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
    Eye,
    Package,
} from "lucide-react";

import { orders } from "@/data/orders";

import SearchInput from "@/components/admin/common/SearchInput";
import FilterBar from "@/components/admin/common/FilterBar";
import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";
import MetricCard from "@/components/admin/common/MetricCard";
import EmptyState from "@/components/admin/common/EmptyState";
import SectionCard from "@/components/admin/common/SectionCard";

export default function OrdersPage() {
    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const filteredOrders =
        useMemo(() => {
            let result = [...orders];

            if (search) {
                result = result.filter(
                    (order) =>
                        order.customerName
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        order.product
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                );
            }

            if (status !== "all") {
                result = result.filter(
                    (order) =>
                        order.status ===
                        status
                );
            }

            return result;
        }, [search, status]);

    const pending =
        orders.filter(
            (o) => o.status === "PENDING"
        ).length;

    const assigned =
        orders.filter(
            (o) => o.status === "ASSIGNED"
        ).length;

    const delivered =
        orders.filter(
            (o) => o.status === "DELIVERED"
        ).length;

    return (
        <div className="space-y-8">

            <PageHeader
                title="Encomendas"
                subtitle="Consulte e acompanhe todas as encomendas."
            />

            <FilterBar>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Pesquisar encomendas..."
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                    <p className="text-sm text-gray-500">
                        A mostrar{" "}
                        <span className="font-semibold text-[#2F3B2A]">
                            {filteredOrders.length}
                        </span>{" "}
                        de{" "}
                        <span className="font-semibold text-[#2F3B2A]">
                            {orders.length}
                        </span>{" "}
                        encomendas
                    </p>

                    <select
                        value={status}
                        onChange={(e) =>
                            setStatus(
                                e.target.value
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            bg-white
                            px-5
                            py-3
                        "
                    >
                        <option value="all">
                            Todos os estados
                        </option>

                        <option value="PENDING">
                            Pendentes
                        </option>

                        <option value="ASSIGNED">
                            Atribuídas
                        </option>

                        <option value="DELIVERED">
                            Entregues
                        </option>

                    </select>

                </div>

            </FilterBar>

            <SectionCard>

                {filteredOrders.length > 0 && (

                    <>

                        <div
                            className="
                                grid
                                grid-cols-[100px_2fr_2fr_160px_120px_60px]
                                border-b
                                bg-[#F8F9F5]
                                px-6
                                py-4
                                text-sm
                                font-semibold
                                text-gray-500
                            "
                        >

                            <div>Nº</div>
                            <div>Cliente</div>
                            <div>Produto</div>
                            <div>Estado</div>
                            <div>Total</div>
                            <div></div>

                        </div>

                        {filteredOrders.map(
                            (order) => (

                                <div
                                    key={order.id}
                                    className="
        grid
        grid-cols-[100px_2fr_2fr_160px_120px_60px]
        items-center
        border-b
        border-gray-100
        px-6
        py-5
        transition
        hover:bg-[#F8F9F5]
    "
                                >

                                    <div className="font-semibold">
                                        #{order.id}
                                    </div>

                                    <div>
                                        {order.customerName}
                                    </div>

                                    <div>
                                        {order.product}
                                    </div>

                                    <div>

                                        <StatusBadge
                                            status={order.status}
                                        />

                                    </div>

                                    <div className="font-semibold">
                                        {order.total.toFixed(
                                            2
                                        )} €
                                    </div>

                                    <div className="flex justify-end">

                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        transition-all
        duration-200
        hover:bg-[#D6DEC8]
        hover:scale-110
    "
                                        >
                                            <Eye size={18} />
                                        </Link>

                                    </div>

                                </div>

                            )
                        )}
                    </>

                )}

                {filteredOrders.length === 0 && (

                    <EmptyState
                        title="Nenhuma encomenda encontrada"
                        description="Experimente alterar os filtros ou a pesquisa."
                    />

                )}

            </SectionCard>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Total"
                    value={orders.length}
                    subtitle="Encomendas registadas"
                    icon={Package}
                />

                <MetricCard
                    title="Pendentes"
                    value={pending}
                    subtitle="Por atribuir"
                    icon={Package}
                    color="#D97706"
                />

                <MetricCard
                    title="Atribuídas"
                    value={assigned}
                    subtitle="Em preparação"
                    icon={Package}
                    color="#2563EB"
                />

                <MetricCard
                    title="Entregues"
                    value={delivered}
                    subtitle="Concluídas"
                    icon={Package}
                    color="#16A34A"
                />

            </div>

        </div>
    );
}