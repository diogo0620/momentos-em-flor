import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Globe,
    Mail,
    MapPin,
    Phone,
    Ruler,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";

import { getFlorist } from "@/lib/api/florists";

import DeleteFloristButton from "@/components/admin/florists/DeleteFloristButton";

export default async function FloristDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const floristId = Number(id);

    if (Number.isNaN(floristId)) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold">
                    Florista inválida
                </h2>

                <p className="mt-2 text-gray-500">
                    O ID fornecido não é válido.
                </p>

                <Link
                    href="/admin/florists"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às floristas
                </Link>
            </div>
        );
    }

    let florist;

    try {
        const response = await getFlorist(
            floristId,
        );

        florist = response.data;
    } catch {
        return (
            <div>
                <Link
                    href="/admin/florists"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às floristas
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <Building2
                        size={40}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-4 text-2xl font-bold">
                        Florista não encontrada
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível encontrar a
                        florista #{id}.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* BACK */}

            <Link
                href="/admin/florists"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
            >
                <ArrowLeft size={16} />
                Voltar às floristas
            </Link>

            {/* HEADER */}

            <div className="mt-6">
                <PageHeader
                    title={florist.name}
                    subtitle={`Detalhes da florista #${florist.id}`}
                />

                <div className="mt-6 flex flex-wrap justify-end gap-3">

    <Link
        href={`/admin/florists/${florist.id}/edit`}
        className="
            rounded-2xl
            bg-[#55624A]
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:opacity-90
        "
    >
        Editar florista
    </Link>

    <DeleteFloristButton
        floristId={florist.id}
        floristName={florist.name}
    />

</div>
            </div>

            {/* SUMMARY */}

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                {/* ACTIVE */}

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Estado
                    </p>

                    <div className="mt-3">
                        <StatusBadge
                            status={
                                florist.active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                        />
                    </div>
                </div>

                {/* ORDERS */}

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Encomendas
                    </p>

                    <div className="mt-3">
                        <span
                            className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-sm
                                font-medium
                                ${
                                    florist.acceptingOrders
                                        ? "bg-[#D6DEC8] text-[#55624A]"
                                        : "bg-gray-100 text-gray-500"
                                }
                            `}
                        >
                            {florist.acceptingOrders
                                ? "Aceita encomendas"
                                : "Não aceita encomendas"}
                        </span>
                    </div>
                </div>

                {/* RADIUS */}

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Ruler size={19} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Raio de entrega
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#2F3B2A]">
                                {florist.deliveryRadiusKm}{" "}
                                km
                            </p>
                        </div>
                    </div>
                </div>

                {/* CITY */}

                <div className="rounded-3xl bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <MapPin size={19} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Localização
                            </p>

                            <p className="mt-1 text-lg font-bold text-[#2F3B2A]">
                                {florist.address.city}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* MAIN CONTENT */}

            <div className="mt-8 grid gap-8 lg:grid-cols-3">

                {/* CONTACT */}

                <div className="rounded-3xl bg-white p-8 shadow-sm lg:col-span-2">

                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Contactos
                    </h2>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                <Mail size={18} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Email
                                </p>

                                <a
                                    href={`mailto:${florist.email}`}
                                    className="mt-1 block font-medium text-[#55624A] hover:underline"
                                >
                                    {florist.email}
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                <Phone size={18} />
                            </div>

                            <div>
                                <p className="text-sm text-gray-400">
                                    Telefone
                                </p>

                                <a
                                    href={`tel:${florist.phone}`}
                                    className="mt-1 block font-medium text-[#2F3B2A]"
                                >
                                    {florist.phone}
                                </a>
                            </div>
                        </div>

                        {florist.website && (
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                    <Globe size={18} />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-400">
                                        Website
                                    </p>

                                    <a
                                        href={
                                            florist.website
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 block font-medium text-[#55624A] hover:underline"
                                    >
                                        {florist.website}
                                    </a>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

                {/* BUSINESS INFO */}

                <div className="rounded-3xl bg-white p-8 shadow-sm">

                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Dados empresariais
                    </h2>

                    <div className="mt-8 space-y-6">

                        <div>
                            <p className="text-sm text-gray-400">
                                Nome comercial
                            </p>

                            <p className="mt-1 font-medium text-[#2F3B2A]">
                                {florist.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">
                                Nome legal
                            </p>

                            <p className="mt-1 font-medium text-[#2F3B2A]">
                                {florist.legalName ||
                                    "—"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400">
                                NIF
                            </p>

                            <p className="mt-1 font-medium text-[#2F3B2A]">
                                {florist.taxNumber}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

            {/* ADDRESS */}

            <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <MapPin size={20} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Morada
                        </h2>

                        <p className="text-sm text-gray-400">
                            Localização da florista
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    <div className="lg:col-span-2">
                        <p className="text-sm text-gray-400">
                            Morada
                        </p>

                        <p className="mt-1 font-medium text-[#2F3B2A]">
                            {florist.address.street}
                        </p>

                        {florist.address.street2 && (
                            <p className="mt-1 text-sm text-gray-500">
                                {
                                    florist.address
                                        .street2
                                }
                            </p>
                        )}
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Código Postal
                        </p>

                        <p className="mt-1 font-medium text-[#2F3B2A]">
                            {
                                florist.address
                                    .postalCode
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Cidade
                        </p>

                        <p className="mt-1 font-medium text-[#2F3B2A]">
                            {
                                florist.address
                                    .city
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Distrito
                        </p>

                        <p className="mt-1 font-medium text-[#2F3B2A]">
                            {
                                florist.address
                                    .district
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            País
                        </p>

                        <p className="mt-1 font-medium text-[#2F3B2A]">
                            {
                                florist.address
                                    .countryCode
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Latitude
                        </p>

                        <p className="mt-1 font-mono text-sm text-gray-600">
                            {
                                florist.address
                                    .latitude
                            }
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-400">
                            Longitude
                        </p>

                        <p className="mt-1 font-mono text-sm text-gray-600">
                            {
                                florist.address
                                    .longitude
                            }
                        </p>
                    </div>

                </div>

            </div>

            {/* DESCRIPTION */}

            {florist.description && (
                <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Descrição
                    </h2>

                    <p className="mt-5 max-w-4xl leading-7 text-gray-600">
                        {florist.description}
                    </p>

                </div>
            )}

            {/* METADATA */}

            <div className="mt-8 rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Metadados
                </h2>

                <div className="mt-6 grid gap-6 md:grid-cols-2">

                    <div className="flex gap-3">

                        <CalendarDays
                            size={18}
                            className="mt-0.5 text-gray-400"
                        />

                        <div>
                            <p className="text-sm text-gray-400">
                                Criada em
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {new Date(
                                    florist.createdAt,
                                ).toLocaleString(
                                    "pt-PT",
                                )}
                            </p>
                        </div>

                    </div>

                    <div className="flex gap-3">

                        <CalendarDays
                            size={18}
                            className="mt-0.5 text-gray-400"
                        />

                        <div>
                            <p className="text-sm text-gray-400">
                                Atualizada em
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {new Date(
                                    florist.updatedAt,
                                ).toLocaleString(
                                    "pt-PT",
                                )}
                            </p>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}