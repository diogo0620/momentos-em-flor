"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit,
    Percent,
    Tag,
    Trash2,
    AlertCircle,
} from "lucide-react";

import { getTaxCode, deleteTaxCode, TaxCode } from "@/lib/api/tax-codes";

export default function TaxCodeViewPage() {
    const params = useParams();
    const router = useRouter();

    const id = Number(params.id);

    const [taxCode, setTaxCode] = useState<TaxCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [invalid, setInvalid] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        async function loadTaxCode() {
            if (!id || Number.isNaN(id)) {
                setInvalid(true);
                setLoading(false);
                return;
            }

            try {
                const response = await getTaxCode(id);

                if (!response?.success || !response.data) {
                    setInvalid(true);
                    return;
                }

                setTaxCode(response.data);
            } catch (error) {
                console.error("Error loading :", error);
                setInvalid(true);
            } finally {
                setLoading(false);
            }
        }

        loadTaxCode();
    }, [id]);

    async function handleDelete() {
        if (!taxCode) return;

        const confirmed = window.confirm(
            `Tem a certeza que pretende eliminar a Taxa de IVA "${taxCode.code}"?`
        );

        if (!confirmed) return;

        try {
            setDeleting(true);

            await deleteTaxCode(taxCode.id);

            router.push("/admin/tax-codes");
        } catch (error) {
            console.error("Error deleting tax code:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Não foi possível eliminar a Taxa de IVA."
            );
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-gray-500">
                    A carregar Taxa de IVA...
                </div>
            </div>
        );
    }

    if (invalid || !taxCode) {
        return (
            <div className="space-y-6">
                <button
                    onClick={() => router.push("/admin/tax-codes")}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ás Taxas de IVA
                </button>

                <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-gray-200 bg-white">
                    <div className="flex max-w-md flex-col items-center px-6 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                            <AlertCircle className="h-7 w-7 text-red-500" />
                        </div>

                        <h1 className="text-xl font-semibold text-gray-900">
                            Taxa de IVA inválida
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            A Taxa de IVA que está a tentar consultar não existe
                            ou já não está disponível.
                        </p>

                        <button
                            onClick={() => router.push("/admin/tax-codes")}
                            className="mt-6 rounded-xl bg-[#55624A] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                        >
                            Voltar às Taxas de IVA
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push("/admin/tax-codes")}
                        className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar às Taxas de IVA
                    </button>

                    <h1 className="text-2xl font-semibold text-gray-900">
                        Taxa de IVA {taxCode.code}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Visualização dos detalhes da taxa de imposto.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() =>
                            router.push(`/admin/tax-codes/${taxCode.id}/edit`)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        <Edit className="h-4 w-4" />
                        Editar
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? "A eliminar..." : "Eliminar"}
                    </button>
                </div>
            </div>

            {/* Main card */}
            <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Informação da Taxa de IVA
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Dados associados a esta taxa de imposto.
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                taxCode.active
                                    ? "bg-green-50 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {taxCode.active ? "Ativo" : "Inativo"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                    {/* Code */}
                    <div className="rounded-xl bg-gray-50 p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Tag className="h-5 w-5 text-[#55624A]" />
                        </div>

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Código
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {taxCode.code}
                        </p>
                    </div>

                    {/* Name */}
                    <div className="rounded-xl bg-gray-50 p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Percent className="h-5 w-5 text-[#55624A]" />
                        </div>

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Nome
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {taxCode.name}
                        </p>
                    </div>

                    {/* Rate */}
                    <div className="rounded-xl bg-gray-50 p-5">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Percent className="h-5 w-5 text-[#55624A]" />
                        </div>

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                            Taxa
                        </p>

                        <p className="mt-1 text-lg font-semibold text-gray-900">
                            {Number(taxCode.rate).toLocaleString("pt-PT", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            %
                        </p>
                    </div>
                </div>

                {/* Metadata */}
                <div className="border-t border-gray-100 px-6 py-5">
                    <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div>
                            <dt className="text-gray-400">ID</dt>
                            <dd className="mt-1 font-medium text-gray-900">
                                {taxCode.id}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-gray-400">Estado</dt>
                            <dd className="mt-1 font-medium text-gray-900">
                                {taxCode.active ? "Ativo" : "Inativo"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-gray-400">Criado em</dt>
                            <dd className="mt-1 font-medium text-gray-900">
                                {new Date(
                                    taxCode.createdAt
                                ).toLocaleString("pt-PT")}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-gray-400">Atualizado em</dt>
                            <dd className="mt-1 font-medium text-gray-900">
                                {new Date(
                                    taxCode.updatedAt
                                ).toLocaleString("pt-PT")}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}

