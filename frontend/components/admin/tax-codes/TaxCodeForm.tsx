"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    ArrowLeft,
    Check,
    Loader2,
    Save,
} from "lucide-react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import {
    createTaxCode,
    updateTaxCode,
    type TaxCode,
} from "@/lib/api/tax-codes";

type Props = {
    taxCode?: TaxCode;
};

export default function TaxCodeForm({
    taxCode,
}: Props) {
    const router = useRouter();

    const isEditing = !!taxCode;

    const [code, setCode] = useState(
        taxCode?.code ?? "",
    );

    const [name, setName] = useState(
        taxCode?.name ?? "",
    );

    const [rate, setRate] = useState(
        taxCode?.rate?.toString() ?? "",
    );

    const [active, setActive] = useState(
        taxCode?.active ?? true,
    );

    const [isSaving, setIsSaving] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    function validate() {
        if (!code.trim()) {
            return "O código é obrigatório.";
        }

        if (!name.trim()) {
            return "O nome é obrigatório.";
        }

        if (rate.trim() === "") {
            return "A taxa de IVA é obrigatória.";
        }

        const numericRate = Number(rate);

        if (
            Number.isNaN(numericRate) ||
            numericRate < 0 ||
            numericRate > 100
        ) {
            return "A taxa deve estar entre 0% e 100%.";
        }

        return null;
    }

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const validationError =
            validate();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setIsSaving(true);
            setError(null);

            const payload = {
                code: code.trim().toUpperCase(),
                name: name.trim(),
                rate: Number(rate),
            };

            if (isEditing) {
                await updateTaxCode(
                    taxCode.id,
                    {
                        ...payload,
                        active,
                    },
                );

                router.push(
                    `/admin/tax-codes/${taxCode.id}`,
                );
            } else {
                const response =
                    await createTaxCode(
                        payload,
                    );

                router.push(
                    `/admin/tax-codes/${response.data.id}`,
                );
            }

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar o código de imposto.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8">
            {/* HEADER */}

            <div className="flex items-center gap-4">
                <Link
                    href={
                        isEditing
                            ? `/admin/tax-codes/${taxCode.id}`
                            : "/admin/tax-codes"
                    }
                    className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-600
                        transition
                        hover:bg-gray-50
                    "
                >
                    <ArrowLeft size={18} />
                </Link>

                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditing
                            ? "Editar Taxa de IVA"
                            : "Nova Taxa de IVA"}
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {isEditing
                            ? "Atualize os dados do código de imposto."
                            : "Crie um novo código de imposto para os produtos."}
                    </p>
                </div>
            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="max-w-3xl"
            >
                <div className="
                    rounded-3xl
                    border
                    border-gray-200
                    bg-white
                    p-8
                    shadow-sm
                ">
                    <div className="space-y-6">
                        {/* CODE */}

                        <div>
                            <label
                                htmlFor="code"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Código
                            </label>

                            <input
                                id="code"
                                type="text"
                                value={code}
                                onChange={(event) =>
                                    setCode(
                                        event.target.value,
                                    )
                                }
                                placeholder="PT_NORMAL"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-[#55624A]
                                    focus:ring-2
                                    focus:ring-[#55624A]/10
                                "
                            />

                            <p className="mt-2 text-xs text-gray-400">
                                Código único utilizado internamente.
                            </p>
                        </div>

                        {/* NAME */}

                        <div>
                            <label
                                htmlFor="name"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Nome
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value,
                                    )
                                }
                                placeholder="IVA Normal"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-[#55624A]
                                    focus:ring-2
                                    focus:ring-[#55624A]/10
                                "
                            />
                        </div>

                        {/* RATE */}

                        <div>
                            <label
                                htmlFor="rate"
                                className="
                                    mb-2
                                    block
                                    text-sm
                                    font-medium
                                    text-gray-700
                                "
                            >
                                Taxa de IVA
                            </label>

                            <div className="relative">
                                <input
                                    id="rate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={rate}
                                    onChange={(event) =>
                                        setRate(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="23"
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-gray-200
                                        bg-white
                                        px-4
                                        py-3
                                        pr-12
                                        text-sm
                                        outline-none
                                        transition
                                        focus:border-[#55624A]
                                        focus:ring-2
                                        focus:ring-[#55624A]/10
                                    "
                                />

                                <span className="
                                    pointer-events-none
                                    absolute
                                    right-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-sm
                                    text-gray-400
                                ">
                                    %
                                </span>
                            </div>

                            <p className="mt-2 text-xs text-gray-400">
                                Valor entre 0% e 100%.
                            </p>
                        </div>

                        {/* ACTIVE */}

                        {isEditing && (
                            <div className="
                                rounded-2xl
                                border
                                border-gray-100
                                bg-[#F8FAF6]
                                p-5
                            ">
                                <label className="
                                    flex
                                    cursor-pointer
                                    items-center
                                    justify-between
                                    gap-4
                                ">
                                    <div>
                                        <p className="
                                            text-sm
                                            font-medium
                                            text-gray-800
                                        ">
                                            Código ativo
                                        </p>

                                        <p className="
                                            mt-1
                                            text-xs
                                            text-gray-500
                                        ">
                                            Códigos inativos deixam de estar
                                            disponíveis para utilização.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={active}
                                        onClick={() =>
                                            setActive(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        className={`
                                            relative
                                            h-7
                                            w-12
                                            rounded-full
                                            transition
                                            ${
                                                active
                                                    ? "bg-[#55624A]"
                                                    : "bg-gray-300"
                                            }
                                        `}
                                    >
                                        <span
                                            className={`
                                                absolute
                                                top-1
                                                h-5
                                                w-5
                                                rounded-full
                                                bg-white
                                                shadow-sm
                                                transition
                                                ${
                                                    active
                                                        ? "left-6"
                                                        : "left-1"
                                                }
                                            `}
                                        />
                                    </button>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="
                            mt-6
                            rounded-xl
                            border
                            border-red-100
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        ">
                            {error}
                        </div>
                    )}

                    {/* ACTIONS */}

                    <div className="
                        mt-8
                        flex
                        items-center
                        justify-end
                        gap-3
                        border-t
                        border-gray-100
                        pt-6
                    ">
                        <Link
                            href={
                                isEditing
                                    ? `/admin/tax-codes/${taxCode.id}`
                                    : "/admin/tax-codes"
                            }
                            className="
                                rounded-xl
                                px-5
                                py-3
                                text-sm
                                font-medium
                                text-gray-600
                                transition
                                hover:bg-gray-50
                            "
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={isSaving}
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
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {isSaving ? (
                                <>
                                    <Loader2
                                        size={17}
                                        className="animate-spin"
                                    />

                                    A guardar...
                                </>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <Check size={17} />
                                    ) : (
                                        <Save size={17} />
                                    )}

                                    {isEditing
                                        ? "Guardar alterações"
                                        : "Criar Taxa de IVA"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}