"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
    createFlorist,
    updateFlorist,
} from "@/lib/api/florists";

import type { Florist } from "@/types/florist";

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
        useState(
            florist?.legalName ?? "",
        );

    const [taxNumber, setTaxNumber] =
        useState(
            florist?.taxNumber ?? "",
        );

    const [email, setEmail] =
        useState(florist?.email ?? "");

    const [phone, setPhone] =
        useState(florist?.phone ?? "");

    const [website, setWebsite] =
        useState(
            florist?.website ?? "",
        );

    const [description, setDescription] =
        useState(
            florist?.description ?? "",
        );

    const [deliveryRadiusKm, setDeliveryRadiusKm] =
        useState(
            florist?.deliveryRadiusKm?.toString() ??
                "",
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
            florist?.address.countryCode ??
                "PT",
        );

    const [latitude, setLatitude] =
        useState(
            florist?.address.latitude?.toString() ??
                "",
        );

    const [longitude, setLongitude] =
        useState(
            florist?.address.longitude?.toString() ??
                "",
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

        const lat = Number(latitude);

        const lng = Number(longitude);

        if (
            Number.isNaN(radius) ||
            radius < 0
        ) {
            setError(
                "O raio de entrega é inválido.",
            );
            return;
        }

        if (Number.isNaN(lat)) {
            setError(
                "A latitude é inválida.",
            );
            return;
        }

        if (Number.isNaN(lng)) {
            setError(
                "A longitude é inválida.",
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

                latitude: lat,

                longitude: lng,

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
                await createFlorist(
                    data,
                );

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
                        placeholder="Momentos em Flor Braga"
                    />

                    <Field
                        label="Nome legal"
                        value={legalName}
                        onChange={setLegalName}
                        placeholder="Momentos em Flor Braga, Lda."
                    />

                    <Field
                        label="NIF"
                        value={taxNumber}
                        onChange={setTaxNumber}
                        required
                        placeholder="999999990"
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
                        placeholder="braga@momentosemflor.pt"
                    />

                    <Field
                        label="Telefone"
                        value={phone}
                        onChange={setPhone}
                        required
                        placeholder="+351253000000"
                    />

                    <Field
                        label="Website"
                        value={website}
                        onChange={setWebsite}
                        placeholder="https://momentosemflor.pt"
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
                    onChange={(e) =>
                        setDescription(
                            e.target.value,
                        )
                    }
                    rows={5}
                    maxLength={500}
                    placeholder="Descrição da florista..."
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
                        placeholder="20"
                    />

                </div>

            </div>

            {/* MORADA */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Morada
                </h2>

                <div className="mt-8 grid gap-6 md:grid-cols-2">

                    <Field
                        label="Morada"
                        value={street}
                        onChange={setStreet}
                        required
                        placeholder="Rua das Flores 123"
                    />

                    <Field
                        label="Morada adicional"
                        value={street2}
                        onChange={setStreet2}
                        placeholder="2º Esq."
                    />

                    <Field
                        label="Código postal"
                        value={postalCode}
                        onChange={setPostalCode}
                        required
                        placeholder="4700-000"
                    />

                    <Field
                        label="Cidade"
                        value={city}
                        onChange={setCity}
                        required
                        placeholder="Braga"
                    />

                    <Field
                        label="Distrito"
                        value={district}
                        onChange={setDistrict}
                        required
                        placeholder="Braga"
                    />

                    <Field
                        label="Código do país"
                        value={countryCode}
                        onChange={setCountryCode}
                        required
                        placeholder="PT"
                        maxLength={2}
                    />

                </div>

            </div>

            {/* COORDENADAS */}

            <div className="rounded-3xl bg-white p-8 shadow-sm">

                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    Coordenadas
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Utilizadas para calcular a distância
                    até ao local de entrega.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-2">

                    <Field
                        label="Latitude"
                        type="number"
                        value={latitude}
                        onChange={setLatitude}
                        required
                        step="any"
                        placeholder="41.5454"
                    />

                    <Field
                        label="Longitude"
                        type="number"
                        value={longitude}
                        onChange={setLongitude}
                        required
                        step="any"
                        placeholder="-8.4265"
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
                    onChange={(e) =>
                        setNotes(
                            e.target.value,
                        )
                    }
                    rows={4}
                    placeholder="Notas internas sobre a morada..."
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

            {/* ACTIONS */}

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
                        transition
                        hover:bg-gray-50
                        disabled:opacity-50
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
                        transition
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {isSubmitting
                        ? isEditing
                            ? "A guardar..."
                            : "A criar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar florista"}
                </button>

            </div>
        </form>
    );
}

type FieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
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
    placeholder,
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
                onChange={(e) =>
                    onChange(
                        e.target.value,
                    )
                }
                required={required}
                placeholder={placeholder}
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
                    transition
                    focus:border-[#55624A]
                "
            />
        </div>
    );
}

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