"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
    Flower2,
    MapPin,
    Package,
    Pencil,
    Plus,
    Star,
} from "lucide-react";

import { florists } from "@/data/florists";

import PageHeader from "@/components/admin/common/PageHeader";
import FilterBar from "@/components/admin/common/FilterBar";
import SearchInput from "@/components/admin/common/SearchInput";
import SectionCard from "@/components/admin/common/SectionCard";
import StatusBadge from "@/components/admin/common/StatusBadge";
import MetricCard from "@/components/admin/common/MetricCard";
import EmptyState from "@/components/admin/common/EmptyState";

export default function FloristsPage() {

    const [search, setSearch] =
        useState("");

    const [status, setStatus] =
        useState("all");

    const filteredFlorists =
        useMemo(() => {

            let result = [...florists];

            if (search) {

                result = result.filter(
                    (florist) =>
                        florist.name
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            ) ||
                        florist.city
                            .toLowerCase()
                            .includes(
                                search.toLowerCase()
                            )
                );

            }

            if (status === "active") {

                result = result.filter(
                    (f) => f.active
                );

            }

            if (status === "inactive") {

                result = result.filter(
                    (f) => !f.active
                );

            }

            return result.sort((a, b) =>
                a.name.localeCompare(
                    b.name
                )
            );

        }, [search, status]);

    const activeFlorists =
        florists.filter(
            (f) => f.active
        ).length;

    const averageRating =
        florists.reduce(
            (sum, florist) =>
                sum + florist.rating,
            0
        ) / florists.length;

    const totalProducts =
        florists.reduce(
            (sum, florist) =>
                sum +
                florist.products.length,
            0
        );

    return (

        <div className="space-y-8">

            <PageHeader
                title="Floristas"
                subtitle="Gerencie as floristas parceiras."
                buttonText="Nova Florista"
                buttonHref="/admin/florists/new"
                buttonIcon={Plus}
            />

            <FilterBar>

                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Pesquisar floristas..."
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">

                    <p className="text-sm text-gray-500">

                        A mostrar{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {filteredFlorists.length}
                        </span>

                        {" "}de{" "}

                        <span className="font-semibold text-[#2F3B2A]">
                            {florists.length}
                        </span>

                        {" "}floristas

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

                        <option value="active">
                            Ativas
                        </option>

                        <option value="inactive">
                            Inativas
                        </option>

                    </select>

                </div>

            </FilterBar>

            <SectionCard>

                {filteredFlorists.length > 0 && (

                    <>

                        <div
                            className="
                                grid
                                grid-cols-[2fr_1fr_120px_150px_150px_70px]
                                border-b
                                bg-[#F8F9F5]
                                px-6
                                py-4
                                text-sm
                                font-semibold
                                text-gray-500
                            "
                        >

                            <div>Florista</div>

                            <div>Cidade</div>

                            <div>Rating</div>

                            <div>Estado</div>

                            <div>Produtos</div>

                            <div></div>

                        </div>

                        {filteredFlorists.map(
                            (florist) => (

                                <div
                                    key={florist.id}
                                    className="
                                        grid
                                        grid-cols-[2fr_1fr_120px_150px_150px_70px]
                                        items-center
                                        border-b
                                        border-gray-100
                                        px-6
                                        py-5
                                        transition-all
                                        duration-200
                                        hover:bg-[#F8F9F5]
                                    "
                                >

                                    <div>

                                        <h3 className="font-semibold text-[#2F3B2A]">
                                            {florist.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-gray-500">
                                            ID #{florist.id}
                                        </p>

                                    </div>

                                    <div className="flex items-center gap-2 text-gray-700">

                                        <MapPin size={16} />

                                        {florist.city}

                                    </div>

                                    <div className="flex items-center gap-2">

                                        <Star
                                            size={16}
                                            className="fill-yellow-400 text-yellow-400"
                                        />

                                        <span className="font-medium">
                                            {florist.rating}
                                        </span>

                                    </div>
                                                                        {/* ESTADO */}

                                    <div>

                                        <StatusBadge
                                            status={
                                                florist.active
                                                    ? "ACTIVE"
                                                    : "INACTIVE"
                                            }
                                        />

                                    </div>

                                    {/* PRODUTOS */}

                                    <div>

                                        <span
                                            className="
                                                rounded-full
                                                bg-[#D6DEC8]/50
                                                px-3
                                                py-1
                                                text-sm
                                                text-[#55624A]
                                            "
                                        >
                                            {florist.products.length} produtos
                                        </span>

                                    </div>

                                    {/* EDITAR */}

                                    <div className="flex justify-end">

                                        <Link
                                            href={`/admin/florists/${florist.id}`}
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
                                            <Pencil
                                                size={18}
                                            />
                                        </Link>

                                    </div>

                                </div>

                            )
                        )}

                    </>

                )}

                {filteredFlorists.length === 0 && (

                    <EmptyState
                        title="Nenhuma florista encontrada"
                        description="Experimente alterar os filtros ou a pesquisa."
                    />

                )}

            </SectionCard>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Floristas"
                    value={florists.length}
                    subtitle="Registadas"
                    icon={Flower2}
                />

                <MetricCard
                    title="Ativas"
                    value={activeFlorists}
                    subtitle="Disponíveis"
                    icon={Flower2}
                    color="#16A34A"
                />

                <MetricCard
                    title="Rating Médio"
                    value={averageRating.toFixed(1)}
                    subtitle="Avaliação"
                    icon={Star}
                    color="#D97706"
                />

                <MetricCard
                    title="Produtos"
                    value={totalProducts}
                    subtitle="Especialidades"
                    icon={Package}
                    color="#2563EB"
                />

            </div>

        </div>

    );

}