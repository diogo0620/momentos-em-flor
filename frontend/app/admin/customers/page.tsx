"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
    Eye,
    Users,
} from "lucide-react";

import { customers } from "@/data/customers";

import PageHeader from "@/components/admin/common/PageHeader";
import FilterBar from "@/components/admin/common/FilterBar";
import SearchInput from "@/components/admin/common/SearchInput";
import SectionCard from "@/components/admin/common/SectionCard";
import MetricCard from "@/components/admin/common/MetricCard";
import StatusBadge from "@/components/admin/common/StatusBadge";
import EmptyState from "@/components/admin/common/EmptyState";

export default function CustomersPage() {

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const [sort, setSort] =
        useState("name");

    const filteredCustomers =
        useMemo(() => {

            let result = [...customers];

            if (search) {

                result = result.filter(
                    (customer) =>
                        customer.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        customer.email
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                );

            }

            if (status !== "all") {

                result = result.filter(
                    (customer) =>
                        status === "active"
                            ? customer.active
                            : !customer.active
                );

            }

            switch (sort) {

                case "spent":

                    result.sort(
                        (a, b) =>
                            b.totalSpent -
                            a.totalSpent
                    );

                    break;

                case "orders":

                    result.sort(
                        (a, b) =>
                            b.orders -
                            a.orders
                    );

                    break;

                case "name":

                default:

                    result.sort((a, b) =>
                        a.name.localeCompare(
                            b.name
                        )
                    );

            }

            return result;

        }, [
            search,
            status,
            sort,
        ]);

    const totalRevenue =
        customers.reduce(
            (sum, customer) =>
                sum + customer.totalSpent,
            0
        );

    const averageTicket =
        customers.length > 0
            ? totalRevenue /
            customers.length
            : 0;

    const activeCustomers =
        customers.filter(
            (customer) =>
                customer.active
        ).length;

    return (

        <div className="space-y-8">

            <PageHeader
                title="Clientes"
                subtitle="Consulte todos os clientes da plataforma."
            />

            <FilterBar>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Pesquisar clientes..."
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                    <p className="text-sm text-gray-500">

                        A mostrar{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {filteredCustomers.length}
                        </span>

                        {" "}de{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {customers.length}
                        </span>

                        {" "}clientes

                    </p>

                    <div className="flex gap-3">

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
                                Todos
                            </option>

                            <option value="active">
                                Ativos
                            </option>

                            <option value="inactive">
                                Inativos
                            </option>

                        </select>

                        <select
                            value={sort}
                            onChange={(e) =>
                                setSort(
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

                            <option value="name">
                                Nome
                            </option>

                            <option value="orders">
                                Encomendas
                            </option>

                            <option value="spent">
                                Total Gasto
                            </option>

                        </select>

                    </div>

                </div>

            </FilterBar>

            <SectionCard>

                {filteredCustomers.length > 0 && (

                    <>

                        <div
                            className="
                                grid
                                grid-cols-[2fr_180px_150px_150px_160px_120px_60px]
                                border-b
                                bg-[#F8F9F5]
                                px-6
                                py-4
                                text-sm
                                font-semibold
                                text-gray-500
                            "
                        >

                            <div>Cliente</div>
                            <div>Cidade</div>
                            <div>Encomendas</div>
                            <div>Total Gasto</div>
                            <div>Última Compra</div>
                            <div>Estado</div>
                            <div></div>

                        </div>

                        {filteredCustomers.map(
                            (customer) => (

                                <div
                                    key={customer.id}
                                    className="
                                        grid
                                        grid-cols-[2fr_180px_150px_150px_160px_120px_60px]
                                        items-center
                                        border-b
                                        border-gray-100
                                        px-6
                                        py-5
                                        transition
                                        hover:bg-[#F8F9F5]
                                    "
                                >

                                    <div>

                                        <p className="font-semibold">
                                            {customer.name}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {customer.email}
                                        </p>

                                    </div>

                                    <div>

                                        {customer.city}

                                    </div>

                                    <div className="font-medium">

                                        {customer.orders}

                                    </div>

                                    <div className="font-semibold">

                                        {customer.totalSpent.toFixed(
                                            2
                                        )} €

                                    </div>

                                    <div>

                                        {customer.lastOrder}

                                    </div>

                                    <div>

                                        <StatusBadge
                                            status={
                                                customer.active
                                                    ? "ACTIVE"
                                                    : "INACTIVE"
                                            }
                                        />

                                    </div>

                                    <div className="flex justify-end">

                                        <Link
                                            href={`/admin/customers/${customer.id}`}
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

                {filteredCustomers.length === 0 && (

                    <EmptyState
                        title="Nenhum cliente encontrado"
                        description="Experimente alterar os filtros ou a pesquisa."
                    />

                )}

            </SectionCard>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Clientes"
                    value={customers.length}
                    subtitle="Registados"
                    icon={Users}
                />

                <MetricCard
                    title="Ativos"
                    value={activeCustomers}
                    subtitle="Com conta ativa"
                    icon={Users}
                    color="#16A34A"
                />

                <MetricCard
                    title="Receita"
                    value={`${totalRevenue.toFixed(2)} €`}
                    subtitle="Total gasto"
                    icon={Users}
                    color="#2563EB"
                />

                <MetricCard
                    title="Ticket Médio"
                    value={`${averageTicket.toFixed(2)} €`}
                    subtitle="Por cliente"
                    icon={Users}
                    color="#D97706"
                />

            </div>

        </div>

    );

}