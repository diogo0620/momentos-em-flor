
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    AlertTriangle,
    CalendarDays,
    Clock3,
    FileText,
    MapPin,
    Package,
    RefreshCw,
    Store,
    Plus,
    Pencil,
    Check,
    X,
    Search,
    UserRound,
    CircleCheck,
    CircleX,
    History,
    LoaderCircle,
} from "lucide-react";

import { adminOrdersApi } from "@/lib/api/orders/admin-orders";
import { adminOrderOffersApi } from "@/lib/api/order-offers/admin-order-offers";
import { adminFloristsApi } from "@/lib/api/florists/admin-florists";

import type {
    AdminOrderDetail,
    AdminOrderItem,
    AdminOrderOffer,
} from "@/types/orders/admin/admin-order-detail";

import type {
    AdminDeliveryTimeSlot,
    AdminOccasion,
    AdminOrderCancellationReason,
    AdminOrderItemType,
    AdminOrderOfferStatus,
    AdminOrderStatus,
    AdminProductVariantType,
} from "@/types/orders/admin/admin-order-status";

const ORDER_LIST_URL = "/admin/orders";

const STATUS_LABELS: Record<AdminOrderStatus, string> = {
    CREATED: "Criada",
    PENDING_PAYMENT: "Pendente de pagamento",
    WAITING_FOR_FLORISTS: "À espera de floristas",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<AdminOrderStatus, string> = {
    CREATED: "border-gray-200 bg-gray-100 text-gray-600",
    PENDING_PAYMENT: "border-amber-100 bg-amber-50 text-amber-700",
    WAITING_FOR_FLORISTS: "border-yellow-100 bg-yellow-50 text-yellow-700",
    ASSIGNED: "border-blue-100 bg-blue-50 text-blue-700",
    IN_PRODUCTION: "border-indigo-100 bg-indigo-50 text-indigo-700",
    READY_FOR_DELIVERY: "border-violet-100 bg-violet-50 text-violet-700",
    DELIVERED: "border-green-100 bg-green-50 text-green-700",
    CANCELLED: "border-red-100 bg-red-50 text-red-700",
};

const OFFER_STATUS_LABELS: Record<AdminOrderOfferStatus, string> = {
    PENDING: "Pendente",
    VIEWED: "Visualizada",
    ACCEPTED: "Aceite",
    DECLINED: "Recusada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
};

const OFFER_STATUS_STYLES: Record<AdminOrderOfferStatus, string> = {
    PENDING: "border-amber-100 bg-amber-50 text-amber-700",
    VIEWED: "border-blue-100 bg-blue-50 text-blue-700",
    ACCEPTED: "border-green-100 bg-green-50 text-green-700",
    DECLINED: "border-red-100 bg-red-50 text-red-700",
    EXPIRED: "border-gray-200 bg-gray-100 text-gray-600",
    CANCELLED: "border-gray-200 bg-gray-100 text-gray-600",
};

const TIME_SLOT_LABELS: Record<AdminDeliveryTimeSlot, string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Final do dia",
};

const OCCASION_LABELS: Record<AdminOccasion, string> = {
    BIRTHDAY: "Aniversário",
    ANNIVERSARY: "Aniversário de relacionamento",
    LOVE: "Amor",
    WEDDING: "Casamento",
    FUNERAL: "Funeral",
    NEW_BABY: "Nascimento",
    MOTHERS_DAY: "Dia da Mãe",
    FATHERS_DAY: "Dia do Pai",
    CHRISTMAS: "Natal",
    OTHER: "Outra ocasião",
};

const CANCELLATION_REASON_LABELS: Record<
    AdminOrderCancellationReason,
    string
> = {
    NO_FLORIST_AVAILABLE: "Nenhuma florista disponível",
    CUSTOMER_REQUEST: "Pedido do cliente",
    ADMIN_REQUEST: "Pedido do administrador",
    PAYMENT_FAILED: "Falha no pagamento",
    OTHER: "Outro motivo",
};

const ITEM_TYPE_LABELS: Record<AdminOrderItemType, string> = {
    PRODUCT: "Produto",
    DELIVERY_FEE: "Taxa de entrega",
};

const VARIANT_TYPE_LABELS: Record<AdminProductVariantType, string> = {
    SIZE: "Tamanho",
};

function formatPrice(value: number | string | null | undefined) {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return "—";

    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(amount);
}

function formatDate(value: string | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatDistance(value: number) {
    return `${Number(value).toLocaleString("pt-PT", {
        maximumFractionDigits: 2,
    })} km`;
}

function getFullName(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
) {
    return [firstName, lastName].filter(Boolean).join(" ") || "—";
}

function getAddress(order: AdminOrderDetail) {
    return [
        [
            order.deliveryStreet,
            order.deliveryStreetNumber,
        ]
            .filter(Boolean)
            .join(", "),
        order.deliveryStreet2,
        [
            order.deliveryPostalCode,
            order.deliveryCity,
        ]
            .filter(Boolean)
            .join(" "),
        order.deliveryDistrict,
        order.deliveryCountryCode,
    ]
        .filter(Boolean)
        .join(", ");
}

function DetailField({
    label,
    value,
    className = "",
}: {
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <p className="text-xs font-medium text-[#7A8474]">{label}</p>
            <div className="mt-1 break-words text-sm font-medium text-[#374132]">
                {value || "—"}
            </div>
        </div>
    );
}

function Section({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description?: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-3xl border border-[#E8EBE4] bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-[#EEF0EB] px-5 py-5 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                    <Icon size={19} />
                </div>

                <div className="min-w-0">
                    <h2 className="font-semibold text-[#2F3B2A]">{title}</h2>
                    {description && (
                        <p className="mt-1 text-sm text-[#7A8474]">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-5 sm:p-6">{children}</div>
        </section>
    );
}

function EmptyValue({ children = "Não indicado" }: { children?: React.ReactNode }) {
    return <span className="font-normal text-gray-400">{children}</span>;
}

function OrderItemCard({ item }: { item: AdminOrderItem }) {
    return (
        <div className="rounded-2xl border border-[#E8EBE4] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#2F3B2A]">
                            {item.name}
                        </h3>
                        <span className="rounded-full bg-[#F3F5EE] px-2.5 py-1 text-xs font-medium text-[#55624A]">
                            {ITEM_TYPE_LABELS[item.type]}
                        </span>
                    </div>

                    {item.description && (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-500">
                            {item.description}
                        </p>
                    )}

                    {item.product && (
                        <p className="mt-2 text-xs text-gray-400">
                            Produto: {item.product.name}
                        </p>
                    )}

                    {item.variantName && (
                        <p className="mt-1 text-sm text-gray-500">
                            {item.variantType
                                ? `${VARIANT_TYPE_LABELS[item.variantType]}: `
                                : ""}
                            {item.variantName}
                        </p>
                    )}
                </div>

                <div className="shrink-0 sm:text-right">
                    <p className="text-lg font-semibold text-[#2F3B2A]">
                        {formatPrice(item.grossAmount)}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                        {item.quantity} {item.quantity === 1 ? "unidade" : "unidades"}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[#EEF0EB] pt-4 sm:grid-cols-4">
                <DetailField
                    label="Preço unitário"
                    value={formatPrice(item.customerPrice)}
                />
                <DetailField
                    label="Preço da florista"
                    value={formatPrice(item.floristPrice)}
                />
                <DetailField
                    label="Valor sem IVA"
                    value={formatPrice(item.netAmount)}
                />
                <DetailField
                    label="IVA"
                    value={
                        <>
                            {formatPrice(item.taxAmount)}
                            {item.taxRate !== null && (
                                <span className="ml-1 text-xs font-normal text-gray-400">
                                    ({item.taxRate}%)
                                </span>
                            )}
                        </>
                    }
                />
            </div>

            {item.taxCode && (
                <p className="mt-3 text-xs text-gray-400">
                    Código de IVA: {item.taxCode.name}
                </p>
            )}

            {item.components.length > 0 && (
                <div className="mt-4 border-t border-[#EEF0EB] pt-4">
                    <h4 className="text-sm font-semibold text-[#374132]">
                        Componentes
                    </h4>

                    <div className="mt-3 space-y-3">
                        {item.components.map((component) => (
                            <div
                                key={component.id}
                                className="flex flex-col justify-between gap-2 rounded-xl bg-[#FAFBF8] p-3 sm:flex-row sm:items-center"
                            >
                                <div>
                                    <p className="text-sm font-medium text-[#374132]">
                                        {component.componentName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        Quantidade: {component.quantity}
                                        {component.additionalUnits > 0 &&
                                            ` · Unidades adicionais: ${component.additionalUnits}`}
                                    </p>
                                </div>

                                <p className="text-sm font-semibold text-[#2F3B2A]">
                                    {formatPrice(component.customerTotalPrice)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function OfferCard({
    offer,
    onEdit,
    onAccept,
    onDecline,
    actionLoading,
}: {
    offer: AdminOrderOffer;
    onEdit: (offer: AdminOrderOffer) => void;
    onAccept: (offer: AdminOrderOffer) => void;
    onDecline: (offer: AdminOrderOffer) => void;
    actionLoading: boolean;
}) {
    const canManage = offer.status === "PENDING" || offer.status === "VIEWED";
    const statusAccent: Record<AdminOrderOfferStatus, string> = {
        PENDING: "border-l-amber-400",
        VIEWED: "border-l-blue-400",
        ACCEPTED: "border-l-green-500",
        DECLINED: "border-l-red-400",
        EXPIRED: "border-l-gray-300",
        CANCELLED: "border-l-gray-300",
    };

    return (
        <article className={`overflow-hidden rounded-2xl border border-[#E8EBE4] border-l-4 ${statusAccent[offer.status]} bg-white shadow-sm transition hover:shadow-md`}>
            <div className="p-4 sm:p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${offer.status === "ACCEPTED" ? "bg-green-100 text-green-700" : offer.status === "DECLINED" ? "bg-red-100 text-red-700" : offer.status === "PENDING" ? "bg-amber-100 text-amber-700" : offer.status === "VIEWED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                            <Store size={19} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-[#2F3B2A]">{offer.florist.name}</h3>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500"><MapPin size={14} /> {formatDistance(offer.distanceKm)}</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <p className="text-xl font-semibold tracking-tight text-[#2F3B2A]">{formatPrice(offer.price)}</p>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${OFFER_STATUS_STYLES[offer.status]}`}>
                            {offer.status === "ACCEPTED" ? <CircleCheck size={13} /> : offer.status === "DECLINED" ? <CircleX size={13} /> : null}
                            {OFFER_STATUS_LABELS[offer.status]}
                        </span>
                    </div>
                </div>

                {offer.status === "ACCEPTED" && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                        <CircleCheck size={17} className="mt-0.5 shrink-0" />
                        <p>Esta proposta foi aceite e a florista ficou associada à encomenda.</p>
                    </div>
                )}
                {offer.declineReason && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                        <CircleX size={17} className="mt-0.5 shrink-0" />
                        <p><span className="font-semibold">Motivo da recusa:</span> {offer.declineReason}</p>
                    </div>
                )}
                {offer.status === "CANCELLED" && (
                    <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">Proposta cancelada, por exemplo, porque outra florista foi selecionada.</p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-[#FAFBF8] p-3 sm:grid-cols-4">
                    <DetailField label="Criada em" value={formatDateTime(offer.createdAt)} />
                    <DetailField label="Expira em" value={formatDateTime(offer.expiresAt)} />
                    <DetailField label="Visualizada em" value={formatDateTime(offer.viewedAt)} />
                    <DetailField label={offer.status === "ACCEPTED" ? "Aceite em" : offer.status === "DECLINED" ? "Recusada em" : "Respondida em"} value={formatDateTime(offer.acceptedAt ?? offer.declinedAt)} />
                </div>

                {canManage && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#EEF0EB] pt-4">
                        <button type="button" onClick={() => onEdit(offer)} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-full border border-[#DCE2D5] px-4 py-2 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"><Pencil size={15} /> Editar proposta</button>
                        <button type="button" onClick={() => onAccept(offer)} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60">{actionLoading ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Aceitar</button>
                        <button type="button" onClick={() => onDecline(offer)} disabled={actionLoading} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"><X size={15} /> Recusar</button>
                    </div>
                )}
            </div>
        </article>
    );
}

export default function EditOrderPage() {
    const params = useParams<{ id: string }>();
    const id = Number(params.id);

    const [order, setOrder] = useState<AdminOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [floristSearch, setFloristSearch] = useState("");
    const [florists, setFlorists] = useState<Array<{ id: number; name: string }>>([]);
    const [floristsLoading, setFloristsLoading] = useState(false);
    const [selectedFloristId, setSelectedFloristId] = useState("");
    const [selectedFloristName, setSelectedFloristName] = useState("");
    const [showFloristResults, setShowFloristResults] = useState(false);
    const [offerPrice, setOfferPrice] = useState("");
    const [offerExpiresAt, setOfferExpiresAt] = useState("");
    const [offerFormOpen, setOfferFormOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState<AdminOrderOffer | null>(null);
    const [offerSaving, setOfferSaving] = useState(false);
    const [offerError, setOfferError] = useState<string | null>(null);
    const [offerActionLoadingId, setOfferActionLoadingId] = useState<number | null>(null);
    const [decliningOffer, setDecliningOffer] = useState<AdminOrderOffer | null>(null);
    const [declineReason, setDeclineReason] = useState("");

    const canCreateOffer = order?.status === "WAITING_FOR_FLORISTS";
    const minimumExpiry = useMemo(() => toDateTimeLocal(new Date().toISOString()), []);

    const loadFlorists = useCallback(async (search: string) => {
        const normalizedSearch = search.trim();

        if (normalizedSearch.length < 3) {
            setFlorists([]);
            setFloristsLoading(false);
            return;
        }

        setFloristsLoading(true);
        setOfferError(null);

        try {
            const response = await (adminFloristsApi as any).getAll({
                search: normalizedSearch,
                page: 1,
                pageSize: 20,
            });
            const payload = response as any;
            const rows = Array.isArray(payload)
                ? payload
                : payload?.items ?? payload?.data?.items ?? payload?.data ?? payload?.results ?? [];

            setFlorists(
                rows
                    .map((florist: any) => ({
                        id: Number(florist.id),
                        name: String(florist.name ?? florist.businessName ?? ""),
                    }))
                    .filter(
                        (florist: { id: number; name: string }) =>
                            Number.isSafeInteger(florist.id) && florist.id > 0 && florist.name,
                    ),
            );
            setShowFloristResults(true);
        } catch (err) {
            setOfferError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível pesquisar floristas.",
            );
            setFlorists([]);
        } finally {
            setFloristsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!offerFormOpen || editingOffer || selectedFloristId) return;

        const search = floristSearch.trim();
        if (search.length < 3) {
            setFlorists([]);
            setFloristsLoading(false);
            setShowFloristResults(false);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            void loadFlorists(search);
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [offerFormOpen, editingOffer, selectedFloristId, floristSearch, loadFlorists]);

    const resetOfferForm = () => {
        setOfferFormOpen(false);
        setEditingOffer(null);
        setFloristSearch("");
        setSelectedFloristId("");
        setSelectedFloristName("");
        setShowFloristResults(false);
        setFlorists([]);
        setOfferPrice("");
        setOfferExpiresAt("");
        setOfferError(null);
    };

    const startEditingOffer = (offer: AdminOrderOffer) => {
        setOfferError(null);
        setOfferFormOpen(true);
        setEditingOffer(offer);
        setFloristSearch("");
        setSelectedFloristName("");
        setSelectedFloristId("");
        setShowFloristResults(false);
        setOfferPrice(String(offer.price));
        setOfferExpiresAt(toDateTimeLocal(offer.expiresAt));
    };

    const startCreatingOffer = () => {
        setOfferError(null);
        setEditingOffer(null);
        setFloristSearch("");
        setSelectedFloristId("");
        setSelectedFloristName("");
        setFlorists([]);
        setShowFloristResults(false);
        setOfferPrice("");
        setOfferExpiresAt("");
        setOfferFormOpen(true);
    };

    const submitOffer = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!order) return;
        const price = Number(offerPrice);
        const expiry = new Date(offerExpiresAt);
        if (!Number.isFinite(price) || price <= 0) {
            setOfferError("Indica um preço válido superior a zero.");
            return;
        }
        if (price > Number(order.total)) {
            setOfferError("O preço da proposta não pode ultrapassar o total da encomenda.");
            return;
        }
        if (!offerExpiresAt || Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
            setOfferError("A data de expiração tem de ser uma data futura.");
            return;
        }
        if (!editingOffer && !selectedFloristId) {
            setOfferError("Seleciona uma florista.");
            return;
        }

        setOfferSaving(true);
        setOfferError(null);
        try {
            if (editingOffer) {
                await (adminOrderOffersApi as any).update(editingOffer.id, { price, expiresAt: expiry.toISOString() });
            } else {
                await (adminOrderOffersApi as any).create({ orderId: order.id, floristId: Number(selectedFloristId), price, expiresAt: expiry.toISOString() });
            }
            resetOfferForm();
            const refreshedOrder = await adminOrdersApi.getById(id);
            if (refreshedOrder) setOrder(refreshedOrder);
        } catch (err) {
            setOfferError(err instanceof Error ? err.message : "Não foi possível guardar a proposta.");
        } finally {
            setOfferSaving(false);
        }
    };


    const acceptOffer = async (offer: AdminOrderOffer) => {
        const confirmed = window.confirm(`Queres aceitar a proposta de ${offer.florist.name}? As restantes propostas pendentes ou visualizadas serão canceladas e a encomenda será atribuída a esta florista.`);
        if (!confirmed) return;

        setOfferActionLoadingId(offer.id);
        setOfferError(null);
        try {
            await adminOrderOffersApi.accept(offer.id);
            const refreshedOrder = await adminOrdersApi.getById(id);
            if (refreshedOrder) setOrder(refreshedOrder);
        } catch (err) {
            setOfferError(err instanceof Error ? err.message : "Não foi possível aceitar a proposta.");
        } finally {
            setOfferActionLoadingId(null);
        }
    };

    const submitDecline = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!decliningOffer) return;
        const reason = declineReason.trim();
        if (!reason) {
            setOfferError("Indica o motivo da recusa.");
            return;
        }

        setOfferActionLoadingId(decliningOffer.id);
        setOfferError(null);
        try {
            await adminOrderOffersApi.decline(decliningOffer.id, {declineReason: reason});
            setDecliningOffer(null);
            setDeclineReason("");
            const refreshedOrder = await adminOrdersApi.getById(id);
            if (refreshedOrder) setOrder(refreshedOrder);
        } catch (err) {
            setOfferError(err instanceof Error ? err.message : "Não foi possível recusar a proposta.");
        } finally {
            setOfferActionLoadingId(null);
        }
    };

    const loadOrder = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("O ID da encomenda é inválido.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await adminOrdersApi.getById(id);

            if (response) {
                setOrder(response);
            } else {
                setOrder(null);
                setError("Não foi possível encontrar esta encomenda.");
            }
        } catch (err) {
            setOrder(null);
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a encomenda.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadOrder();
    }, [loadOrder]);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 pb-10">
            {/* Header: mesmo padrão das páginas de detalhe */}
            <div>
                <Link
                    href={ORDER_LIST_URL}
                    className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às encomendas
                </Link>

                <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <Package size={23} />
                    </div>

                    <div className="min-w-0">
                        <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                            {order
                                ? `Encomenda ${order.orderNumber}`
                                : "Detalhes da encomenda"}
                        </h1>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Consulta os dados, os artigos, a entrega e o estado da encomenda.
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-start"
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />

                    <div className="flex-1">
                        <p className="font-medium">Ocorreu um problema</p>
                        <p className="mt-1">{error}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadOrder()}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-red-200 px-4 py-2 font-medium transition hover:bg-red-100 disabled:opacity-50"
                    >
                        <RefreshCw size={14} />
                        Tentar novamente
                    </button>
                </div>
            )}

            {loading ? (
                <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                    A carregar encomenda...
                </div>
            ) : order ? (
                <div className="space-y-6">
                    {/* Estado e resumo */}
                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <p className="text-sm text-[#7A8474]">
                                    Estado da encomenda
                                </p>
                                <span
                                    className={`mt-2 inline-flex rounded-full border px-3 py-1.5 text-sm font-semibold ${STATUS_STYLES[order.status]}`}
                                >
                                    {STATUS_LABELS[order.status]}
                                </span>
                            </div>

                            <div className="sm:text-right">
                                <p className="text-sm text-[#7A8474]">
                                    Total da encomenda
                                </p>
                                <p className="mt-1 text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                                    {formatPrice(order.total)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <Section
                        title="Informação da encomenda"
                        description="Identificação e estado atual."
                        icon={FileText}
                    >
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField
                                label="Número da encomenda"
                                value={order.orderNumber}
                            />
                            <DetailField
                                label="Estado"
                                value={STATUS_LABELS[order.status]}
                            />
                            <DetailField
                                label="Ocasião"
                                value={
                                    order.occasion
                                        ? OCCASION_LABELS[order.occasion]
                                        : <EmptyValue />
                                }
                            />
                            <DetailField
                                label="Criada em"
                                value={formatDateTime(order.createdAt)}
                            />
                            <DetailField
                                label="Última atualização"
                                value={formatDateTime(order.updatedAt)}
                            />
                            <DetailField
                                label="Florista atribuída"
                                value={
                                    order.assignedFlorist?.name ?? (
                                        <EmptyValue>Sem florista atribuída</EmptyValue>
                                    )
                                }
                            />
                        </div>

                        {order.status === "CANCELLED" && (
                            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                                <p className="text-sm font-semibold text-red-700">
                                    Encomenda cancelada
                                </p>
                                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                                    <DetailField
                                        label="Motivo"
                                        value={
                                            order.cancellationReason
                                                ? CANCELLATION_REASON_LABELS[
                                                      order.cancellationReason
                                                  ]
                                                : "Não indicado"
                                        }
                                    />
                                    <DetailField
                                        label="Data do cancelamento"
                                        value={formatDateTime(order.cancelledAt)}
                                    />
                                </div>
                            </div>
                        )}
                    </Section>

                    <Section
                        title="Dados do cliente"
                        description="Informação de contacto de quem realizou a encomenda."
                        icon={UserRound}
                    >
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField
                                label="Nome"
                                value={getFullName(
                                    order.customerFirstName,
                                    order.customerLastName,
                                )}
                            />
                            <DetailField
                                label="Email"
                                value={order.customerEmail}
                            />
                            <DetailField
                                label="Telefone"
                                value={order.customerPhone}
                            />
                            <DetailField
                                label="NIF"
                                value={order.customerTaxNumber ?? <EmptyValue />}
                            />
                            <DetailField
                                label="ID do cliente"
                                value={
                                    order.customerId ?? <EmptyValue>Compra sem conta associada</EmptyValue>
                                }
                            />
                        </div>
                    </Section>

                    <Section
                        title="Destinatário"
                        description="Pessoa que irá receber as flores."
                        icon={UserRound}
                    >
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField
                                label="Nome"
                                value={getFullName(
                                    order.recipientFirstName,
                                    order.recipientLastName,
                                )}
                            />
                            <DetailField
                                label="Telefone"
                                value={order.recipientPhone ?? <EmptyValue />}
                            />
                        </div>
                    </Section>

                    <Section
                        title="Informação de entrega"
                        description="Data, período e morada de entrega."
                        icon={MapPin}
                    >
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField
                                label="Data de entrega"
                                value={
                                    <span className="inline-flex items-center gap-2">
                                        <CalendarDays
                                            size={15}
                                            className="text-[#7A8474]"
                                        />
                                        {formatDate(order.deliveryDate)}
                                    </span>
                                }
                            />
                            <DetailField
                                label="Período"
                                value={
                                    <span className="inline-flex items-center gap-2">
                                        <Clock3
                                            size={15}
                                            className="text-[#7A8474]"
                                        />
                                        {TIME_SLOT_LABELS[order.deliveryTimeSlot]}
                                    </span>
                                }
                            />
                            <DetailField
                                label="Código postal"
                                value={order.deliveryPostalCode}
                            />
                            <DetailField
                                label="Morada"
                                value={getAddress(order)}
                                className="sm:col-span-2 lg:col-span-3"
                            />
                            <DetailField
                                label="Instruções de entrega"
                                value={
                                    order.deliveryInstructions ?? <EmptyValue />
                                }
                                className="sm:col-span-2 lg:col-span-3"
                            />
                        </div>
                    </Section>

                    <Section
                        title="Artigos da encomenda"
                        description={`${order.items.length} ${order.items.length === 1 ? "artigo" : "artigos"} na encomenda.`}
                        icon={Package}
                    >
                        {order.items.length > 0 ? (
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <OrderItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">
                                Esta encomenda não tem artigos.
                            </p>
                        )}
                    </Section>

                    <Section
                        title="Mensagem e notas"
                        description="Mensagem do cartão e notas associadas à encomenda."
                        icon={FileText}
                    >
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-medium text-[#7A8474]">
                                    Mensagem do cartão
                                </p>
                                <div className="mt-2 min-h-20 whitespace-pre-wrap rounded-2xl bg-[#FAFBF8] p-4 text-sm leading-6 text-[#374132]">
                                    {order.cardMessage || (
                                        <EmptyValue>Sem mensagem</EmptyValue>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-[#7A8474]">
                                    Notas
                                </p>
                                <div className="mt-2 min-h-20 whitespace-pre-wrap rounded-2xl bg-[#FAFBF8] p-4 text-sm leading-6 text-[#374132]">
                                    {order.notes || (
                                        <EmptyValue>Sem notas</EmptyValue>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section
                        title="Resumo financeiro"
                        description="Valores e impostos associados à encomenda."
                        icon={FileText}
                    >
                        <div className="space-y-3">
                            <FinancialRow
                                label="Subtotal"
                                value={order.subtotal}
                            />
                            <FinancialRow
                                label="IVA"
                                value={order.taxAmount}
                            />
                            <FinancialRow
                                label="Taxa de entrega"
                                value={order.deliveryFee}
                            />
                            <FinancialRow
                                label="Desconto"
                                value={order.discount}
                            />

                            <div className="border-t border-[#E8EBE4] pt-4">
                                <FinancialRow
                                    label="Total"
                                    value={order.total}
                                    prominent
                                />
                            </div>
                        </div>

                        {order.taxTotals.length > 0 && (
                            <div className="mt-6">
                                <h3 className="mb-3 text-sm font-semibold text-[#2F3B2A]">
                                    Discriminação de IVA
                                </h3>

                                <div className="overflow-x-auto rounded-2xl border border-[#E8EBE4]">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#FAFBF8] text-xs text-[#7A8474]">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Código de IVA
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Valor sem IVA
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    IVA
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.taxTotals.map((tax) => (
                                                <tr
                                                    key={tax.id}
                                                    className="border-t border-[#EEF0EB]"
                                                >
                                                    <td className="px-4 py-3 font-medium text-[#374132]">
                                                        {tax.taxCode.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {formatPrice(tax.netAmount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {formatPrice(tax.taxAmount)}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-[#374132]">
                                                        {formatPrice(tax.grossAmount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </Section>

                    <Section
                        title="Propostas às floristas"
                        description="Floristas às quais foi enviada uma proposta para esta encomenda."
                        icon={Store}
                    >
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <p className="text-sm text-[#7A8474]">{order.offers.length} {order.offers.length === 1 ? "proposta" : "propostas"}</p>
                            {canCreateOffer && !offerFormOpen && (
                                <button type="button" onClick={startCreatingOffer} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43503A]"><Plus size={16} /> Nova proposta</button>
                            )}
                        </div>



                        {offerError && !offerFormOpen && !decliningOffer && (
                            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{offerError}</div>
                        )}

                        {order.offers.length > 0 ? (
                            <div className="space-y-4">{order.offers.map((offer) => <OfferCard key={offer.id} offer={offer} onEdit={startEditingOffer} onAccept={acceptOffer} onDecline={(selectedOffer) => { setOfferError(null); setDeclineReason(""); setDecliningOffer(selectedOffer); }} actionLoading={offerActionLoadingId !== null} />)}</div>
                        ) : (
                            <div className="rounded-2xl bg-[#FAFBF8] p-5 text-sm text-[#7A8474]">Ainda não existem propostas de floristas para esta encomenda.</div>
                        )}
                    </Section>

                    <Section
                        title="Histórico de datas"
                        description="Datas relevantes para o acompanhamento da encomenda."
                        icon={CalendarDays}
                    >
                        <div className="relative ml-2 space-y-5 border-l-2 border-[#E8EBE4] pl-6">
                            {[
                                { label: "Encomenda criada", date: order.createdAt, detail: "A encomenda foi registada no sistema.", tone: "bg-[#55624A]" },
                                { label: "Florista atribuída", date: order.assignedAt, detail: order.assignedFlorist?.name ? `Atribuída a ${order.assignedFlorist.name}.` : "Ainda não foi atribuída uma florista.", tone: "bg-green-500" },
                                { label: "Encomenda cancelada", date: order.cancelledAt, detail: order.cancellationReason ? CANCELLATION_REASON_LABELS[order.cancellationReason] : "Sem cancelamento registado.", tone: "bg-red-500" },
                                { label: "Última atualização", date: order.updatedAt, detail: "Última alteração registada na encomenda.", tone: "bg-blue-500" },
                            ].map((event) => (
                                <div key={event.label} className="relative flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                                    <span className={`absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white ${event.tone}`} />
                                    <div>
                                        <p className="text-sm font-semibold text-[#374132]">{event.label}</p>
                                        <p className="mt-1 text-sm text-[#7A8474]">{event.detail}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-medium text-[#55624A]">{formatDateTime(event.date)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E8EBE4] bg-[#FAFBF8] p-4">
                            <History size={18} className="mt-0.5 shrink-0 text-[#7A8474]" />
                            <p className="text-sm leading-6 text-[#7A8474]">O histórico apresenta as datas disponíveis no registo atual da encomenda. As ações das propostas são apresentadas nos respetivos cartões.</p>
                        </div>
                    </Section>
                </div>
            ) : (
                !error && (
                    <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                        Encomenda não encontrada.
                    </div>
                )
            )}

            {/* Navegação inferior: também presente nas outras páginas */}
            <div className="border-t border-[#E8EBE4] pt-6">
                <Link
                    href={ORDER_LIST_URL}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#7A8474] transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às encomendas
                </Link>
            </div>

            {decliningOffer && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && offerActionLoadingId === null) { setDecliningOffer(null); setDeclineReason(""); setOfferError(null); } }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="decline-offer-title" className="my-auto w-full max-w-lg rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700"><CircleX size={22} /></div>
                            <div>
                                <h2 id="decline-offer-title" className="text-xl font-semibold text-[#2F3B2A]">Recusar proposta</h2>
                                <p className="mt-1 text-sm text-[#7A8474]">Indica o motivo da recusa à proposta de <strong>{decliningOffer.florist.name}</strong>.</p>
                            </div>
                        </div>
                        <form onSubmit={submitDecline} className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="decline-reason" className="mb-2 block text-sm font-medium text-[#374132]">Motivo da recusa *</label>
                                <textarea id="decline-reason" value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} rows={4} maxLength={1000} required disabled={offerActionLoadingId !== null} placeholder="Explica por que motivo estás a recusar esta proposta..." className="w-full resize-y rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:bg-[#F3F5EE]" />
                                <p className="mt-1 text-right text-xs text-[#7A8474]">{declineReason.length}/1000</p>
                            </div>
                            {offerError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{offerError}</div>}
                            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF0EA] pt-5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={() => { setDecliningOffer(null); setDeclineReason(""); setOfferError(null); }} disabled={offerActionLoadingId !== null} className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={offerActionLoadingId !== null || !declineReason.trim()} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{offerActionLoadingId !== null ? <LoaderCircle size={16} className="animate-spin" /> : <X size={16} />} Confirmar recusa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {offerFormOpen && order && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !offerSaving) {
                            resetOfferForm();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="order-offer-modal-title"
                        className="my-auto w-full max-w-xl rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                                    {editingOffer ? <Pencil size={21} /> : <Plus size={22} />}
                                </div>
                                <div>
                                    <h2 id="order-offer-modal-title" className="text-xl font-semibold text-[#2F3B2A]">
                                        {editingOffer ? "Editar proposta" : "Nova proposta"}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#7A8474]">
                                        {editingOffer
                                            ? `Atualiza a proposta para ${editingOffer.florist.name}.`
                                            : `Seleciona uma florista para a encomenda ${order.orderNumber}.`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetOfferForm}
                                disabled={offerSaving}
                                aria-label="Fechar formulário"
                                className="rounded-xl p-2 text-[#7A8474] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={submitOffer} className="mt-7 space-y-5">
                            {!editingOffer && (
                                <div className="relative">
                                    <label htmlFor="offer-florist-search" className="mb-2 block text-sm font-medium text-[#374132]">
                                        Florista *
                                    </label>
                                    <div className="relative">
                                        <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8474]" />
                                        <input
                                            id="offer-florist-search"
                                            type="text"
                                            value={selectedFloristId ? selectedFloristName : floristSearch}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setFloristSearch(value);
                                                setSelectedFloristId("");
                                                setSelectedFloristName("");
                                                setShowFloristResults(value.trim().length >= 3);
                                                setFloristsLoading(value.trim().length >= 3);
                                                setOfferError(null);
                                            }}
                                            onFocus={() => {
                                                if (floristSearch.trim().length >= 3 && !selectedFloristId) {
                                                    setShowFloristResults(true);
                                                }
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Escape") setShowFloristResults(false);
                                            }}
                                            placeholder="Escreve pelo menos 3 caracteres..."
                                            autoComplete="off"
                                            required={!selectedFloristId}
                                            disabled={offerSaving}
                                            aria-expanded={showFloristResults}
                                            aria-controls="offer-florist-results"
                                            className="w-full rounded-xl border border-[#E2E6DD] bg-white py-3 pl-11 pr-4 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"
                                        />
                                        {selectedFloristId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFloristSearch("");
                                                    setSelectedFloristId("");
                                                    setSelectedFloristName("");
                                                    setFlorists([]);
                                                    setShowFloristResults(false);
                                                }}
                                                aria-label="Alterar florista selecionada"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#7A8474] hover:bg-[#F3F5EE]"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {showFloristResults && !selectedFloristId && (
                                        <div id="offer-florist-results" role="listbox" className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-[#E2E6DD] bg-white p-1.5 shadow-[0_12px_35px_rgba(47,59,42,0.14)]">
                                            {floristsLoading ? (
                                                <p className="px-3 py-4 text-sm text-[#7A8474]">A pesquisar floristas...</p>
                                            ) : florists.length > 0 ? (
                                                florists.map((florist) => (
                                                    <button
                                                        key={florist.id}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={selectedFloristId === String(florist.id)}
                                                        onClick={() => {
                                                            setSelectedFloristId(String(florist.id));
                                                            setSelectedFloristName(florist.name);
                                                            setFloristSearch(florist.name);
                                                            setShowFloristResults(false);
                                                            setOfferError(null);
                                                        }}
                                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#374132] transition hover:bg-[#F3F5EE] focus:bg-[#F3F5EE] focus:outline-none"
                                                    >
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                                            <Store size={17} />
                                                        </span>
                                                        <span className="font-medium">{florist.name}</span>
                                                    </button>
                                                ))
                                            ) : floristSearch.trim().length >= 3 ? (
                                                <p className="px-3 py-4 text-sm text-[#7A8474]">Não foram encontradas floristas com essa pesquisa.</p>
                                            ) : null}
                                        </div>
                                    )}
                                    <p className="mt-2 text-xs text-[#7A8474]">
                                        A pesquisa à base de dados começa após introduzires 3 caracteres.
                                    </p>
                                </div>
                            )}

                            {editingOffer && (
                                <div className="rounded-xl bg-[#F3F5EE] p-4 text-sm text-[#55624A]">
                                    Florista: <strong>{editingOffer.florist.name}</strong>
                                </div>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="offer-price" className="mb-2 block text-sm font-medium text-[#374132]">Preço (€) *</label>
                                    <input
                                        id="offer-price"
                                        type="number"
                                        min="0.01"
                                        max={order.total}
                                        step="0.01"
                                        required
                                        value={offerPrice}
                                        onChange={(event) => setOfferPrice(event.target.value)}
                                        disabled={offerSaving}
                                        className="w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"
                                    />
                                    <p className="mt-2 text-xs text-[#7A8474]">Máximo: {formatPrice(order.total)}</p>
                                </div>
                                <div>
                                    <label htmlFor="offer-expiry" className="mb-2 block text-sm font-medium text-[#374132]">Data de expiração *</label>
                                    <input
                                        id="offer-expiry"
                                        type="datetime-local"
                                        required
                                        min={minimumExpiry}
                                        value={offerExpiresAt}
                                        onChange={(event) => setOfferExpiresAt(event.target.value)}
                                        disabled={offerSaving}
                                        className="w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"
                                    />
                                </div>
                            </div>

                            {offerError && (
                                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {offerError}
                                </div>
                            )}

                            <div className="flex flex-col-reverse gap-3 border-t border-[#EEF0EA] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={resetOfferForm}
                                    disabled={offerSaving}
                                    className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={offerSaving || (!editingOffer && !selectedFloristId)}
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {offerSaving ? "A guardar..." : editingOffer ? "Guardar alterações" : "Criar proposta"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function FinancialRow({
    label,
    value,
    prominent = false,
}: {
    label: string;
    value: number;
    prominent?: boolean;
}) {
    return (
        <div
            className={`flex items-center justify-between gap-4 ${
                prominent ? "text-base" : "text-sm"
            }`}
        >
            <span
                className={
                    prominent
                        ? "font-semibold text-[#2F3B2A]"
                        : "text-[#7A8474]"
                }
            >
                {label}
            </span>
            <span
                className={
                    prominent
                        ? "text-xl font-semibold text-[#2F3B2A]"
                        : "font-medium text-[#374132]"
                }
            >
                {formatPrice(value)}
            </span>
        </div>
    );
}
