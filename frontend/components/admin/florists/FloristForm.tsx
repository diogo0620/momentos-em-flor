"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFlorist, updateFlorist } from "@/lib/api/florists";
import type { Florist } from "@/types/florist";
import FloristAdminsManager from "@/components/admin/florists/FloristAdminsManager";

type Props = {
    florist?: Florist;
};

export default function FloristForm({
    florist,
}: Props) {
    const router = useRouter();

    const isEditing = !!florist;

    const [name, setName] =
        useState(florist?.name ?? "");

    const [legalName, setLegalName] =
        useState(florist?.legalName ?? "");

    const [taxNumber, setTaxNumber] =
        useState(florist?.taxNumber ?? "");

    const [email, setEmail] =
        useState(florist?.email ?? "");

    const [phone, setPhone] =
        useState(florist?.phone ?? "");

    const [website, setWebsite] =
        useState(florist?.website ?? "");

    const [description, setDescription] =
        useState(florist?.description ?? "");

    const [deliveryRadiusKm, setDeliveryRadiusKm] =
        useState(
            florist?.deliveryRadiusKm?.toString() ?? "",
        );

    const [street, setStreet] =
        useState(
            florist?.address.street ?? "",
        );

    const [street2, setStreet2] =
        useState(
            florist?.address.street2 ?? "",
        );

    const [postalCode, setPostalCode] =
        useState(
            florist?.address.postalCode ?? "",
        );

    const [city, setCity] =
        useState(
            florist?.address.city ?? "",
        );

    const [district, setDistrict] =
        useState(
            florist?.address.district ?? "",
        );

    const [countryCode, setCountryCode] =
        useState(
            florist?.address.countryCode ?? "PT",
        );

    const [notes, setNotes] =
        useState(
            florist?.address.notes ?? "",
        );

    const [active, setActive] =
        useState(
            florist?.active ?? true,
        );

    const [acceptingOrders, setAcceptingOrders] =
        useState(
            florist?.acceptingOrders ?? true,
        );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);

        if (!name.trim()) {
            setError(
                "O nome da florista é obrigatório.",
            );
            return;
        }

        if (!taxNumber.trim()) {
            setError(
                "O NIF é obrigatório.",
            );
            return;
        }

        if (!email.trim()) {
            setError(
                "O email é obrigatório.",
            );
            return;
        }

        if (!phone.trim()) {
            setError(
                "O telefone é obrigatório.",
            );
            return;
        }

        if (!street.trim()) {
            setError(
                "A morada é obrigatória.",
            );
            return;
        }

        if (!postalCode.trim()) {
            setError(
                "O código postal é obrigatório.",
            );
            return;
        }

        if (!city.trim()) {
            setError(
                "A cidade é obrigatória.",
            );
            return;
        }

        if (!district.trim()) {
            setError(
                "O distrito é obrigatório.",
            );
            return;
        }

        if (!countryCode.trim()) {
            setError(
                "O país é obrigatório.",
            );
            return;
        }

        const radius =
            Number(deliveryRadiusKm);

        if (
            Number.isNaN(radius) ||
            radius < 0
        ) {
            setError(
                "O raio de entrega é inválido.",
            );
            return;
        }

        const data = {
            name: name.trim(),

            legalName:
                legalName.trim() ||
                undefined,

            taxNumber:
                taxNumber.trim(),

            email:
                email.trim(),

            phone:
                phone.trim(),

            website:
                website.trim() ||
                undefined,

            description:
                description.trim() ||
                undefined,

            deliveryRadiusKm:
                radius,

            address: {
                street:
                    street.trim(),

                street2:
                    street2.trim() ||
                    undefined,

                postalCode:
                    postalCode.trim(),

                city:
                    city.trim(),

                district:
                    district.trim(),

                countryCode:
                    countryCode
                        .trim()
                        .toUpperCase(),

                notes:
                    notes.trim() ||
                    undefined,
            },
        };

        try {
            setIsSubmitting(true);

            if (isEditing) {
                await updateFlorist(
                    florist.id,
                    {
                        ...data,
                        active,
                        acceptingOrders,
                    },
                );

                router.push(
                    `/admin/florists/${florist.id}`,
                );
            } else {
                await createFlorist(data);

                router.push(
                    "/admin/florists",
                );
            }

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : isEditing
                      ? "Não foi possível atualizar a florista."
                      : "Não foi possível criar a florista.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-8"
        >
            {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* EMPRESA */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Dados da empresa
                </h2>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Field
                        label="Nome comercial"
                        value={name}
                        onChange={setName}
                        required
                    />

                    <Field
                        label="Nome legal"
                        value={legalName}
                        onChange={setLegalName}
                    />

                    <Field
                        label="NIF"
                        value={taxNumber}
                        onChange={setTaxNumber}
                        required
                    />
                </div>
            </div>

            {/* CONTACTOS */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Contactos
                </h2>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Field
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        required
                    />

                    <Field
                        label="Telefone"
                        value={phone}
                        onChange={setPhone}
                        required
                    />

                    <Field
                        label="Website"
                        value={website}
                        onChange={setWebsite}
                    />
                </div>
            </div>

            {/* DESCRIÇÃO */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Descrição
                </h2>

                <textarea
                    value={description}
                    onChange={(event) =>
                        setDescription(
                            event.target.value,
                        )
                    }
                    rows={5}
                    maxLength={500}
                    className="
                        mt-6
                        w-full
                        resize-none
                        rounded-2xl
                        border
                        border-gray-200
                        px-4
                        py-3
                        outline-none
                        focus:border-[#55624A]
                    "
                />
            </div>

            {/* ENTREGA */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Entrega
                </h2>

                <div className="mt-8 max-w-sm">
                    <Field
                        label="Raio de entrega (km)"
                        type="number"
                        value={deliveryRadiusKm}
                        onChange={
                            setDeliveryRadiusKm
                        }
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
            </div>

            {/* MORADA */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Morada
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    As coordenadas são calculadas
                    automaticamente.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    <Field
                        label="Morada"
                        value={street}
                        onChange={setStreet}
                        required
                    />

                    <Field
                        label="Morada adicional"
                        value={street2}
                        onChange={setStreet2}
                    />

                    <Field
                        label="Código postal"
                        value={postalCode}
                        onChange={setPostalCode}
                        required
                    />

                    <Field
                        label="Cidade"
                        value={city}
                        onChange={setCity}
                        required
                    />

                    <Field
                        label="Distrito"
                        value={district}
                        onChange={setDistrict}
                        required
                    />

                    <Field
                        label="Código do país"
                        value={countryCode}
                        onChange={setCountryCode}
                        required
                        maxLength={2}
                    />
                </div>
            </div>

            {/* NOTAS */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Notas da morada
                </h2>

                <textarea
                    value={notes}
                    onChange={(event) =>
                        setNotes(
                            event.target.value,
                        )
                    }
                    rows={4}
                    className="
                        mt-6
                        w-full
                        resize-none
                        rounded-2xl
                        border
                        border-gray-200
                        px-4
                        py-3
                        outline-none
                        focus:border-[#55624A]
                    "
                />
            </div>

            {/* ESTADO */}

            {isEditing && (
                <div className="rounded-3xl bg-white p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-[#2F3B2A]">
                        Estado operacional
                    </h2>

                    <div className="mt-6 space-y-5">
                        <Toggle
                            label="Florista ativa"
                            description="A florista está ativa na plataforma."
                            value={active}
                            onChange={setActive}
                        />

                        <Toggle
                            label="Aceita encomendas"
                            description="A florista pode receber novas propostas."
                            value={acceptingOrders}
                            onChange={
                                setAcceptingOrders
                            }
                        />
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* ADMINISTRADORES                                                 */}
            {/* ================================================================ */}

            {isEditing && (
                <FloristAdminsManager
                    floristId={florist.id}
                    admins={florist.admins ?? []}
                />
            )}

            {/* AÇÕES */}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    disabled={isSubmitting}
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        px-6
                        py-3
                        font-medium
                        text-gray-600
                        hover:bg-gray-50
                    "
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                        rounded-2xl
                        bg-[#55624A]
                        px-6
                        py-3
                        font-medium
                        text-white
                        hover:opacity-90
                        disabled:opacity-50
                    "
                >
                    {isSubmitting
                        ? "A guardar..."
                        : "Guardar alterações"}
                </button>
            </div>
        </form>
    );
}

/* ========================================================================== */
/* FIELD                                                                      */
/* ========================================================================== */

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    min?: string;
    maxLength?: number;
    step?: string;
};

function Field({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    min,
    maxLength,
    step,
}: FieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                required={required}
                min={min}
                maxLength={maxLength}
                step={step}
                className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    outline-none
                    focus:border-[#55624A]
                "
            />
        </div>
    );
}

/* ========================================================================== */
/* TOGGLE                                                                     */
/* ========================================================================== */

type ToggleProps = {
    label: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
};

function Toggle({
    label,
    description,
    value,
    onChange,
}: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-6">
            <div>
                <p className="font-medium text-[#2F3B2A]">
                    {label}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={() =>
                    onChange(!value)
                }
                className={`
                    relative
                    h-7
                    w-12
                    shrink-0
                    rounded-full
                    transition
                    ${
                        value
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
                        shadow
                        transition
                        ${
                            value
                                ? "left-6"
                                : "left-1"
                        }
                    `}
                />
            </button>
        </div>
    );
}