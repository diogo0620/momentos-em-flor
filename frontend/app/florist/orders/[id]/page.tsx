"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    MessageSquare,
    Package,
    Phone,
    ReceiptText,
    UserRound,
    XCircle,
} from "lucide-react";

import { floristOrdersApi } from "@/lib/api/orders/florist-orders";
import type {
    FloristOrderDetail,
    FloristOrderItem,
} from "@/types/orders/florist/florist-order-detail";
import type {
    FloristOrderStatus,
    FloristDeliveryTimeSlot,
    FloristOrderItemType,
    FloristProductVariantType,
} from "@/types/orders/florist/florist-order-status";

const STATUS_LABELS: Record<FloristOrderStatus, string> = {
    CREATED: "Criada",
    PENDING_PAYMENT: 'Pending Payment',
    WAITING_FOR_FLORISTS: "À espera de florista",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<FloristOrderStatus, string> = {
    CREATED: "border-blue-200 bg-blue-50 text-blue-700",
    WAITING_FOR_FLORISTS: "border-amber-200 bg-amber-50 text-amber-700",
    PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",
    ASSIGNED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    IN_PRODUCTION: "border-orange-200 bg-orange-50 text-orange-700",
    READY_FOR_DELIVERY: "border-violet-200 bg-violet-50 text-violet-700",
    DELIVERED: "border-green-200 bg-green-50 text-green-700",
    CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_DESCRIPTIONS: Record<FloristOrderStatus, string> = {
    CREATED: "A encomenda foi criada e aguarda processamento.",
    PENDING_PAYMENT: 'Pending Payment',
    WAITING_FOR_FLORISTS: "A encomenda está à espera que uma florista aceite a proposta.",
    ASSIGNED: "A encomenda foi atribuída à tua florista. Consulta os detalhes para preparar a entrega.",
    IN_PRODUCTION: "A encomenda está a ser preparada.",
    READY_FOR_DELIVERY: "A encomenda está pronta para ser entregue.",
    DELIVERED: "A entrega foi concluída.",
    CANCELLED: "Esta encomenda foi cancelada e já não pode ser processada.",
};

const TIME_SLOT_LABELS: Record<FloristDeliveryTimeSlot, string> = {
    MORNING: "Manhã",
    AFTERNOON: "Tarde",
    EVENING: "Noite",
};

const ITEM_TYPE_LABELS: Record<string, string> = {
    PRODUCT: "Produto",
    BOUQUET: "Ramo",
    CUSTOM: "Personalizado",
};

const VARIANT_TYPE_LABELS: Record<string, string> = {
    SIZE: "Tamanho",
    COLOR: "Cor",
    STYLE: "Estilo",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function formatDate(value?: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : DATE_FORMATTER.format(date);
}

function formatDateTime(value?: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : DATETIME_FORMATTER.format(date);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function getRecipientName(order: FloristOrderDetail): string {
    return [order.recipientFirstName, order.recipientLastName]
        .filter((part): part is string => Boolean(part?.trim()))
        .join(" ");
}

function getFullAddress(order: FloristOrderDetail): string {
    const street = [
        order.deliveryStreet,
        order.deliveryStreetNumber,
    ].filter(Boolean).join(", ");

    return [
        street,
        order.deliveryStreet2,
        `${order.deliveryPostalCode} ${order.deliveryCity}`.trim(),
        order.deliveryDistrict,
    ].filter((part): part is string => Boolean(part?.trim())).join(", ");
}

function getTimeline(order: FloristOrderDetail) {
    return [
        { label: "Encomenda criada", date: order.createdAt, description: "A encomenda foi registada." },
        { label: "Florista atribuída", date: order.assignedAt, description: "A encomenda foi atribuída à tua florista." },
        { label: "Preparação iniciada", date: order.inProductionAt, description: "A preparação da encomenda foi iniciada." },
        { label: "Pronta para entrega", date: order.readyForDeliveryAt, description: "A encomenda ficou pronta para entrega." },
        { label: "Entregue", date: order.deliveredAt, description: "A entrega foi concluída." },
        { label: "Cancelada", date: order.cancelledAt, description: "A encomenda foi cancelada." },
    ].filter((item) => Boolean(item.date));
}

export default function FloristOrderDetailPage() {
    const params = useParams<{ id: string }>();
    const orderId = Number(params.id);

    const [order, setOrder] = useState<FloristOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrder = useCallback(async () => {
        if (!Number.isSafeInteger(orderId) || orderId <= 0) {
            setError("O identificador da encomenda é inválido.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await floristOrdersApi.getById(orderId);
            setOrder(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar a encomenda.");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        void loadOrder();
    }, [loadOrder]);

    const timeline = useMemo(() => order ? getTimeline(order) : [], [order]);

    if (loading) {
        return (
            <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
                <div className="h-5 w-44 animate-pulse rounded bg-gray-200" />
                <div className="h-36 animate-pulse rounded-3xl bg-gray-100" />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="h-[520px] animate-pulse rounded-3xl bg-gray-100" />
                    <div className="h-[420px] animate-pulse rounded-3xl bg-gray-100" />
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto w-full max-w-6xl pb-10">
                <Link href="/florist/orders" className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]">
                    <ArrowLeft size={16} /> Voltar às encomendas
                </Link>
                <div className="mt-6 rounded-3xl border border-[#E8EBE4] bg-white p-8 text-center shadow-sm sm:p-12">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]">
                        <Package size={25} />
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold text-[#2F3B2A]">Encomenda não encontrada</h1>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-[#7A8474]">{error ?? "Não foi possível carregar os detalhes desta encomenda."}</p>
                    <button type="button" onClick={() => void loadOrder()} className="mt-5 rounded-full bg-[#55624A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#435039]">
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    const recipientName = getRecipientName(order);
    const address = getFullAddress(order);
    const orderTimeline = timeline;

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
            <header>
                <Link href="/florist/orders" className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]">
                    <ArrowLeft size={16} /> Voltar às encomendas
                </Link>

                <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#55624A]">Detalhe da encomenda</p>
                        <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                            Encomenda #{order.orderNumber}
                        </h1>
                        <p className="mt-2 text-sm text-[#7A8474]">
                            Criada a {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <span className={`inline-flex w-fit shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold ${STATUS_STYLES[order.status]}`}>
                        <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                        {STATUS_LABELS[order.status]}
                    </span>
                </div>
            </header>

            <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        {order.status === "CANCELLED" ? <XCircle size={24} /> : order.status === "DELIVERED" ? <CheckCircle2 size={24} /> : <Package size={24} />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-[#2F3B2A]">{STATUS_LABELS[order.status]}</h2>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-[#7A8474]">{STATUS_DESCRIPTIONS[order.status]}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F3F5EE] px-5 py-4 sm:min-w-48">
                        <p className="text-xs font-medium text-[#7A8474]">Valor da encomenda</p>
                        <p className="mt-1 text-2xl font-bold text-[#55624A]">{formatCurrency(order.price)}</p>
                    </div>
                </div>

                <div className="mt-7 grid gap-4 border-t border-[#EEF0EA] pt-6 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryItem icon={<CalendarDays size={18} />} label="Data de entrega" value={formatDate(order.deliveryDate)} detail={TIME_SLOT_LABELS[order.deliveryTimeSlot] ?? order.deliveryTimeSlot} />
                    <SummaryItem icon={<UserRound size={18} />} label="Destinatário" value={recipientName || "Não indicado"} />
                    <SummaryItem icon={<MapPin size={18} />} label="Localidade" value={[order.deliveryCity, order.deliveryDistrict].filter(Boolean).join(", ")} />
                    <SummaryItem icon={<ReceiptText size={18} />} label="Pagamento" value={order.paidAt ? "Pago" : "Por confirmar"} detail={order.paidAt ? formatDateTime(order.paidAt) : undefined} />
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-6">
                    <section className="overflow-hidden rounded-3xl border border-[#E8EBE4] bg-white shadow-sm">
                        <div className="border-b border-[#EEF0EA] px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><Package size={19} /></div>
                                <div>
                                    <h2 className="font-semibold text-[#2F3B2A]">Produtos da encomenda</h2>
                                    <p className="mt-0.5 text-sm text-[#7A8474]">{order.items.length} {order.items.length === 1 ? "artigo" : "artigos"}</p>
                                </div>
                            </div>
                        </div>

                        {order.items.length === 0 ? (
                            <p className="p-8 text-sm text-[#7A8474]">Não existem artigos associados a esta encomenda.</p>
                        ) : (
                            <div className="divide-y divide-[#EEF0EA]">
                                {order.items.map((item) => <OrderItemCard key={item.id} item={item} />)}
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4 bg-[#FAFBF8] px-6 py-5 sm:px-8">
                            <span className="text-sm font-medium text-[#7A8474]">Total da encomenda</span>
                            <span className="text-xl font-bold text-[#2F3B2A]">{formatCurrency(order.price)}</span>
                        </div>
                    </section>

                    {(order.deliveryInstructions || order.cardMessage) && (
                        <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><MessageSquare size={19} /></div>
                                <h2 className="font-semibold text-[#2F3B2A]">Instruções e mensagem</h2>
                            </div>
                            <div className="mt-5 space-y-4">
                                {order.deliveryInstructions && (
                                    <div className="rounded-2xl bg-[#FAFBF8] p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A8474]">Instruções de entrega</p>
                                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#374132]">{order.deliveryInstructions}</p>
                                    </div>
                                )}
                                {order.cardMessage && (
                                    <div className="rounded-2xl border border-[#E4E8DC] bg-[#F8F9F5] p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#7A8474]">Mensagem do cartão</p>
                                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#374132]">{order.cardMessage}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                <aside className="min-w-0 space-y-6">
                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><MapPin size={19} /></div>
                            <h2 className="font-semibold text-[#2F3B2A]">Entrega</h2>
                        </div>
                        <div className="mt-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-[#7A8474]">Morada completa</p>
                            <p className="mt-2 break-words text-sm leading-6 text-[#374132]">{address || "Morada não disponível"}</p>
                        </div>
                        <div className="mt-5 border-t border-[#EEF0EA] pt-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-[#7A8474]">Data e período</p>
                            <p className="mt-2 font-semibold text-[#2F3B2A]">{formatDate(order.deliveryDate)}</p>
                            <p className="mt-1 text-sm text-[#7A8474]">{TIME_SLOT_LABELS[order.deliveryTimeSlot] ?? order.deliveryTimeSlot}</p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><UserRound size={19} /></div>
                            <h2 className="font-semibold text-[#2F3B2A]">Destinatário</h2>
                        </div>
                        <p className="mt-5 break-words font-semibold text-[#2F3B2A]">{recipientName || "Nome não disponível"}</p>
                        {order.recipientPhone ? (
                            <a href={`tel:${order.recipientPhone}`} className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-[#55624A] hover:underline">
                                <Phone size={16} className="shrink-0" /> {order.recipientPhone}
                            </a>
                        ) : (
                            <p className="mt-3 text-sm text-[#7A8474]">Sem contacto telefónico disponível.</p>
                        )}
                    </section>

                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><Clock3 size={19} /></div>
                            <h2 className="font-semibold text-[#2F3B2A]">Histórico</h2>
                        </div>
                        <div className="mt-5 space-y-5">
                            {orderTimeline.map((event, index) => (
                                <div key={`${event.label}-${event.date}`} className="relative flex gap-3">
                                    {index < orderTimeline.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%+4px)] w-px bg-[#E4E8DC]" />}
                                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]"><CheckCircle2 size={16} /></span>
                                    <div className="min-w-0 flex-1 pb-1">
                                        <p className="text-sm font-semibold text-[#2F3B2A]">{event.label}</p>
                                        <p className="mt-1 text-xs text-[#7A8474]">{formatDateTime(event.date)}</p>
                                        <p className="mt-1 text-sm leading-5 text-[#7A8474]">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}

function SummaryItem({
    icon,
    label,
    value,
    detail,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    detail?: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-[#7A8474]">{label}</p>
                <p className="mt-1 break-words font-semibold text-[#2F3B2A]">{value}</p>
                {detail && <p className="mt-1 break-words text-xs text-[#7A8474]">{detail}</p>}
            </div>
        </div>
    );
}

function OrderItemCard({ item }: { item: FloristOrderItem }) {
    return (
        <article className="p-6 sm:px-8">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]"><Package size={21} /></div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="break-words font-semibold text-[#2F3B2A]">{item.name}</h3>
                                <span className="rounded-full bg-[#F3F5EE] px-2.5 py-1 text-xs font-medium text-[#55624A]">{ITEM_TYPE_LABELS[item.type] ?? item.type}</span>
                            </div>
                            <p className="mt-1 text-sm text-[#7A8474]">Quantidade: {item.quantity}</p>
                        </div>
                        {(item.variantName || item.variantType) && (
                            <div className="rounded-xl bg-[#FAFBF8] px-3 py-2 text-sm text-[#55624A]">
                                {item.variantType ? `${VARIANT_TYPE_LABELS[item.variantType] ?? item.variantType}: ` : ""}{item.variantName ?? "—"}
                            </div>
                        )}
                    </div>

                    {item.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#64705D]">{item.description}</p>}

                    {item.components.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-[#EEF0EA] p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#7A8474]">Composição</p>
                            <ul className="mt-3 space-y-2">
                                {item.components.map((component) => (
                                    <li key={component.id} className="flex items-start justify-between gap-4 text-sm">
                                        <span className="min-w-0 break-words text-[#374132]">{component.componentName}</span>
                                        <span className="shrink-0 font-medium text-[#55624A]">× {component.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
