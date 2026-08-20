import Link from "next/link";

import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    Mail,
    MapPin,
    Pencil,
    Phone,
    ShieldCheck,
    UserCircle,
    XCircle,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import { getFlorist } from "@/lib/api/florists";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function getMapsUrl(
    latitude: number,
    longitude: number,
) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export default async function FloristDetailPage({
    params,
}: Props) {
    const { id } = await params;

    const floristId = Number(id);

    if (Number.isNaN(floristId)) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold text-[#2F3B2A]">
                    Florista inválida
                </h2>

                <p className="mt-2 text-gray-500">
                    O ID da florista não é válido.
                </p>

                <Link
                    href="/admin/florists"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#55624A] transition hover:text-[#2F3B2A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às floristas
                </Link>
            </div>
        );
    }

    try {
        const response = await getFlorist(floristId);
        const florist = response.data;

        const mapsUrl = getMapsUrl(
            florist.address.latitude,
            florist.address.longitude,
        );

        return (
            <div>
                {/* HEADER */}

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            href="/admin/florists"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                        >
                            <ArrowLeft size={16} />
                            Voltar às floristas
                        </Link>

                        <div className="mt-6">
                            <PageHeader
                                title={florist.name}
                                subtitle="Detalhes da florista e gestão de acesso ao portal."
                            />
                        </div>
                    </div>

                    <Link
                        href={`/admin/florists/${florist.id}/edit`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#46523C]"
                    >
                        <Pencil size={17} />
                        Editar florista
                    </Link>
                </div>

                {/* STATUS */}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div
                        className={`
                            flex items-center gap-4 rounded-3xl border p-5
                            ${
                                florist.active
                                    ? "border-green-100 bg-green-50"
                                    : "border-red-100 bg-red-50"
                            }
                        `}
                    >
                        {florist.active ? (
                            <CheckCircle2
                                size={24}
                                className="text-green-600"
                            />
                        ) : (
                            <XCircle
                                size={24}
                                className="text-red-500"
                            />
                        )}

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Estado
                            </p>

                            <p
                                className={`
                                    mt-1 font-semibold
                                    ${
                                        florist.active
                                            ? "text-green-700"
                                            : "text-red-600"
                                    }
                                `}
                            >
                                {florist.active
                                    ? "Ativa"
                                    : "Inativa"}
                            </p>
                        </div>
                    </div>

                    <div
                        className={`
                            flex items-center gap-4 rounded-3xl border p-5
                            ${
                                florist.acceptingOrders
                                    ? "border-[#D6DEC8] bg-[#F5F7F2]"
                                    : "border-gray-200 bg-gray-50"
                            }
                        `}
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#55624A]">
                            <ShieldCheck size={23} />
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Novas encomendas
                            </p>

                            <p className="mt-1 font-semibold text-[#2F3B2A]">
                                {florist.acceptingOrders
                                    ? "A aceitar encomendas"
                                    : "Não está a aceitar encomendas"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* INFORMATION */}

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    {/* BUSINESS */}

                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Informação da florista
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Dados comerciais e contactos.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Nome
                                </p>

                                <p className="mt-1 font-medium text-gray-800">
                                    {florist.name}
                                </p>
                            </div>

                            {florist.legalName && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Nome legal
                                    </p>

                                    <p className="mt-1 font-medium text-gray-800">
                                        {florist.legalName}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    NIF
                                </p>

                                <p className="mt-1 font-medium text-gray-800">
                                    {florist.taxNumber}
                                </p>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail
                                    size={18}
                                    className="mt-0.5 text-[#55624A]"
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Email
                                    </p>

                                    <a
                                        href={`mailto:${florist.email}`}
                                        className="mt-1 block font-medium text-gray-800 transition hover:text-[#55624A]"
                                    >
                                        {florist.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone
                                    size={18}
                                    className="mt-0.5 text-[#55624A]"
                                />

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Telefone
                                    </p>

                                    <a
                                        href={`tel:${florist.phone}`}
                                        className="mt-1 block font-medium text-gray-800 transition hover:text-[#55624A]"
                                    >
                                        {florist.phone}
                                    </a>
                                </div>
                            </div>

                            {florist.website && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Website
                                    </p>

                                    <a
                                        href={florist.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center gap-2 font-medium text-[#55624A] hover:underline"
                                    >
                                        {florist.website}
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}

                            {florist.description && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Descrição
                                    </p>

                                    <p className="mt-1 leading-6 text-gray-600">
                                        {florist.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ADDRESS */}

                    <section className="rounded-3xl bg-white p-8 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Localização
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Morada e área de entrega.
                            </p>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                <MapPin size={23} />
                            </div>

                            <div>
                                {florist.address.label && (
                                    <p className="font-semibold text-[#2F3B2A]">
                                        {florist.address.label}
                                    </p>
                                )}

                                <p
                                    className={
                                        florist.address.label
                                            ? "mt-1 text-gray-600"
                                            : "font-semibold text-[#2F3B2A]"
                                    }
                                >
                                    {florist.address.street}

                                    {florist.address.street2 && (
                                        <>
                                            <br />
                                            {florist.address.street2}
                                        </>
                                    )}
                                </p>

                                <p className="mt-1 text-gray-600">
                                    {florist.address.postalCode}{" "}
                                    {florist.address.city}
                                </p>

                                <p className="text-gray-600">
                                    {florist.address.district},{" "}
                                    {florist.address.country}
                                </p>

                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F3F5EE] px-4 py-2.5 text-sm font-medium text-[#55624A] transition hover:bg-[#D6DEC8]"
                                >
                                    <MapPin size={16} />
                                    Abrir no Google Maps
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                Raio de entrega
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#2F3B2A]">
                                {florist.deliveryRadiusKm}{" "}
                                <span className="text-base font-medium text-gray-500">
                                    km
                                </span>
                            </p>
                        </div>
                    </section>
                </div>

                {/* ADMINS */}

                <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                <ShieldCheck size={22} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[#2F3B2A]">
                                    Administradores
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Utilizadores com acesso ao portal da florista.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={`/admin/florists/${florist.id}/edit`}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F3F5EE] px-4 py-2.5 text-sm font-medium text-[#55624A] transition hover:bg-[#D6DEC8]"
                        >
                            <Pencil size={16} />
                            Gerir administradores
                        </Link>
                    </div>

                    <div className="mt-6">
                        {florist.admins.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                                <UserCircle
                                    size={34}
                                    className="mx-auto text-gray-300"
                                />

                                <p className="mt-3 font-medium text-gray-600">
                                    Nenhum administrador associado.
                                </p>

                                <p className="mt-1 text-sm text-gray-400">
                                    Podes adicionar administradores através da edição da florista.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {florist.admins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-[#FAFBF8] p-5 transition hover:border-[#D6DEC8] hover:shadow-sm"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D6DEC8] text-[#55624A]">
                                            <UserCircle size={25} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-[#2F3B2A]">
                                                    {admin.firstName}{" "}
                                                    {admin.lastName}
                                                </p>

                                                <span
                                                    className={`
                                                        rounded-full
                                                        px-2
                                                        py-0.5
                                                        text-[11px]
                                                        font-medium
                                                        ${
                                                            admin.active
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-100 text-gray-500"
                                                        }
                                                    `}
                                                >
                                                    {admin.active
                                                        ? "Ativo"
                                                        : "Inativo"}
                                                </span>
                                            </div>

                                            <p className="mt-1 truncate text-sm text-gray-500">
                                                {admin.email}
                                            </p>

                                            {admin.phone && (
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {admin.phone}
                                                </p>
                                            )}
                                        </div>

                                        <Link
                                            href={`/admin/users/${admin.id}`}
                                            title="Ver administrador"
                                            aria-label={`Ver administrador ${admin.firstName} ${admin.lastName}`}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#55624A] shadow-sm transition hover:bg-[#F3F5EE]"
                                        >
                                            <ExternalLink size={17} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* DATES */}

                <div className="mt-8 grid gap-4 text-sm text-gray-400 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <span className="font-medium text-gray-500">
                            Criada em
                        </span>

                        <p className="mt-1 text-gray-700">
                            {formatDate(florist.createdAt)}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <span className="font-medium text-gray-500">
                            Última atualização
                        </span>

                        <p className="mt-1 text-gray-700">
                            {formatDate(florist.updatedAt)}
                        </p>
                    </div>
                </div>
            </div>
        );
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
                    <h2 className="text-2xl font-bold text-[#2F3B2A]">
                        Florista não encontrada
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível carregar a florista #{id}.
                    </p>
                </div>
            </div>
        );
    }
}