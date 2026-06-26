"use client";

import { useState } from "react";

import Link from "next/link";

import {
    ArrowRight,
    Clock3,
    Euro,
    Flower2,
    ShoppingCart,
} from "lucide-react";

import MetricCard from "@/components/admin/common/MetricCard";
import PageHeader from "@/components/admin/common/PageHeader";
import SectionCard from "@/components/admin/common/SectionCard";
import StatusBadge from "@/components/admin/common/StatusBadge";

import { orders as initialOrders } from "@/data/orders";
import { florists } from "@/data/florists";

export default function AdminPage() {

    const [orders, setOrders] =
        useState(initialOrders);

    const revenue =
        orders.reduce(
            (sum, order) =>
                sum + order.total,
            0
        );

    const pendingAssignments =
        orders.filter(
            (order) =>
                order.floristId === null
        ).length;

    const activeFlorists =
        florists.filter(
            (florist) =>
                florist.active
        );

    function assignFlorist(
        orderId: string,
        floristId: string
    ) {

        setOrders((current) =>
            current.map((order) =>
                order.id === orderId
                    ? {
                        ...order,
                        floristId,
                        status: "ASSIGNED",
                    }
                    : order
            )
        );

    }

    return (

        <div className="space-y-8 pb-10">

            <PageHeader
                title="Dashboard"
                subtitle="Gestão de encomendas e floristas."
            />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Encomendas"
                    value={orders.length}
                    subtitle="Recebidas"
                    icon={ShoppingCart}
                />

                <MetricCard
                    title="Receita"
                    value={`${revenue.toFixed(2)} €`}
                    subtitle="Total faturado"
                    icon={Euro}
                />

                <MetricCard
                    title="Por atribuir"
                    value={pendingAssignments}
                    subtitle="Necessitam de florista"
                    icon={Clock3}
                    color="#D97706"
                />

                <MetricCard
                    title="Floristas"
                    value={florists.length}
                    subtitle="Parceiras"
                    icon={Flower2}
                />

            </div>

            <SectionCard>

                <div className="flex items-center justify-between">

                    <h2 className="text-2xl font-bold">
                        Últimas Encomendas
                    </h2>

                    <Link
                        href="/admin/orders"
                        className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-[#55624A]
                            transition
                            hover:gap-3
                        "
                    >
                        Ver todas

                        <ArrowRight
                            size={18}
                        />

                    </Link>

                </div>

                <div className="mt-8 space-y-4">

                    {orders
                        .slice(0, 5)
                        .map((order) => {

                            const florist =
                                florists.find(
                                    (f) =>
                                        f.id ===
                                        order.floristId
                                );

                            return (

                                <div
                                    key={order.id}
                                    className="
                                        rounded-2xl
                                        border
                                        border-gray-100
                                        p-6
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            gap-5
                                            lg:flex-row
                                            lg:items-center
                                            lg:justify-between
                                        "
                                    >

                                        <div>

                                            <h3 className="font-semibold text-[#2F3B2A]">

                                                #{order.id}

                                                <span className="ml-2 font-normal text-gray-500">
                                                    • {order.customerName}
                                                </span>

                                            </h3>

                                            <p className="mt-2 text-gray-700">

                                                {order.product}

                                            </p>

                                        </div>

                                        <StatusBadge
                                            status={order.status}
                                        />

                                    </div>

                                    {!order.floristId ? (

                                        <div className="mt-5 flex flex-wrap gap-2">

                                            {activeFlorists.map(
                                                (florist) => (

                                                    <button
                                                        key={florist.id}
                                                        onClick={() =>
                                                            assignFlorist(
                                                                order.id,
                                                                florist.id
                                                            )
                                                        }
                                                        className="
                                                            rounded-full
                                                            bg-[#55624A]
                                                            px-4
                                                            py-2
                                                            text-sm
                                                            text-white
                                                            transition-all
                                                            duration-200
                                                            hover:scale-105
                                                            hover:shadow-md
                                                        "
                                                    >
                                                        {florist.name}
                                                    </button>

                                                )
                                            )}

                                        </div>

                                    ) : (

                                        <div className="mt-5 flex items-center gap-3">

                                            <StatusBadge
                                                status="ASSIGNED"
                                            />

                                            <span className="text-sm text-gray-500">

                                                {florist?.name}

                                            </span>

                                        </div>

                                    )}

                                </div>

                            );

                        })}

                </div>

            </SectionCard>

        </div>

    );

}