
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
    PlugZap,
    CheckCircle2,
    XCircle,
    Truck,
    X,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";

import { adminTaxCodesApi } from "@/lib/api/tax-codes/admin-tax-codes";

import type { AdminTaxCodeList } from "@/types/tax-codes/admin/admin-tax-code-list";
import type { AdminCreateTaxCode } from "@/types/tax-codes/admin/admin-create-tax-code";
import type { AdminUpdateTaxCode } from "@/types/tax-codes/admin/admin-update-tax-code";
import { storeSettingsApi } from "@/lib/api/store-settings/store-settings";
import { adminMoloniApi } from "@/lib/api/moloni/admin-moloni";

import type { AdminMoloniSettings } from "@/types/moloni/admin/admin-moloni-settings";
import type { AdminConfigureMoloni } from "@/types/moloni/admin/admin-configure-moloni";

type TaxCodeFormValues = {
    name: string;
    description: string;
    rate: string;
    moloniId: string;
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
    moloniId: "",
    active: true,
};

const inputClassName =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-gray-300 focus:border-[#9EAB91] focus:ring-4 focus:ring-[#D6DEC8]/40 disabled:cursor-not-allowed disabled:bg-gray-50";

export default function SettingsPage() {
    const [companyName, setCompanyName] = useState("Momentos em Flor");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [companyAddress, setCompanyAddress] = useState("");
    const [partnerEmail, setPartnerEmail] = useState("");
    const [deliveryFee, setDeliveryFee] = useState("");
    const [deliveryTaxCodeId, setDeliveryTaxCodeId] = useState("");
    const [deliveryMoloniProductId, setDeliveryMoloniProductId] = useState("");
    const [deliveryAreaEnabled, setDeliveryAreaEnabled] = useState(true);
    const [deliveryAreaName, setDeliveryAreaName] = useState("Santa Maria da Feira e arredores");
    const [deliveryCenterLatitude, setDeliveryCenterLatitude] = useState("40.924574");
    const [deliveryCenterLongitude, setDeliveryCenterLongitude] = useState("-8.543956");
    const [deliveryRadiusKm, setDeliveryRadiusKm] = useState("15");
    const [taxCodes, setTaxCodes] = useState<AdminTaxCodeList[]>([]);
    const [moloniSettings, setMoloniSettings] = useState<AdminMoloniSettings | null>(null);
    const [moloniForm, setMoloniForm] = useState<AdminConfigureMoloni>({
        companyId: "",
        clientId: "",
        clientSecret: "",
        username: "",
        password: "",
        invoiceDocumentSetId: "",
        creditNoteDocumentSetId: "",
        paymentMethodId: "",
        createDocumentsAsDraft: true,
        signedPdf: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingDelivery, setIsSavingDelivery] = useState(false);
    const [isSavingTaxCode, setIsSavingTaxCode] = useState(false);
    const [isDeletingTaxCode, setIsDeletingTaxCode] = useState(false);
    const [isSavingMoloni, setIsSavingMoloni] = useState(false);
    const [isTestingMoloni, setIsTestingMoloni] = useState(false);
    const [moloniError, setMoloniError] = useState<string | null>(null);
    const [moloniSuccess, setMoloniSuccess] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [modal, setModal] = useState<ModalState>(null);
    const [form, setForm] = useState<TaxCodeFormValues>(emptyForm);
    const [modalError, setModalError] = useState<string | null>(null);

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [settingsResponse, taxCodesResponse, moloniResponse] =
                await Promise.all([
                    storeSettingsApi.getCurrent(),
                    adminTaxCodesApi.getAll({
                        page: 1,
                        pageSize: 100,
                        sort: "name",
                        order: "asc",
                    }),
                    adminMoloniApi.getSettings(),
                ]);

            setDeliveryFee(
                String(settingsResponse.deliveryFee),
            );
            setCompanyName(settingsResponse.companyName ?? "Momentos em Flor");
            setContactEmail(settingsResponse.contactEmail ?? "");
            setContactPhone(settingsResponse.contactPhone ?? "");
            setWhatsappNumber(settingsResponse.whatsappNumber ?? "");
            setCompanyAddress(settingsResponse.companyAddress ?? "");
            setPartnerEmail(settingsResponse.partnerEmail ?? "");
            setDeliveryTaxCodeId(
                settingsResponse.deliveryTaxCodeId
                    ? String(settingsResponse.deliveryTaxCodeId)
                    : "",
            );
            setDeliveryMoloniProductId(
                settingsResponse.deliveryMoloniProductId
                    ? String(settingsResponse.deliveryMoloniProductId)
                    : "",
            );
            setDeliveryAreaEnabled(settingsResponse.deliveryAreaEnabled);
            setDeliveryAreaName(settingsResponse.deliveryAreaName);
            setDeliveryCenterLatitude(String(settingsResponse.deliveryCenterLatitude));
            setDeliveryCenterLongitude(String(settingsResponse.deliveryCenterLongitude));
            setDeliveryRadiusKm(String(settingsResponse.deliveryRadiusKm));

            setTaxCodes(taxCodesResponse.items);
            setMoloniSettings(moloniResponse);
            setMoloniForm((current) => ({
                ...current,
                companyId: moloniResponse.companyId ?? "",
                clientId: moloniResponse.clientId ?? "",
                username: moloniResponse.username ?? "",
                invoiceDocumentSetId: moloniResponse.invoiceDocumentSetId ?? "",
                creditNoteDocumentSetId: moloniResponse.creditNoteDocumentSetId ?? "",
                paymentMethodId: moloniResponse.paymentMethodId ?? "",
                createDocumentsAsDraft: moloniResponse.createDocumentsAsDraft ?? true,
                signedPdf: moloniResponse.signedPdf ?? true,
            }));
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
        const parsedLatitude = Number(deliveryCenterLatitude);
        const parsedLongitude = Number(deliveryCenterLongitude);
        const parsedRadius = Number(deliveryRadiusKm);

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

        if (!deliveryTaxCodeId) {
            setError("Seleciona o código de IVA normal aplicado à entrega.");
            return;
        }

        const parsedDeliveryMoloniProductId = deliveryMoloniProductId.trim()
            ? Number(deliveryMoloniProductId)
            : null;
        if (
            parsedDeliveryMoloniProductId !== null &&
            (!Number.isInteger(parsedDeliveryMoloniProductId) || parsedDeliveryMoloniProductId < 1)
        ) {
            setError("O ID Moloni do artigo de portes deve ser um número inteiro positivo.");
            return;
        }

        if (!deliveryAreaName.trim()) {
            setError("Indica um nome para a zona de entrega.");
            return;
        }
        if (!Number.isFinite(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90 || !Number.isFinite(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180) {
            setError("As coordenadas do centro da zona de entrega não são válidas.");
            return;
        }
        if (!Number.isFinite(parsedRadius) || parsedRadius < 1 || parsedRadius > 200) {
            setError("O raio de entrega deve estar entre 1 e 200 km.");
            return;
        }

        try {
            setIsSavingDelivery(true);

            await storeSettingsApi.updateCurrent({
                companyName: companyName.trim() || "Momentos em Flor",
                contactEmail: contactEmail.trim() || null,
                contactPhone: contactPhone.trim() || null,
                whatsappNumber: whatsappNumber.trim() || null,
                companyAddress: companyAddress.trim() || null,
                partnerEmail: partnerEmail.trim() || null,
                deliveryFee: parsedDeliveryFee,
                deliveryTaxCodeId: Number(deliveryTaxCodeId),
                deliveryMoloniProductId: parsedDeliveryMoloniProductId,
                deliveryAreaEnabled,
                deliveryAreaName: deliveryAreaName.trim(),
                deliveryCenterLatitude: parsedLatitude,
                deliveryCenterLongitude: parsedLongitude,
                deliveryRadiusKm: parsedRadius,
            });

            setDeliveryFee(String(parsedDeliveryFee));
            setSuccess("Informações da empresa e entrega guardadas com sucesso.");
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

    async function handleMoloniSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMoloniError(null);
        setMoloniSuccess(null);

        const payload: AdminConfigureMoloni = {
            companyId: moloniForm.companyId.trim(),
            clientId: moloniForm.clientId.trim(),
            clientSecret: moloniForm.clientSecret,
            username: moloniForm.username.trim(),
            password: moloniForm.password,
            invoiceDocumentSetId: moloniForm.invoiceDocumentSetId.trim(),
            creditNoteDocumentSetId: moloniForm.creditNoteDocumentSetId.trim(),
            paymentMethodId: moloniForm.paymentMethodId.trim(),
            createDocumentsAsDraft: moloniForm.createDocumentsAsDraft,
            signedPdf: moloniForm.signedPdf,
        };

        if (!payload.companyId || !payload.clientId || !payload.username ||
            (!moloniSettings?.hasCredentials && (!payload.clientSecret || !payload.password))) {
            setMoloniError("Preenche as credenciais obrigatórias da Moloni.");
            return;
        }


        try {
            setIsSavingMoloni(true);
            const response = await adminMoloniApi.updateSettings(payload);
            setMoloniSettings(response);
            setMoloniForm((current) => ({ ...current, clientSecret: "", password: "" }));
            setMoloniSuccess("Configuração Moloni guardada com sucesso. Testa a ligação para validar as credenciais.");
        } catch (err) {
            setMoloniError(err instanceof Error ? err.message : "Não foi possível guardar a configuração Moloni.");
        } finally {
            setIsSavingMoloni(false);
        }
    }

    async function handleMoloniTestConnection() {
        setMoloniError(null);
        setMoloniSuccess(null);

        try {
            setIsTestingMoloni(true);
            const response = await adminMoloniApi.testConnection();
            setMoloniSettings(response);

            if (response.connected) {
                setMoloniSuccess("Ligação à Moloni estabelecida com sucesso.");
            } else {
                setMoloniError(response.lastConnectionError || "Não foi possível estabelecer ligação à Moloni.");
            }
        } catch (err) {
            setMoloniError(err instanceof Error ? err.message : "Ocorreu um erro ao testar a ligação à Moloni.");
        } finally {
            setIsTestingMoloni(false);
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
            moloniId: taxCode.moloniId ?? "",
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
        const moloniId = Number(form.moloniId);

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

        if (
            form.moloniId.trim() === "" ||
            !Number.isSafeInteger(moloniId) ||
            moloniId <= 0
        ) {
            setModalError("O ID Moloni é obrigatório e deve ser um número inteiro positivo.");
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
                    moloniId,
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
                    moloniId,
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
                            Empresa e entrega
                        </h2>

                        <p className="mt-1 text-sm text-gray-400">
                            Gere os contactos públicos, os custos e a zona geográfica de entrega.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={handleDeliverySubmit}
                    className="mt-8"
                >
                    <div className="mb-8 border-b border-gray-100 pb-8">
                        <h3 className="text-base font-semibold text-[#2F3B2A]">Informações públicas da empresa</h3>
                        <p className="mt-1 text-sm text-gray-400">Usadas nas páginas de contacto, parceria e apoio ao cliente.</p>
                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <label className="text-sm font-semibold text-[#2F3B2A]">Nome da empresa<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} maxLength={120} className={`${inputClassName} mt-2`} required /></label>
                            <label className="text-sm font-semibold text-[#2F3B2A]">Email de atendimento<input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} maxLength={254} className={`${inputClassName} mt-2`} placeholder="apoio@momentosemflor.pt" /></label>
                            <label className="text-sm font-semibold text-[#2F3B2A]">Telefone<input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} maxLength={40} className={`${inputClassName} mt-2`} placeholder="+351 ..." /></label>
                            <label className="text-sm font-semibold text-[#2F3B2A]">WhatsApp<input value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} maxLength={40} className={`${inputClassName} mt-2`} placeholder="+351 ..." /></label>
                            <label className="text-sm font-semibold text-[#2F3B2A] md:col-span-2">Morada da empresa<input value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} maxLength={300} className={`${inputClassName} mt-2`} /></label>
                            <label className="text-sm font-semibold text-[#2F3B2A]">Email para novas parcerias<input type="email" value={partnerEmail} onChange={(event) => setPartnerEmail(event.target.value)} maxLength={254} className={`${inputClassName} mt-2`} placeholder="parcerias@momentosemflor.pt" /></label>
                        </div>
                    </div>
                    <div className="grid max-w-4xl gap-5 md:grid-cols-3">
                        <div>
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

                        <div>
                            <label htmlFor="deliveryTaxCode" className="block text-sm font-semibold text-[#2F3B2A]">IVA da entrega</label>
                            <p className="mt-1 text-sm text-gray-400">Código de IVA usado na linha DELIVERY_FEE.</p>
                            <select id="deliveryTaxCode" value={deliveryTaxCodeId} onChange={(event) => setDeliveryTaxCodeId(event.target.value)} disabled={isLoading || isSavingDelivery} className={`${inputClassName} mt-3`}>
                                <option value="">Selecionar taxa</option>
                                {taxCodes.filter((taxCode) => taxCode.active).map((taxCode) => (
                                    <option key={taxCode.id} value={taxCode.id}>{taxCode.name} ({taxCode.rate}%)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="deliveryMoloniProductId" className="block text-sm font-semibold text-[#2F3B2A]">Artigo de portes na Moloni</label>
                            <p className="mt-1 text-sm text-gray-400">ID do artigo usado na última linha da fatura.</p>
                            <input
                                id="deliveryMoloniProductId"
                                type="number"
                                min="1"
                                step="1"
                                value={deliveryMoloniProductId}
                                onChange={(event) => setDeliveryMoloniProductId(event.target.value)}
                                disabled={isLoading || isSavingDelivery}
                                className={`${inputClassName} mt-3`}
                                placeholder="Criado automaticamente"
                            />
                        </div>
                    </div>

                    <div className="mt-7 border-t border-gray-100 pt-6">
                        <label className="flex items-start gap-3 rounded-2xl bg-[#F7F9F4] p-4">
                            <input type="checkbox" checked={deliveryAreaEnabled} onChange={(event) => setDeliveryAreaEnabled(event.target.checked)} disabled={isLoading || isSavingDelivery} className="mt-1 h-4 w-4 accent-[#55624A]" />
                            <span><span className="block text-sm font-semibold text-[#2F3B2A]">Restringir a zona de entrega</span><span className="mt-1 block text-xs leading-5 text-gray-400">As moradas fora do raio configurado serão recusadas antes do pagamento.</span></span>
                        </label>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label htmlFor="deliveryAreaName" className="block text-sm font-semibold text-[#2F3B2A]">Nome apresentado ao cliente</label>
                                <input id="deliveryAreaName" value={deliveryAreaName} onChange={(event) => setDeliveryAreaName(event.target.value)} disabled={isLoading || isSavingDelivery || !deliveryAreaEnabled} className={`${inputClassName} mt-2`} />
                            </div>
                            <div>
                                <label htmlFor="deliveryLatitude" className="block text-sm font-semibold text-[#2F3B2A]">Latitude do centro</label>
                                <input id="deliveryLatitude" type="number" step="0.000001" value={deliveryCenterLatitude} onChange={(event) => setDeliveryCenterLatitude(event.target.value)} disabled={isLoading || isSavingDelivery || !deliveryAreaEnabled} className={`${inputClassName} mt-2`} />
                            </div>
                            <div>
                                <label htmlFor="deliveryLongitude" className="block text-sm font-semibold text-[#2F3B2A]">Longitude do centro</label>
                                <input id="deliveryLongitude" type="number" step="0.000001" value={deliveryCenterLongitude} onChange={(event) => setDeliveryCenterLongitude(event.target.value)} disabled={isLoading || isSavingDelivery || !deliveryAreaEnabled} className={`${inputClassName} mt-2`} />
                            </div>
                            <div>
                                <label htmlFor="deliveryRadius" className="block text-sm font-semibold text-[#2F3B2A]">Raio de entrega</label>
                                <div className="relative mt-2"><input id="deliveryRadius" type="number" min="1" max="200" step="0.5" value={deliveryRadiusKm} onChange={(event) => setDeliveryRadiusKm(event.target.value)} disabled={isLoading || isSavingDelivery || !deliveryAreaEnabled} className={`${inputClassName} pr-12`} /><span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-gray-400">km</span></div>
                            </div>
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

            {/* INTEGRAÇÃO MOLONI */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                            <PlugZap size={19} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#2F3B2A]">Integração Moloni</h2>
                            <p className="mt-1 text-sm text-gray-400">Configura as credenciais e testa a ligação à tua conta Moloni.</p>
                        </div>
                    </div>
                    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${moloniSettings?.connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {moloniSettings?.connected ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {moloniSettings?.connected ? "Ligação ativa" : "Não ligada"}
                    </span>
                </div>

                {moloniError && <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{moloniError}</div>}
                {moloniSuccess && <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{moloniSuccess}</div>}

                {moloniSettings?.lastConnectionCheckAt && (
                    <p className="mt-5 text-xs text-gray-400">
                        Última verificação: {new Date(moloniSettings.lastConnectionCheckAt).toLocaleString("pt-PT")}
                        {moloniSettings.lastConnectionError ? ` · ${moloniSettings.lastConnectionError}` : ""}
                    </p>
                )}

                <form onSubmit={handleMoloniSubmit} className="mt-7 space-y-5">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label htmlFor="moloniCompanyId" className="mb-2 block text-sm font-semibold text-gray-700">ID da empresa</label>
                            <input id="moloniCompanyId" value={moloniForm.companyId} onChange={(event) => setMoloniForm((current) => ({ ...current, companyId: event.target.value }))} disabled={isLoading || isSavingMoloni} className={inputClassName} placeholder="ID da empresa Moloni" />
                        </div>
                        <div>
                            <label htmlFor="moloniClientId" className="mb-2 block text-sm font-semibold text-gray-700">Developer ID</label>
                            <input id="moloniClientId" value={moloniForm.clientId} onChange={(event) => setMoloniForm((current) => ({ ...current, clientId: event.target.value }))} disabled={isLoading || isSavingMoloni} className={inputClassName} placeholder="Developer ID" />
                        </div>
                        <div>
                            <label htmlFor="moloniClientSecret" className="mb-2 block text-sm font-semibold text-gray-700">Developer Secret</label>
                            <input id="moloniClientSecret" type="password" autoComplete="new-password" value={moloniForm.clientSecret} onChange={(event) => setMoloniForm((current) => ({ ...current, clientSecret: event.target.value }))} disabled={isLoading || isSavingMoloni} className={inputClassName} placeholder={moloniSettings?.hasCredentials ? "Introduz para atualizar o secret" : "Developer Secret"} />
                        </div>
                        <div>
                            <label htmlFor="moloniUsername" className="mb-2 block text-sm font-semibold text-gray-700">Utilizador</label>
                            <input id="moloniUsername" type="email" autoComplete="username" value={moloniForm.username} onChange={(event) => setMoloniForm((current) => ({ ...current, username: event.target.value }))} disabled={isLoading || isSavingMoloni} className={inputClassName} placeholder="Email da conta Moloni" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="moloniPassword" className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                            <input id="moloniPassword" type="password" autoComplete="new-password" value={moloniForm.password} onChange={(event) => setMoloniForm((current) => ({ ...current, password: event.target.value }))} disabled={isLoading || isSavingMoloni} className={inputClassName} placeholder={moloniSettings?.hasCredentials ? "Introduz para atualizar a password" : "Password da conta Moloni"} />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                        <div className="mb-4">
                            <h3 className="font-semibold text-[#2F3B2A]">Emissão fiscal</h3>
                            <p className="mt-1 text-xs leading-5 text-gray-400">As faturas e notas de crédito podem ser criadas como rascunho para validação antes de serem fechadas no Moloni.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label htmlFor="moloniInvoiceSet" className="mb-2 block text-sm font-semibold text-gray-700">ID da série de faturas</label>
                                <input id="moloniInvoiceSet" inputMode="numeric" value={moloniForm.invoiceDocumentSetId} onChange={(event) => setMoloniForm((current) => ({ ...current, invoiceDocumentSetId: event.target.value }))} className={inputClassName} placeholder="Ex.: 12345" />
                            </div>
                            <div>
                                <label htmlFor="moloniCreditNoteSet" className="mb-2 block text-sm font-semibold text-gray-700">ID da série de notas de crédito</label>
                                <input id="moloniCreditNoteSet" inputMode="numeric" value={moloniForm.creditNoteDocumentSetId} onChange={(event) => setMoloniForm((current) => ({ ...current, creditNoteDocumentSetId: event.target.value }))} className={inputClassName} placeholder="Ex.: 12346" />
                            </div>
                        </div>

                        <label className="mt-5 flex items-start gap-3 rounded-2xl border border-gray-200 p-4">
                            <input type="checkbox" checked={moloniForm.createDocumentsAsDraft} onChange={(event) => setMoloniForm((current) => ({ ...current, createDocumentsAsDraft: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#55624A]" />
                            <span><span className="block text-sm font-semibold text-gray-700">Criar documentos como rascunho</span><span className="mt-1 block text-xs text-gray-400">Exige confirmação manual no detalhe do documento antes de obter o PDF e enviar o email ao cliente.</span></span>
                        </label>

                        <label className="mt-3 flex items-start gap-3 rounded-2xl border border-gray-200 p-4">
                            <input type="checkbox" checked={moloniForm.signedPdf} onChange={(event) => setMoloniForm((current) => ({ ...current, signedPdf: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#55624A]" />
                            <span><span className="block text-sm font-semibold text-gray-700">Pedir PDF assinado</span><span className="mt-1 block text-xs text-gray-400">Controla o parâmetro signed enviado à Moloni quando é pedida a ligação do PDF.</span></span>
                        </label>

                        <p className={`mt-4 text-xs font-semibold ${moloniSettings?.fiscalConfigurationComplete ? "text-green-700" : "text-amber-700"}`}>
                            {moloniSettings?.fiscalConfigurationComplete ? "Configuração fiscal completa." : "A configuração fiscal ainda está incompleta."}
                        </p>
                    </div>

                    <p className="text-xs leading-5 text-gray-400">Por segurança, o secret e a password nunca são devolvidos pela API. Deixa-os vazios para manter os valores atuais.</p>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                        <button type="button" onClick={handleMoloniTestConnection} disabled={isLoading || isTestingMoloni || isSavingMoloni || !moloniSettings?.configured} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D6DEC8] px-5 py-3 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EE] disabled:cursor-not-allowed disabled:opacity-50">
                            {isTestingMoloni ? <Loader2 size={17} className="animate-spin" /> : <PlugZap size={17} />}
                            {isTestingMoloni ? "A testar ligação..." : "Testar ligação"}
                        </button>
                        <button type="submit" disabled={isLoading || isSavingMoloni || isTestingMoloni} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46533D] disabled:cursor-not-allowed disabled:opacity-50">
                            {isSavingMoloni ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                            {isSavingMoloni ? "A guardar..." : "Guardar configuração Moloni"}
                        </button>
                    </div>
                </form>
            </section>

            {/* TAXAS DE IVA */}
            {Boolean(0) && (
            <>
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

                                <div>
                                    <label
                                        htmlFor="taxCodeMoloniId"
                                        className="mb-2 block text-sm font-semibold text-gray-700"
                                    >
                                        ID Moloni
                                    </label>

                                    <input
                                        id="taxCodeMoloniId"
                                        type="number"
                                        min="1"
                                        step="1"
                                        inputMode="numeric"
                                        value={form.moloniId}
                                        onChange={(event) =>
                                            setForm((current) => ({
                                                ...current,
                                                moloniId: event.target.value,
                                            }))
                                        }
                                        className={inputClassName}
                                        placeholder="ID da taxa na Moloni"
                                        disabled={isSavingTaxCode}
                                        required
                                    />

                                    <p className="mt-2 text-xs leading-5 text-gray-500">
                                        As taxas de IVA não são criadas automaticamente. Associa manualmente a taxa existente na Moloni.
                                    </p>
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
            </>
            )}
        </div>
    );
}
