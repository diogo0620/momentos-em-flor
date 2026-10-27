
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    AlertTriangle,
    Check,
    CheckCircle2,
    Clock,
    Flower2,
    Handshake,
    LoaderCircle,
    MapPin,
    MessageSquareWarning,
    X,
    XCircle,
} from "lucide-react";

import { adminOrderOffersApi } from "@/lib/api/order-offers/admin-order-offers";

import type {
    AdminOrderOfferCancellationReason,
    AdminOrderOfferDeclineReason,
    AdminOrderOfferDetail,
    AdminOrderOfferStatus,
} from "@/types/order-offers/admin/admin-order-offer-detail";

const STATUS_LABELS: Record<AdminOrderOfferStatus, string> = {
    PENDING: "Pendente",
    VIEWED: "Visualizada",
    ACCEPTED: "Aceite",
    DECLINED: "Recusada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<AdminOrderOfferStatus, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
    VIEWED: "bg-blue-50 text-blue-700 ring-blue-200",
    ACCEPTED: "bg-green-50 text-green-700 ring-green-200",
    DECLINED: "bg-red-50 text-red-700 ring-red-200",
    EXPIRED: "bg-gray-100 text-gray-600 ring-gray-200",
    CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
};

const DECLINE_REASON_LABELS: Record<AdminOrderOfferDeclineReason, string> = {
    PRICE_TOO_LOW: "Valor proposto insuficiente",
    DELIVERY_AREA_NOT_COVERED: "Zona de entrega não coberta",
    DELIVERY_DATE_UNAVAILABLE: "Data ou horário indisponível",
    PRODUCT_UNAVAILABLE: "Produto indisponível",
    PRODUCT_SPECIFICATION_UNAVAILABLE: "Não é possível cumprir a especificação do produto",
    OTHER: "Outro motivo",
};

const DECLINE_REASON_DEFAULT_DETAILS: Partial<
    Record<AdminOrderOfferDeclineReason, string>
> = {
    PRICE_TOO_LOW:
        "O valor proposto não cobre os custos necessários para executar esta encomenda.",
    DELIVERY_AREA_NOT_COVERED:
        "A morada de entrega encontra-se fora da zona atualmente coberta.",
    DELIVERY_DATE_UNAVAILABLE:
        "Não existe disponibilidade para cumprir a data ou o período de entrega solicitado.",
    PRODUCT_UNAVAILABLE:
        "Os produtos ou flores necessários para esta encomenda não estão disponíveis.",
    PRODUCT_SPECIFICATION_UNAVAILABLE:
        "Não é possível garantir a composição ou personalização solicitada para esta encomenda.",
};

const CANCELLATION_REASON_LABELS: Record<
    AdminOrderOfferCancellationReason,
    string
> = {
    ANOTHER_OFFER_ACCEPTED: "Foi aceite uma proposta de outra florista",
    ORDER_CANCELLED: "A encomenda associada foi cancelada",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function formatDate(value?: string | Date | null): string {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return DATE_FORMATTER.format(date);
}

function formatPrice(value: number): string {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function isActionable(status: AdminOrderOfferStatus): boolean {
    return status === "PENDING" || status === "VIEWED";
}

export default function AdminOrderOfferDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const id = Number(params.id);

    const [offer, setOffer] = useState<AdminOrderOfferDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] =
        useState<AdminOrderOfferDeclineReason>("PRICE_TOO_LOW");
    const [declineReasonDetails, setDeclineReasonDetails] = useState(
        DECLINE_REASON_DEFAULT_DETAILS.PRICE_TOO_LOW ?? "",
    );

    const loadOffer = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("O ID da proposta é inválido.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await adminOrderOffersApi.getById(id);
            setOffer(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar a proposta.",
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadOffer();
    }, [loadOffer]);

    async function handleAccept() {
        if (!offer || !isActionable(offer.status) || processing) return;

        const confirmed = window.confirm(
            `Tens a certeza de que pretendes aceitar a proposta da florista "${offer.florist.name}" para a encomenda ${offer.order.orderNumber}?`,
        );

        if (!confirmed) return;

        setProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            await adminOrderOffersApi.accept(offer.id);

            setSuccess("A proposta foi aceite com sucesso.");
            await loadOffer();
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível aceitar a proposta.",
            );
        } finally {
            setProcessing(false);
        }
    }

    async function handleDecline(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!offer || !isActionable(offer.status) || processing) return;

        const details = declineReasonDetails.trim();

        if (!details) {
            setError("Indica os detalhes do motivo da recusa.");
            return;
        }

        setProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            await adminOrderOffersApi.decline(offer.id, {
                declineReason,
                declineReasonDetails: details,
            });

            setShowDeclineForm(false);
            setDeclineReason("PRICE_TOO_LOW");
            setDeclineReasonDetails(
                DECLINE_REASON_DEFAULT_DETAILS.PRICE_TOO_LOW ?? "",
            );
            setSuccess("A proposta foi recusada com sucesso.");

            await loadOffer();
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível recusar a proposta.",
            );
        } finally {
            setProcessing(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-8 pb-10">
            {/* CABEÇALHO */}

            <div>
                <Link
                    href="/admin/order-offers"
                    className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às propostas
                </Link>

                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <Handshake size={24} />
                        </div>

                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                                Detalhe da proposta
                            </h1>
                            <p className="mt-1 text-sm text-[#7A8474]">
                                Consulta os dados e gere a decisão da proposta.
                            </p>
                        </div>
                    </div>

                    {offer && (
                        <span
                            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${STATUS_STYLES[offer.status]}`}
                        >
                            {STATUS_LABELS[offer.status]}
                        </span>
                    )}
                </div>
            </div>

            {/* ERRO */}

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="font-semibold">
                            Não foi possível concluir a operação
                        </p>
                        <p className="mt-1">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        aria-label="Fechar alerta"
                        className="rounded-lg p-1 transition hover:bg-red-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* SUCESSO */}

            {success && (
                <div
                    role="status"
                    className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{success}</p>
                    <button
                        type="button"
                        onClick={() => setSuccess(null)}
                        aria-label="Fechar mensagem"
                        className="rounded-lg p-1 transition hover:bg-green-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex items-center gap-3 rounded-3xl border border-[#E8EBE4] bg-white p-8 text-sm text-[#7A8474] shadow-sm">
                    <LoaderCircle size={18} className="animate-spin" />
                    A carregar proposta...
                </div>
            ) : offer ? (
                <>
                    {/* RESUMO */}

                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm text-[#7A8474]">
                                    Proposta
                                </p>
                                <h2 className="mt-1 text-2xl font-semibold text-[#2F3B2A]">
                                    #{offer.id}
                                </h2>
                                <p className="mt-2 text-sm text-[#7A8474]">
                                    Criada em {formatDate(offer.createdAt)}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F3F5EE] px-5 py-4">
                                <p className="text-xs font-medium text-[#7A8474]">
                                    Valor proposto
                                </p>
                                <p className="mt-1 text-2xl font-bold text-[#55624A]">
                                    {formatPrice(offer.price)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-7 grid gap-4 border-t border-[#EEF0EA] pt-6 sm:grid-cols-2">
                            <InfoCard
                                icon={<Handshake size={19} />}
                                label="Encomenda"
                                value={offer.order.orderNumber}
                                description={`ID ${offer.order.id}`}
                                href={`/admin/orders/${offer.order.id}/edit`}
                            />

                            <InfoCard
                                icon={<Flower2 size={19} />}
                                label="Florista"
                                value={offer.florist.name}
                                description={`ID ${offer.florist.id}`}
                                href={`/admin/florists/${offer.florist.id}/edit`}
                            />

                            <InfoCard
                                icon={<Clock size={19} />}
                                label="Data de expiração"
                                value={formatDate(offer.expiresAt)}
                            />

                            {offer.distanceKm !== null && (
                                <InfoCard
                                    icon={<MapPin size={19} />}
                                    label="Distância"
                                    value={`${offer.distanceKm} km`}
                                />
                            )}
                        </div>
                    </section>

                    {/* HISTÓRICO */}

                    <section className="rounded-3xl border border-[#E8EBE4] bg-white p-6 shadow-sm sm:p-8">
                        <h2 className="text-lg font-semibold text-[#2F3B2A]">
                            Histórico da proposta
                        </h2>

                        <div className="mt-6 space-y-5">
                            <TimelineItem
                                title="Proposta criada"
                                date={offer.createdAt}
                                description="A proposta foi criada para esta florista."
                                completed
                            />

                            <TimelineItem
                                title="Proposta visualizada"
                                date={offer.viewedAt}
                                description="A florista visualizou a proposta."
                                completed={Boolean(offer.viewedAt)}
                            />

                            <TimelineItem
                                title="Proposta aceite"
                                date={offer.acceptedAt}
                                description="A proposta foi aceite."
                                completed={Boolean(offer.acceptedAt)}
                            />

                            <TimelineItem
                                title="Proposta recusada"
                                date={offer.declinedAt}
                                description="A proposta foi recusada."
                                completed={Boolean(offer.declinedAt)}
                            />

                            <TimelineItem
                                title="Proposta cancelada"
                                date={offer.cancelledAt}
                                description="A proposta foi cancelada automaticamente pelo sistema."
                                completed={Boolean(offer.cancelledAt)}
                            />
                        </div>

                        {offer.declineReason && (
                            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                                    <MessageSquareWarning size={17} />
                                    Motivo da recusa
                                </div>
                                <p className="mt-2 text-sm font-medium text-red-700">
                                    {DECLINE_REASON_LABELS[offer.declineReason]}
                                </p>
                                {offer.declineReasonDetails && (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                                        {offer.declineReasonDetails}
                                    </p>
                                )}
                            </div>
                        )}

                        {offer.cancellationReason && (
                            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <XCircle size={17} />
                                    Motivo do cancelamento
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-700">
                                    {CANCELLATION_REASON_LABELS[offer.cancellationReason]}
                                </p>
                                {offer.cancellationReasonDetails && (
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                        {offer.cancellationReasonDetails}
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    {/* AÇÕES */}

                    {isActionable(offer.status) ? (
                        <section className="rounded-3xl border border-[#DDE2D7] bg-white p-6 shadow-sm sm:p-8">
                            <div>
                                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                                    Decisão da proposta
                                </h2>
                                <p className="mt-1 text-sm text-[#7A8474]">
                                    Podes aceitar a proposta ou recusá-la,
                                    indicando o motivo.
                                </p>
                            </div>

                            {!showDeclineForm ? (
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setError(null);
                                            setShowDeclineForm(true);
                                        }}
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <XCircle size={17} />
                                        Recusar proposta
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => void handleAccept()}
                                        disabled={processing}
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#435039] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <LoaderCircle
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Check size={17} />
                                        )}
                                        Aceitar proposta
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleDecline}
                                    className="mt-6 space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="decline-reason"
                                            className="mb-2 block text-sm font-medium text-[#374132]"
                                        >
                                            Motivo da recusa *
                                        </label>
                                        <select
                                            id="decline-reason"
                                            value={declineReason}
                                            onChange={(event) => {
                                                const reason = event.target.value as AdminOrderOfferDeclineReason;
                                                setDeclineReason(reason);
                                                setDeclineReasonDetails(
                                                    reason === "OTHER"
                                                        ? ""
                                                        : DECLINE_REASON_DEFAULT_DETAILS[reason] ?? "",
                                                );
                                            }}
                                            required
                                            disabled={processing}
                                            className="w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"
                                        >
                                            {Object.entries(DECLINE_REASON_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="decline-reason-details"
                                            className="mb-2 block text-sm font-medium text-[#374132]"
                                        >
                                            Detalhes da recusa *
                                        </label>
                                        <textarea
                                            id="decline-reason-details"
                                            value={declineReasonDetails}
                                            onChange={(event) =>
                                                setDeclineReasonDetails(event.target.value)
                                            }
                                            placeholder="Explica o motivo pelo qual estás a recusar esta proposta..."
                                            rows={4}
                                            required
                                            maxLength={1000}
                                            disabled={processing}
                                            className="w-full resize-y rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none transition placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"
                                        />
                                        <p className="mt-1 text-right text-xs text-[#7A8474]">
                                            {declineReasonDetails.length}/1000
                                        </p>
                                    </div>

                                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeclineForm(false);
                                                setDeclineReason("PRICE_TOO_LOW");
                                                setDeclineReasonDetails(
                                                    DECLINE_REASON_DEFAULT_DETAILS.PRICE_TOO_LOW ?? "",
                                                );
                                                setError(null);
                                            }}
                                            disabled={processing}
                                            className="rounded-full border border-[#DDE2D7] px-6 py-3 text-sm font-medium text-[#55624A] transition hover:bg-[#F3F5EE] disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                !declineReasonDetails.trim()
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {processing ? (
                                                <LoaderCircle
                                                    size={17}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <XCircle size={17} />
                                            )}
                                            Confirmar recusa
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    ) : (
                        <div className="flex items-start gap-3 rounded-2xl border border-[#E8EBE4] bg-[#F9FAF7] p-5">
                            <CheckCircle2
                                size={20}
                                className="mt-0.5 shrink-0 text-[#55624A]"
                            />
                            <div>
                                <p className="font-semibold text-[#2F3B2A]">
                                    Esta proposta já não está disponível para decisão
                                </p>
                                <p className="mt-1 text-sm text-[#7A8474]">
                                    O estado atual é «{STATUS_LABELS[offer.status]}».
                                    Não é possível aceitá-la ou recusá-la novamente.
                                </p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="rounded-3xl border border-[#E8EBE4] bg-white p-8 shadow-sm">
                    <p className="font-semibold text-[#2F3B2A]">
                        Proposta não encontrada
                    </p>
                    <p className="mt-2 text-sm text-[#7A8474]">
                        Verifica o endereço ou regressa à lista de propostas.
                    </p>
                    <Link
                        href="/admin/order-offers"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#55624A] hover:underline"
                    >
                        <ArrowLeft size={16} />
                        Voltar às propostas
                    </Link>
                </div>
            )}
        </div>
    );
}

function InfoCard({
    icon,
    label,
    value,
    description,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    description?: string;
    href?: string;
}) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#EEF0EA] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-[#7A8474]">
                    {label}
                </p>

                {href ? (
                    <Link
                        href={href}
                        className="mt-1 block break-words font-semibold text-[#55624A] hover:underline"
                    >
                        {value}
                    </Link>
                ) : (
                    <p className="mt-1 break-words font-semibold text-[#2F3B2A]">
                        {value}
                    </p>
                )}

                {description && (
                    <p className="mt-1 text-xs text-[#7A8474]">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function TimelineItem({
    title,
    date,
    description,
    completed,
}: {
    title: string;
    date?: string | Date | null;
    description: string;
    completed: boolean;
}) {
    return (
        <div className="flex gap-3">
            <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    completed
                        ? "bg-[#F3F5EE] text-[#55624A]"
                        : "bg-gray-100 text-gray-400"
                }`}
            >
                {completed ? <Check size={17} /> : <Clock size={17} />}
            </div>

            <div className="min-w-0 flex-1 border-b border-[#EEF0EA] pb-5 last:border-0 last:pb-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p
                        className={`font-semibold ${
                            completed ? "text-[#2F3B2A]" : "text-gray-400"
                        }`}
                    >
                        {title}
                    </p>

                    {date && (
                        <p className="text-xs text-[#7A8474]">
                            {formatDate(date)}
                        </p>
                    )}
                </div>

                <p className="mt-1 text-sm text-[#7A8474]">
                    {description}
                </p>
            </div>
        </div>
    );
}

