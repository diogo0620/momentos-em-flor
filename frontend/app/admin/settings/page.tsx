
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    Save,
    TicketPercent,
    Truck,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import {
    getStoreSettings,
    updateStoreSettings,
} from "@/lib/api/store-settings";

export default function SettingsPage() {
    const [deliveryFee, setDeliveryFee] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        async function loadSettings() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getStoreSettings();

                setDeliveryFee(
                    response.data.deliveryFee.toString(),
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível carregar as definições.",
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadSettings();
    }, []);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
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
                "O valor da taxa de entrega deve ser igual ou superior a 0 €.",
            );

            return;
        }

        try {
            setIsSaving(true);

            const response = await updateStoreSettings(
                parsedDeliveryFee,
            );

            setDeliveryFee(
                response.data.deliveryFee.toString(),
            );

            setSuccess(
                "Definições guardadas com sucesso.",
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar as definições.",
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="space-y-8 pb-10">
            <PageHeader
                title="Definições"
                subtitle="Configurações gerais da loja"
            />

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                    {success}
                </div>
            )}

            <section className="rounded-3xl bg-white p-8 shadow-sm">
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
                    onSubmit={handleSubmit}
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
                                    setDeliveryFee(
                                        event.target.value,
                                    )
                                }
                                disabled={
                                    isLoading || isSaving
                                }
                                className="
                                    w-full
                                    rounded-2xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-3
                                    pr-12
                                    text-[#2F3B2A]
                                    outline-none
                                    transition
                                    placeholder:text-gray-300
                                    focus:border-[#9EAB91]
                                    focus:ring-4
                                    focus:ring-[#D6DEC8]/40
                                    disabled:cursor-not-allowed
                                    disabled:bg-gray-50
                                "
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
                            disabled={
                                isLoading || isSaving
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#46533D]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >
                            <Save size={17} />

                            {isSaving
                                ? "A guardar..."
                                : "Guardar alterações"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="rounded-3xl bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                            <TicketPercent size={19} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#2F3B2A]">
                                Taxas de IVA
                            </h2>

                            <p className="mt-1 text-sm text-gray-400">
                                Gerir as taxas de IVA disponíveis na loja.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/admin/tax-codes"
                        className="
                            shrink-0
                            rounded-2xl
                            bg-[#55624A]
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-[#46533D]
                        "
                    >
                        Gerir taxas de IVA
                    </Link>
                </div>
            </section>
        </div>
    );
}

