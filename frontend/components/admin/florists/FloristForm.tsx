"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    MapPin,
    Save,
    Store,
} from "lucide-react";

import { adminFloristsApi } from "@/lib/api/florists/admin-florists";

import type { AdminFloristDetail } from "@/types/florists/admin/admin-florist-detail";
import type { AdminCreateFlorist } from "@/types/florists/admin/admin-create-florist";
import type { AdminUpdateFlorist } from "@/types/florists/admin/admin-update-florist";

type FloristFormProps = {
    florist?: AdminFloristDetail;
    children?: ReactNode;
};

const inputClassName =
    "w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F3F5EE]";

const labelClassName = "mb-2 block text-sm font-medium text-[#374132]";

function formatDate(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("pt-PT", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(date);
}

function normalizeOptional(value: string): string | undefined {
    const normalized = value.trim();
    return normalized || undefined;
}

export default function FloristForm({ florist, children }: FloristFormProps) {
    const router = useRouter();
    const isEditing = Boolean(florist);

    const [name, setName] = useState(florist?.name ?? "");
    const [legalName, setLegalName] = useState(florist?.legalName ?? "");
    const [taxNumber, setTaxNumber] = useState(florist?.taxNumber ?? "");
    const [email, setEmail] = useState(florist?.email ?? "");
    const [phone, setPhone] = useState(florist?.phone ?? "");
    const [website, setWebsite] = useState(florist?.website ?? "");
    const [description, setDescription] = useState(florist?.description ?? "");

    const [addressStreet, setAddressStreet] = useState(florist?.addressStreet ?? "");
    const [addressStreetNumber, setAddressStreetNumber] = useState(
        florist?.addressStreetNumber ?? "",
    );
    const [addressStreet2, setAddressStreet2] = useState(florist?.addressStreet2 ?? "");
    const [addressPostalCode, setAddressPostalCode] = useState(
        florist?.addressPostalCode ?? "",
    );
    const [addressCity, setAddressCity] = useState(florist?.addressCity ?? "");
    const [addressDistrict, setAddressDistrict] = useState(
        florist?.addressDistrict ?? "",
    );

    const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(
        florist?.deliveryRadiusKm?.toString() ?? "10",
    );
    const [acceptingOrders, setAcceptingOrders] = useState(
        florist?.acceptingOrders ?? true,
    );
    const [active, setActive] = useState(florist?.active ?? true);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (
            !name.trim() ||
            !legalName.trim() ||
            !taxNumber.trim() ||
            !email.trim() ||
            !phone.trim()
        ) {
            setError("Preenche todos os campos obrigatórios da florista.");
            return;
        }

        if (
            !addressStreet.trim() ||
            !addressStreetNumber.trim() ||
            !addressPostalCode.trim() ||
            !addressCity.trim() ||
            !addressDistrict.trim()
        ) {
            setError("Preenche todos os campos obrigatórios da morada.");
            return;
        }

        const radius = Number(deliveryRadiusKm);

        if (!deliveryRadiusKm.trim() || !Number.isFinite(radius) || radius <= 0) {
            setError("O raio de entrega deve ser um número superior a zero.");
            return;
        }

        if (website.trim()) {
            try {
                new URL(website.trim());
            } catch {
                setError("Introduz um URL válido para o website, incluindo https://.");
                return;
            }
        }

        const payload = {
            name: name.trim(),
            legalName: legalName.trim(),
            taxNumber: taxNumber.trim(),
            email: email.trim(),
            phone: phone.trim(),
            website: normalizeOptional(website),
            description: normalizeOptional(description),
            addressStreet: addressStreet.trim(),
            addressStreetNumber: addressStreetNumber.trim(),
            addressStreet2: normalizeOptional(addressStreet2),
            addressPostalCode: addressPostalCode.trim(),
            addressCity: addressCity.trim(),
            addressDistrict: addressDistrict.trim(),
            addressCountryCode: "PT",
            deliveryRadiusKm: radius,
            acceptingOrders,
            active,
        };

        setSaving(true);

        try {
            if (florist) {
                const data: AdminUpdateFlorist = payload;
                await adminFloristsApi.update(florist.id, data);
                router.push(`/admin/florists/${florist.id}/edit`);
            } else {
                const data: AdminCreateFlorist = payload;
                await adminFloristsApi.create(data);
                router.push("/admin/florists");
            }

            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível guardar a florista. Tenta novamente.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <Store size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Informação da florista
                        </h2>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Dados comerciais e contactos da florista.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className={labelClassName}>
                            Nome comercial <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className={inputClassName}
                            placeholder="Ex.: Flores da Ana"
                            maxLength={150}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="legalName" className={labelClassName}>
                            Nome legal <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="legalName"
                            value={legalName}
                            onChange={(event) => setLegalName(event.target.value)}
                            className={inputClassName}
                            placeholder="Nome fiscal da empresa"
                            maxLength={200}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="taxNumber" className={labelClassName}>
                            NIF <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="taxNumber"
                            value={taxNumber}
                            onChange={(event) => setTaxNumber(event.target.value)}
                            className={inputClassName}
                            placeholder="Número de identificação fiscal"
                            inputMode="numeric"
                            maxLength={20}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClassName}>
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className={inputClassName}
                            placeholder="geral@florista.pt"
                            maxLength={254}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className={labelClassName}>
                            Telefone <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) => setPhone(event.target.value)}
                            className={inputClassName}
                            placeholder="+351 912 345 678"
                            maxLength={30}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="website" className={labelClassName}>
                            Website
                        </label>
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                            className={inputClassName}
                            placeholder="https://www.florista.pt"
                            maxLength={255}
                            disabled={saving}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="description" className={labelClassName}>
                            Descrição
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            className={`${inputClassName} min-h-28 resize-y`}
                            placeholder="Uma breve apresentação da florista..."
                            rows={4}
                            disabled={saving}
                        />
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Morada
                        </h2>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Endereço utilizado para determinar a área de entrega.
                        </p>
                    </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label htmlFor="addressStreet" className={labelClassName}>
                            Rua / Avenida <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="addressStreet"
                            value={addressStreet}
                            onChange={(event) => setAddressStreet(event.target.value)}
                            className={inputClassName}
                            placeholder="Nome da rua ou avenida"
                            maxLength={200}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="addressStreetNumber" className={labelClassName}>
                            Número da porta <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="addressStreetNumber"
                            value={addressStreetNumber}
                            onChange={(event) => setAddressStreetNumber(event.target.value)}
                            className={inputClassName}
                            placeholder="Ex.: 12 ou 12A"
                            maxLength={20}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="addressStreet2" className={labelClassName}>
                            Complemento
                        </label>
                        <input
                            id="addressStreet2"
                            value={addressStreet2}
                            onChange={(event) => setAddressStreet2(event.target.value)}
                            className={inputClassName}
                            placeholder="Andar, fração, bloco..."
                            maxLength={200}
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="addressPostalCode" className={labelClassName}>
                            Código postal <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="addressPostalCode"
                            value={addressPostalCode}
                            onChange={(event) => setAddressPostalCode(event.target.value)}
                            className={inputClassName}
                            placeholder="4000-000"
                            maxLength={20}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="addressCity" className={labelClassName}>
                            Localidade <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="addressCity"
                            value={addressCity}
                            onChange={(event) => setAddressCity(event.target.value)}
                            className={inputClassName}
                            placeholder="Ex.: Porto"
                            maxLength={100}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label htmlFor="addressDistrict" className={labelClassName}>
                            Distrito <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="addressDistrict"
                            value={addressDistrict}
                            onChange={(event) => setAddressDistrict(event.target.value)}
                            className={inputClassName}
                            placeholder="Ex.: Porto"
                            maxLength={100}
                            required
                            disabled={saving}
                        />
                    </div>

                    <div>
                        <label className={labelClassName}>País</label>
                        <div className={`${inputClassName} flex items-center justify-between`}>
                            <span>Portugal</span>
                            <span className="rounded-lg bg-[#F3F5EE] px-2 py-1 text-xs font-semibold text-[#55624A]">
                                PT
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-[#8A9383]">
                            O país está fixo em Portugal.
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-7">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Entregas e estado
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Define a área de entrega e a disponibilidade da florista.
                    </p>
                </div>

                <div>
                    <label htmlFor="deliveryRadiusKm" className={labelClassName}>
                        Raio de entrega (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="deliveryRadiusKm"
                        type="number"
                        min="0.1"
                        max="9999"
                        step="0.1"
                        value={deliveryRadiusKm}
                        onChange={(event) => setDeliveryRadiusKm(event.target.value)}
                        className={inputClassName}
                        placeholder="Ex.: 15"
                        required
                        disabled={saving}
                    />
                    <p className="mt-2 text-xs text-[#8A9383]">
                        Distância máxima a partir da morada da florista.
                    </p>
                </div>

                <div className="mt-6 space-y-5 border-t border-[#EEF0EA] pt-6">
                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={acceptingOrders}
                            onChange={(event) => setAcceptingOrders(event.target.checked)}
                            disabled={saving}
                            className="mt-1 h-4 w-4 rounded border-[#C8D0C1] accent-[#55624A]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Aceita encomendas
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[#7A8474]">
                                Permite que a florista receba propostas de encomendas.
                            </span>
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(event) => setActive(event.target.checked)}
                            disabled={saving}
                            className="mt-1 h-4 w-4 rounded border-[#C8D0C1] accent-[#55624A]"
                        />
                        <span>
                            <span className="block text-sm font-medium text-[#374132]">
                                Florista ativa
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-[#7A8474]">
                                Uma florista inativa não deverá estar disponível na plataforma.
                            </span>
                        </span>
                    </label>
                </div>
            </section>

            {children}

            {isEditing && florist && (
                <section className="rounded-3xl border border-[#E8EBE4] bg-[#F8F9F5] p-6 sm:p-8">
                    <h2 className="text-lg font-semibold text-[#2F3B2A]">
                        Informação do registo
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                        Datas de criação e atualização da florista.
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-[#7A8474]">Criado em</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(florist.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-[#7A8474]">Última atualização</p>
                            <p className="mt-1 text-sm font-medium text-[#2F3B2A]">
                                {formatDate(florist.updatedAt)}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <button
                    type="button"
                    onClick={() => router.push("/admin/florists")}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                >
                    <ArrowLeft size={16} />
                    Cancelar
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={16} />
                    {saving
                        ? "A guardar..."
                        : isEditing
                          ? "Guardar alterações"
                          : "Criar florista"}
                </button>
            </div>
        </form>
    );
}
