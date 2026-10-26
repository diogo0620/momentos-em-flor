
"use client";

import {
    FormEvent,
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Check,
    Loader2,
    Pencil,
    Plus,
    Save,
    TicketPercent,
    Trash2,
    Truck,
    X,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import { adminTaxCodesApi } from "@/lib/api/tax-codes/admin-tax-codes";

import type { AdminTaxCodeList } from "@/types/tax-codes/admin/admin-tax-code-list";
import type { AdminCreateTaxCode } from "@/types/tax-codes/admin/admin-create-tax-code";
import type { AdminUpdateTaxCode } from "@/types/tax-codes/admin/admin-update-tax-code";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";

type TaxCodeFormValues = {
    name: string;
    description: string;
    rate: string;
    active: boolean;
};

type ModalState =
    | { mode: "create" }
    | { mode: "edit"; taxCode: AdminTaxCodeList }
    | { mode: "delete"; taxCode: AdminTaxCodeList }
    | null;

const emptyForm: TaxCodeFormValues = {
    name: "",
    description: "",
    rate: "",
    active: true,
};

const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-gray-300 focus:border-[#9EAB91] focus:ring-4 focus:ring-[#D6DEC8]/40 disabled:cursor-not-allowed disabled:bg-gray-50";

export default function SettingsPage() {
    const [deliveryFee, setDeliveryFee] = useState("");
    const [taxCodes, setTaxCodes] = useState<AdminTaxCodeList[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingDelivery, setIsSavingDelivery] = useState(false);
    const [isSavingTaxCode, setIsSavingTaxCode] = useState(false);
    const [isDeletingTaxCode, setIsDeletingTaxCode] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [modal, setModal] = useState<ModalState>(null);
    const [form, setForm] = useState<TaxCodeFormValues>(emptyForm);
    const [modalError, setModalError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [settingsResponse, taxCodesResponse] =
                await Promise.all([
                    storeSettingsApi.getCurrent(),
                    adminTaxCodesApi.getAll({
                        page: 1,
                        pageSize: 100,
                        sort: "name",
                        order: "asc",
                    }),
                ]);

            setDeliveryFee(
                String(settingsResponse.deliveryFee),
            );

            setTaxCodes(taxCodesResponse.items);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as definições.",
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    async function handleDeliverySubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        const parsedDeliveryFee = Number(deliveryFee);

        if (
            deliveryFee.trim() === "" ||
            !Number.isFinite(parsedDeliveryFee) ||
            parsedDeliveryFee < 0
        ) {
            setError(
                "A taxa de entrega deve ser um valor igual ou superior a 0 €.",
            );
            return;
        }

        try {
            setIsSavingDelivery(true);

            await storeSettingsApi.updateCurrent({deliveryFee: parsedDeliveryFee});

            setDeliveryFee(String(parsedDeliveryFee));
            setSuccess("Taxa de entrega guardada com sucesso.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a taxa de entrega.",
            );
        } finally {
            setIsSavingDelivery(false);
        }
    }

    function openCreateModal() {
        setForm(emptyForm);
        setModalError(null);
        setModal({ mode: "create" });
    }

    function openEditModal(taxCode: AdminTaxCodeList) {
        setForm({
            name: taxCode.name,
            description: taxCode.description,
            rate: String(taxCode.rate),
            active: taxCode.active,
        });

        setModalError(null);
        setModal({ mode: "edit", taxCode });
    }

    function closeModal() {
        if (isSavingTaxCode || isDeletingTaxCode) {
            return;
        }

        setModal(null);
        setModalError(null);
    }

    async function handleTaxCodeSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setModalError(null);

        const name = form.name.trim();
        const description = form.description.trim();
        const rate = Number(form.rate);

        if (!name) {
            setModalError("O nome é obrigatório.");
            return;
        }

        if (!description) {
            setModalError("A descrição é obrigatória.");
            return;
        }

        if (
            form.rate.trim() === "" ||
            !Number.isFinite(rate) ||
            rate < 0 ||
            rate > 100
        ) {
            setModalError(
                "A taxa de IVA deve estar entre 0% e 100%.",
            );
            return;
        }

        try {
            setIsSavingTaxCode(true);

            if (modal?.mode === "edit") {
                const payload: AdminUpdateTaxCode = {
                    name,
                    description,
                    rate,
                    active: form.active,
                };

                await adminTaxCodesApi.update(
                    modal.taxCode.id,
                    payload,
                );
            } else if (modal?.mode === "create") {
                const payload: AdminCreateTaxCode = {
                    name,
                    description,
                    rate,
                    active: form.active,
                };

                await adminTaxCodesApi.create(payload);
            } else {
                return;
            }

            const wasCreating = modal.mode === "create";

            setModal(null);
            setSuccess(
                wasCreating
                    ? "Taxa de IVA criada com sucesso."
                    : "Taxa de IVA atualizada com sucesso.",
            );

            await loadSettings();
        } catch (err) {
            setModalError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a taxa de IVA.",
            );
        } finally {
            setIsSavingTaxCode(false);
        }
    }

    async function handleDeleteTaxCode() {
        if (modal?.mode !== "delete") {
            return;
        }

        try {
            setIsDeletingTaxCode(true);
            setModalError(null);

            await adminTaxCodesApi.delete(
                modal.taxCode.id,
            );

            setTaxCodes((current) =>
                current.filter(
                    (taxCode) => taxCode.id !== modal.taxCode.id,
                ),
            );

            setModal(null);
            setSuccess("Taxa de IVA removida com sucesso.");
        } catch (err) {
            setModalError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível remover a taxa de IVA.",
            );
        } finally {
            setIsDeletingTaxCode(false);
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="Definições"
                subtitle="Configurações gerais da loja"
            />

            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700"
                >
                    {success}
                </div>
            )}

            {/* TAXA DE ENTREGA */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <Truck size={19} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-[#2F3B2A]">
                            Entrega
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Configurações relacionadas aos custos de entrega.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleDeliverySubmit}
                    className="mt-8"
                >
                    <div className="max-w-md">
                        <label
                            htmlFor="deliveryFee"
                            className="block text-sm font-semibold text-[#2F3B2A]"
                        >
                            Taxa de entrega
                        </label>

                        <p className="mt-1 text-sm text-gray-400">
                            Valor cobrado ao cliente pela entrega.
                        </p>

                        <div className="relative mt-3">
                            <input
                                id="deliveryFee"
                                name="deliveryFee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={deliveryFee}
                                onChange={(event) =>
                                    setDeliveryFee(event.target.value)
                                }
                                disabled={isLoading || isSavingDelivery}
                                className={`${inputClassName} pr-12`}
                                placeholder="0,00"
                            />

                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-gray-400">
                                €
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={isLoading || isSavingDelivery}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46533D] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSavingDelivery ? (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={17} />
                            )}

                            {isSavingDelivery
                                ? "A guardar..."
                                : "Guardar alterações"}
                        </button>
                    </div>
                </form>
            </section>

            {/* TAXAS DE IVA */}

            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                            <TicketPercent size={19} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Taxas de IVA
                            </h2>

                            <p className="mt-1 text-sm text-gray-400">
                                Adiciona, edita ou remove as taxas de IVA disponíveis na loja.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={isLoading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46533D] disabled:opacity-50"
                    >
                        <Plus size={17} />
                        Nova taxa
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-gray-500">
                        <Loader2
                            size={18}
                            className="animate-spin"
                        />
                        A carregar definições...
                    </div>
                ) : taxCodes.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <TicketPercent
                            size={28}
                            className="mx-auto text-gray-300"
                        />

                        <p className="mt-3 font-medium text-gray-700">
                            Ainda não existem taxas de IVA.
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Cria uma taxa para a poderes associar aos produtos.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px] text-left">
                            <thead className="bg-[#F8FAF6] text-xs uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">
                                        Nome
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Descrição
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Taxa
                                    </th>
                                    <th className="px-6 py-4 font-semibold">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-right font-semibold">
                                        Ações
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {taxCodes.map((taxCode) => (
                                    <tr
                                        key={taxCode.id}
                                        className="transition hover:bg-gray-50/70"
                                    >
                                        <td className="px-6 py-4 text-sm font-semibold text-[#2F3B2A]">
                                            {taxCode.name}
                                        </td>

                                        <td className="max-w-sm px-6 py-4 text-sm text-gray-500">
                                            {taxCode.description}
                                        </td>

                                        <td className="px-6 py-4 text-sm font-semibold tabular-nums text-[#2F3B2A]">
                                            {taxCode.rate}%
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                                    taxCode.active
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {taxCode.active
                                                    ? "Ativa"
                                                    : "Inativa"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    title="Editar taxa"
                                                    aria-label={`Editar taxa ${taxCode.name}`}
                                                    onClick={() =>
                                                        openEditModal(taxCode)
                                                    }
                                                    className="rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-[#9EAB91] hover:bg-[#F3F5EE] hover:text-[#55624A]"
                                                >
                                                    <Pencil size={16} />
                                                </button>

                                                <button
                                                    type="button"
                                                    title="Remover taxa"
                                                    aria-label={`Remover taxa ${taxCode.name}`}
                                                    onClick={() => {
                                                        setModalError(null);
                                                        setModal({
                                                            mode: "delete",
                                                            taxCode,
                                                        });
                                                    }}
                                                    className="rounded-xl border border-red-100 p-2 text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* MODAL */}

            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="tax-code-modal-title"
                        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="tax-code-modal-title"
                                    className="text-xl font-bold text-[#2F3B2A]"
                                >
                                    {modal.mode === "create"
                                        ? "Nova taxa de IVA"
                                        : modal.mode === "edit"
                                          ? "Editar taxa de IVA"
                                          : "Remover taxa de IVA"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {modal.mode === "delete"
                                        ? `Tens a certeza de que pretendes remover "${modal.taxCode.name}"? Esta ação não pode ser anulada.`
                                        : "Preenche os dados da taxa de IVA."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={
                                    isSavingTaxCode ||
                                    isDeletingTaxCode
                                }
                                aria-label="Fechar modal"
                                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {modal.mode === "delete" ? (
                            <>
                                {modalError && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {modalError}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isDeletingTaxCode}
                                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDeleteTaxCode}
                                        disabled={isDeletingTaxCode}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isDeletingTaxCode ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}

                                        {isDeletingTaxCode
                                            ? "A remover..."
                                            : "Remover"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form
                                onSubmit={handleTaxCodeSubmit}
                                className="mt-6 space-y-5"
                            >
                                <div>
                                    <label
                                        htmlFor="taxCodeName"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Nome
                                    </label>

                                    <input
                                        id="taxCodeName"
                                        autoFocus
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                name: event.target.value,
                                            }))
                                        }
                                        className={inputClassName}
                                        placeholder="IVA Normal"
                                        disabled={isSavingTaxCode}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="taxCodeDescription"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Descrição
                                    </label>

                                    <textarea
                                        id="taxCodeDescription"
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                description: event.target.value,
                                            }))
                                        }
                                        className={inputClassName}
                                        rows={3}
                                        placeholder="Descrição da taxa de IVA"
                                        disabled={isSavingTaxCode}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="taxCodeRate"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        Taxa de IVA (%)
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="taxCodeRate"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={form.rate}
                                            onChange={(event) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    rate: event.target.value,
                                                }))
                                            }
                                            className={`${inputClassName} pr-10`}
                                            placeholder="23"
                                            disabled={isSavingTaxCode}
                                        />

                                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">
                                            %
                                        </span>
                                    </div>
                                </div>

                                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-[#F8FAF6] p-4">
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800">
                                            Taxa ativa
                                        </span>

                                        <span className="mt-1 block text-xs text-gray-500">
                                            As taxas inativas deixam de estar disponíveis para utilização.
                                        </span>
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                active: event.target.checked,
                                            }))
                                        }
                                        disabled={isSavingTaxCode}
                                        className="h-4 w-4 accent-[#55624A]"
                                    />
                                </label>

                                {modalError && (
                                    <div
                                        role="alert"
                                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {modalError}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={isSavingTaxCode}
                                        className="rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSavingTaxCode}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46533D] disabled:opacity-50"
                                    >
                                        {isSavingTaxCode ? (
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : modal.mode === "create" ? (
                                            <Plus size={16} />
                                        ) : (
                                            <Check size={16} />
                                        )}

                                        {isSavingTaxCode
                                            ? "A guardar..."
                                            : modal.mode === "create"
                                              ? "Criar taxa"
                                              : "Guardar alterações"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
