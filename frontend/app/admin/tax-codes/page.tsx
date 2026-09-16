"use client";

import Link from "next/link";

import {
    useEffect,
    useState,
} from "react";

import {
    Eye,
    Pencil,
    Plus,
    TicketPercent,
    Search,
    Trash2,
} from "lucide-react";

import {
    deleteTaxCode,
    getTaxCodes,
    type TaxCode,
} from "@/lib/api/tax-codes";

export default function AdminTaxCodesPage() {
    const [taxCodes, setTaxCodes] =
        useState<TaxCode[]>([]);

    const [search, setSearch] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    async function loadTaxCodes() {
        try {
            setIsLoading(true);
            setError(null);

            const response =
                await getTaxCodes();

            setTaxCodes(response.data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar os Tax Codes.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadTaxCodes();
    }, []);

    async function handleDelete(
        taxCode: TaxCode,
    ) {
        const confirmed =
            window.confirm(
                `Tem a certeza que pretende remover o Tax Code "${taxCode.code}"?`,
            );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(taxCode.id);

            await deleteTaxCode(
                taxCode.id,
            );

            setTaxCodes(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !== taxCode.id,
                    ),
            );
        } catch (err) {
            window.alert(
                err instanceof Error
                    ? err.message
                    : "Não foi possível remover o Tax Code.",
            );
        } finally {
            setDeletingId(null);
        }
    }

    const filteredTaxCodes =
        taxCodes.filter((taxCode) => {
            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return true;
            }

            return (
                taxCode.code
                    .toLowerCase()
                    .includes(value) ||
                taxCode.name
                    .toLowerCase()
                    .includes(value)
            );
        });

    return (
        <div className="space-y-8">
            {/* HEADER */}

            <div className="
                flex
                items-center
                justify-between
                gap-4
            ">
                <div>
                    <div className="
                        flex
                        items-center
                        gap-3
                    ">
                        <div className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#EEF2EA]
                            text-[#55624A]
                        ">
                            <TicketPercent
                                size={21}
                            />
                        </div>

                        <h1 className="
                            text-2xl
                            font-semibold
                            text-gray-900
                        ">
                            Taxas de IVA
                        </h1>
                    </div>

                    <p className="
                        mt-2
                        text-sm
                        text-gray-500
                    ">
                        Gerir códigos e taxas de IVA
                        utilizados nos produtos.
                    </p>
                </div>

                <Link
                    href="/admin/tax-codes/new"
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-[#55624A]
                        px-5
                        py-3
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#46533D]
                    "
                >
                    <Plus size={18} />

                    Nova Taxa de IVA
                </Link>
            </div>

            {/* SEARCH */}

            <div className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-4
                shadow-sm
            ">
                <div className="relative">
                    <Search
                        size={18}
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Pesquisar por código ou nome..."
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            bg-gray-50
                            py-3
                            pl-11
                            pr-4
                            text-sm
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:bg-white
                        "
                    />
                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="
                    rounded-2xl
                    border
                    border-red-100
                    bg-red-50
                    px-5
                    py-4
                    text-sm
                    text-red-700
                ">
                    {error}
                </div>
            )}

            {/* TABLE */}

            <div className="
                overflow-hidden
                rounded-3xl
                border
                border-gray-200
                bg-white
                shadow-sm
            ">
                {isLoading ? (
                    <div className="
                        flex
                        min-h-[300px]
                        items-center
                        justify-center
                        text-sm
                        text-gray-500
                    ">
                        A carregar Taxas de IVA...
                    </div>
                ) : filteredTaxCodes.length === 0 ? (
                    <div className="
                        flex
                        min-h-[300px]
                        flex-col
                        items-center
                        justify-center
                        px-6
                        text-center
                    ">
                        <div className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-2xl
                            bg-gray-100
                            text-gray-400
                        ">
                            <ReceiptPercent
                                size={25}
                            />
                        </div>

                        <h2 className="
                            mt-4
                            text-base
                            font-semibold
                            text-gray-800
                        ">
                            Nenhum Taxa de IVA encontrada
                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-gray-500
                        ">
                            Crie uma nova taxa ou altere
                            os critérios de pesquisa.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="
                            w-full
                            min-w-[700px]
                        ">
                            <thead>
                                <tr className="
                                    border-b
                                    border-gray-100
                                    bg-gray-50/70
                                ">
                                    <th className="
                                        px-6
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Código
                                    </th>

                                    <th className="
                                        px-6
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Nome
                                    </th>

                                    <th className="
                                        px-6
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        IVA
                                    </th>

                                    <th className="
                                        px-6
                                        py-4
                                        text-left
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Estado
                                    </th>

                                    <th className="
                                        px-6
                                        py-4
                                        text-right
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-gray-500
                                    ">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTaxCodes.map(
                                    (taxCode) => (
                                        <tr
                                            key={
                                                taxCode.id
                                            }
                                            className="
                                                border-b
                                                border-gray-100
                                                last:border-0
                                                hover:bg-gray-50/50
                                            "
                                        >
                                            <td className="
                                                px-6
                                                py-5
                                            ">
                                                <span className="
                                                    rounded-lg
                                                    bg-gray-100
                                                    px-3
                                                    py-1.5
                                                    font-mono
                                                    text-xs
                                                    font-semibold
                                                    text-gray-700
                                                ">
                                                    {
                                                        taxCode.code
                                                    }
                                                </span>
                                            </td>

                                            <td className="
                                                px-6
                                                py-5
                                            ">
                                                <span className="
                                                    text-sm
                                                    font-medium
                                                    text-gray-800
                                                ">
                                                    {
                                                        taxCode.name
                                                    }
                                                </span>
                                            </td>

                                            <td className="
                                                px-6
                                                py-5
                                            ">
                                                <span className="
                                                    text-sm
                                                    font-semibold
                                                    text-gray-800
                                                ">
                                                    {Number(
                                                        taxCode.rate,
                                                    ).toLocaleString(
                                                        "pt-PT",
                                                        {
                                                            maximumFractionDigits: 2,
                                                        },
                                                    )}
                                                    %
                                                </span>
                                            </td>

                                            <td className="
                                                px-6
                                                py-5
                                            ">
                                                {taxCode.active ? (
                                                    <span className="
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-full
                                                        border
                                                        border-green-100
                                                        bg-green-50
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-medium
                                                        text-green-700
                                                    ">
                                                        <span className="
                                                            h-1.5
                                                            w-1.5
                                                            rounded-full
                                                            bg-green-500
                                                        " />

                                                        Ativo
                                                    </span>
                                                ) : (
                                                    <span className="
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        rounded-full
                                                        border
                                                        border-gray-200
                                                        bg-gray-100
                                                        px-3
                                                        py-1.5
                                                        text-xs
                                                        font-medium
                                                        text-gray-600
                                                    ">
                                                        <span className="
                                                            h-1.5
                                                            w-1.5
                                                            rounded-full
                                                            bg-gray-400
                                                        " />

                                                        Inativo
                                                    </span>
                                                )}
                                            </td>

                                            <td className="
                                                px-6
                                                py-5
                                            ">
                                                <div className="
                                                    flex
                                                    items-center
                                                    justify-end
                                                    gap-2
                                                ">
                                                    <Link
                                                        href={`/admin/tax-codes/${taxCode.id}`}
                                                        title="Ver"
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            text-gray-500
                                                            transition
                                                            hover:bg-gray-100
                                                            hover:text-gray-800
                                                        "
                                                    >
                                                        <Eye
                                                            size={17}
                                                        />
                                                    </Link>

                                                    <Link
                                                        href={`/admin/tax-codes/${taxCode.id}/edit`}
                                                        title="Editar"
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            text-gray-500
                                                            transition
                                                            hover:bg-[#EEF2EA]
                                                            hover:text-[#55624A]
                                                        "
                                                    >
                                                        <Pencil
                                                            size={17}
                                                        />
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        title="Remover"
                                                        disabled={
                                                            deletingId ===
                                                            taxCode.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                taxCode,
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            h-9
                                                            w-9
                                                            items-center
                                                            justify-center
                                                            rounded-lg
                                                            text-gray-400
                                                            transition
                                                            hover:bg-red-50
                                                            hover:text-red-600
                                                            disabled:opacity-50
                                                        "
                                                    >
                                                        <Trash2
                                                            size={17}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!isLoading &&
                filteredTaxCodes.length > 0 && (
                    <p className="
                        text-sm
                        text-gray-500
                    ">
                        {filteredTaxCodes.length}{" "}
                        {filteredTaxCodes.length === 1
                            ? "Taxa de IVA"
                            : "Taxas de IVA"}
                    </p>
                )}
        </div>
    );
}