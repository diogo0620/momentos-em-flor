"use client";

import Link from "next/link";
import type { ReactNode, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Flower2,
    LoaderCircle,
    LockKeyhole,
    MapPin,
    Package,
    ShieldCheck,
    Sparkles,
    UserRound,
    X,
    XCircle,
} from "lucide-react";

import { floristOrderOffersApi } from "@/lib/api/order-offers/florist-order-offers";
import type { FloristDeclineOrderOffer } from "@/types/order-offers/florist/florist-decline-order-offer";
import type { FloristOrderOfferDetail } from "@/types/order-offers/florist/florist-order-offer-detail";
import type { FloristOrderOfferStatus } from "@/types/order-offers/florist/florist-order-offer-status";

const STATUS_LABELS: Record<FloristOrderOfferStatus, string> = {
    PENDING: "Nova",
    VIEWED: "Consultada",
    ACCEPTED: "Aceite",
    DECLINED: "Recusada",
    EXPIRED: "Expirada",
    CANCELLED: "Cancelada",
};

const STATUS_STYLES: Record<FloristOrderOfferStatus, string> = {
    PENDING: "border-amber-100 bg-amber-50 text-amber-700",
    VIEWED: "border-blue-100 bg-blue-50 text-blue-700",
    ACCEPTED: "border-green-100 bg-green-50 text-green-700",
    DECLINED: "border-red-100 bg-red-50 text-red-700",
    EXPIRED: "border-gray-200 bg-gray-100 text-gray-600",
    CANCELLED: "border-gray-200 bg-gray-100 text-gray-600",
};

/* Os valores devem corresponder ao enum/DTO usado pelo backend da florista. */
const DECLINE_REASONS = [
    { value: "NO_AVAILABILITY", label: "Sem disponibilidade para a data" },
    { value: "DELIVERY_AREA_NOT_COVERED", label: "Zona de entrega não coberta" },
    { value: "DELIVERY_TIME_UNAVAILABLE", label: "Horário de entrega indisponível" },
    { value: "PRODUCT_UNAVAILABLE", label: "Flores ou produtos indisponíveis" },
    { value: "COMPENSATION_TOO_LOW", label: "Valor proposto insuficiente" },
    { value: "OTHER", label: "Outro motivo" },
] as const;

type DeclineReason = (typeof DECLINE_REASONS)[number]["value"];

const DEFAULT_REASON_DETAILS: Partial<Record<DeclineReason, string>> = {
    NO_AVAILABILITY: "Não tenho disponibilidade para preparar e entregar esta encomenda na data pretendida.",
    DELIVERY_AREA_NOT_COVERED: "A zona de entrega encontra-se fora da área que consigo assegurar.",
    DELIVERY_TIME_UNAVAILABLE: "Não consigo garantir a entrega no período horário solicitado.",
    PRODUCT_UNAVAILABLE: "Não consigo garantir a disponibilidade das flores ou dos produtos necessários.",
    COMPENSATION_TOO_LOW: "O valor proposto não cobre os custos necessários para preparar e entregar esta encomenda.",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(value));
}

function formatDate(value?: string | Date | null, withTime = false) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
}

function formatTimeSlot(value?: string | null) {
    const labels: Record<string, string> = {
        MORNING: "Manhã",
        AFTERNOON: "Tarde",
        EVENING: "Final do dia",
    };
    return value ? labels[value] ?? value : "A combinar";
}

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-400">{label}</p>
                <div className="mt-1 break-words text-sm font-medium text-[#2F3B2A]">{value}</div>
            </div>
        </div>
    );
}

function Modal({ children, onClose, labelledBy }: { children: ReactNode; onClose: () => void; labelledBy: string }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
                {children}
            </div>
        </div>
    );
}

export default function FloristOfferDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = Number(params.id);

    const [offer, setOffer] = useState<FloristOrderOfferDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState<DeclineReason>("NO_AVAILABILITY");
    const [declineReasonDetails, setDeclineReasonDetails] = useState(DEFAULT_REASON_DETAILS.NO_AVAILABILITY ?? "");

    const loadOffer = useCallback(async () => {
        if (!Number.isSafeInteger(id) || id <= 0) {
            setError("A proposta solicitada não é válida.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const result = await floristOrderOffersApi.getById(id);
            setOffer(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar a proposta.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { void loadOffer(); }, [loadOffer]);

    const isActionable = offer?.status === "PENDING" || offer?.status === "VIEWED";

    async function handleAccept() {
        if (!offer || !isActionable || processing) return;
        setProcessing(true);
        setError(null);
        setSuccess(null);
        try {
            await floristOrderOffersApi.accept(offer.id);
            setShowAcceptModal(false);
            setSuccess("Aceitaste a proposta. Os dados completos da entrega ficam agora disponíveis.");
            await loadOffer();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível aceitar a proposta.");
        } finally {
            setProcessing(false);
        }
    }

    async function handleDecline(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!offer || !isActionable || processing) return;
        const details = declineReasonDetails.trim();
        if (!details) {
            setError("Indica os detalhes do motivo da recusa.");
            return;
        }

        setProcessing(true);
        setError(null);
        setSuccess(null);
        try {
            /* O payload segue o DTO de recusa da florista. */
            const dto = {
                declineReason,
                declineReasonDetails: details,
            } as unknown as FloristDeclineOrderOffer;
            await floristOrderOffersApi.decline(offer.id, dto);
            setShowDeclineModal(false);
            setSuccess("A proposta foi recusada.");
            await loadOffer();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível recusar a proposta.");
        } finally {
            setProcessing(false);
        }
    }

    if (isLoading) {
        return (
            <div className="mx-auto max-w-6xl space-y-6 pb-10">
                <Link href="/florist/offers" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"><ArrowLeft size={16} />Voltar às propostas</Link>
                <div className="h-8 w-64 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-36 animate-pulse rounded-3xl bg-gray-100" />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="h-96 animate-pulse rounded-3xl bg-gray-100" /><div className="h-72 rounded-3xl bg-gray-100" /></div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="mx-auto max-w-6xl pb-10">
                <Link href="/florist/offers" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"><ArrowLeft size={16} />Voltar às propostas</Link>
                <div className="mt-8 rounded-3xl bg-white p-12 text-center shadow-sm">
                    <Package size={30} className="mx-auto text-[#55624A]" />
                    <h1 className="mt-4 text-2xl font-bold text-[#2F3B2A]">Proposta não encontrada</h1>
                    <p className="mt-2 text-sm text-gray-500">{error ?? "Não foi possível carregar a proposta."}</p>
                </div>
            </div>
        );
    }

    const order = offer.order;
    const items = offer.items ?? order?.items ?? [];
    const location = [order?.deliveryCity, order?.deliveryDistrict].filter(Boolean).join(", ") || "Localidade não indicada";

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-10">
            <Link href="/florist/offers" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"><ArrowLeft size={16} />Voltar às propostas</Link>

            <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-[#77836B]">Área de propostas</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#2F3B2A]">Detalhes da proposta</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Analisa o valor, a data de entrega e a informação geral antes de decidires se tens disponibilidade para aceitar.</p>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[offer.status]}`}>{STATUS_LABELS[offer.status] ?? offer.status}</span>
            </header>

            {error && <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p className="flex-1">{error}</p><button type="button" onClick={() => setError(null)} aria-label="Fechar alerta" className="rounded-lg p-1 hover:bg-red-100"><X size={16} /></button></div>}
            {success && <div role="status" className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><p className="flex-1">{success}</p><button type="button" onClick={() => setSuccess(null)} aria-label="Fechar mensagem" className="rounded-lg p-1 hover:bg-green-100"><X size={16} /></button></div>}

            <section className="rounded-3xl border border-[#E8ECDF] bg-[#F8FAF5] p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D6DEC8] text-[#55624A]"><Flower2 size={26} /></div>
                        <div><p className="text-sm text-gray-500">Valor proposto</p><p className="mt-1 text-3xl font-bold text-[#2F3B2A]">{formatCurrency(offer.price)}</p><p className="mt-2 text-sm text-gray-500">Recebida a {formatDate(offer.createdAt, true)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs text-gray-400">Entrega</p><p className="mt-1 font-semibold text-[#2F3B2A]">{formatDate(order?.deliveryDate)}</p></div>
                        <div className="rounded-2xl bg-white p-4"><p className="text-xs text-gray-400">Período</p><p className="mt-1 font-semibold text-[#2F3B2A]">{formatTimeSlot(order?.deliveryTimeSlot)}</p></div>
                    </div>
                </div>
            </section>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="min-w-0 space-y-6">
                    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><CalendarDays size={19} /></div><div><h2 className="font-semibold text-[#2F3B2A]">Informação para decisão</h2><p className="mt-1 text-xs text-gray-400">Detalhes gerais disponíveis antes de aceitar.</p></div></div>
                        <div className="grid gap-5 py-5 sm:grid-cols-2">
                            <DetailRow icon={<MapPin size={18} />} label="Zona de entrega" value={location} />
                            <DetailRow icon={<Clock3 size={18} />} label="Período de entrega" value={formatTimeSlot(order?.deliveryTimeSlot)} />
                            <DetailRow icon={<CalendarDays size={18} />} label="Data pretendida" value={formatDate(order?.deliveryDate)} />
                            <DetailRow icon={<Package size={18} />} label="Quantidade de artigos" value={`${items.length} ${items.length === 1 ? "artigo" : "artigos"}`} />
                        </div>
                        {items.length > 0 && <div className="border-t border-gray-100 pt-5"><h3 className="mb-3 text-sm font-semibold text-[#2F3B2A]">Artigos solicitados</h3><div className="space-y-3">{items.map((item: { id?: number | string; productName?: string; name?: string; quantity?: number }, index: number) => <div key={item.id ?? index} className="flex items-center justify-between gap-4 rounded-2xl bg-[#FAFBF8] px-4 py-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-sm font-semibold text-[#55624A]">{item.quantity ?? 1}×</div><p className="break-words text-sm font-medium text-gray-700">{item.productName ?? item.name ?? "Artigo floral"}</p></div><span className="shrink-0 text-xs text-gray-400">Qtd. {item.quantity ?? 1}</span></div>)}</div></div>}
                    </section>

                    {/* A área protegida tem altura natural, padding e overlay interno: evita cortar o conteúdo em ecrãs estreitos. */}
                    <section className="rounded-3xl bg-white shadow-sm">
                        <div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]"><ShieldCheck size={19} /></div><div><h2 className="font-semibold text-[#2F3B2A]">Informação do destinatário e da entrega</h2><p className="mt-1 text-xs text-gray-400">Protegida até a proposta ser aceite.</p></div></div>
                        <div className="relative isolate min-h-[340px] p-5 sm:min-h-[300px] sm:p-6">
                            <div aria-hidden="true" className="pointer-events-none select-none space-y-6 blur-[5px]">
                                <div className="grid gap-6 sm:grid-cols-2"><DetailRow icon={<UserRound size={18} />} label="Destinatário" value="Nome do destinatário" /><DetailRow icon={<MapPin size={18} />} label="Morada completa" value="Rua, número, código postal e localidade" /><DetailRow icon={<Package size={18} />} label="Instruções de entrega" value="Instruções especiais para a entrega" /><DetailRow icon={<Sparkles size={18} />} label="Mensagem do cartão" value="Mensagem personalizada" /></div>
                            </div>
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-3xl bg-white/65 p-5 sm:p-7">
                                <div className="w-full max-w-sm rounded-2xl border border-[#E2E8D9] bg-white/95 p-5 text-center shadow-lg backdrop-blur-sm sm:p-6">
                                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]"><LockKeyhole size={20} /></div>
                                    <h3 className="mt-3 font-semibold text-[#2F3B2A]">Informação confidencial</h3>
                                    <p className="mt-2 text-sm leading-5 text-gray-500">Depois de aceitares a proposta, poderás consultar os dados necessários para preparar e entregar a encomenda.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="space-y-5 lg:sticky lg:top-6">
                    <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                        <h2 className="font-semibold text-[#2F3B2A]">Resumo da proposta</h2>
                        <div className="mt-5 space-y-4">
                            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Valor a receber</span><span className="font-semibold text-[#2F3B2A]">{formatCurrency(offer.price)}</span></div>
                            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Data de entrega</span><span className="text-right font-medium text-[#2F3B2A]">{formatDate(order?.deliveryDate)}</span></div>
                            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Localidade</span><span className="max-w-36 text-right font-medium text-[#2F3B2A]">{location}</span></div>
                            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Artigos</span><span className="font-medium text-[#2F3B2A]">{items.length}</span></div>
                            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Prazo de resposta</span><span className="text-right font-medium text-[#2F3B2A]">{formatDate(offer.expiresAt, true)}</span></div>
                        </div>
                        {isActionable ? <div className="mt-6 space-y-3 border-t border-gray-100 pt-5"><p className="text-sm leading-5 text-gray-500">Tens disponibilidade para preparar e entregar esta encomenda?</p><button type="button" onClick={() => { setError(null); setShowAcceptModal(true); }} disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46523C] disabled:cursor-not-allowed disabled:opacity-60"><Check size={17} />Aceitar proposta</button><button type="button" onClick={() => { setError(null); setShowDeclineModal(true); }} disabled={processing} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"><XCircle size={17} />Recusar proposta</button></div> : <div className="mt-6 rounded-2xl bg-[#F8FAF5] p-4 text-sm text-gray-500"><CheckCircle2 size={18} className="mb-2 text-[#55624A]" />Esta proposta está no estado <span className="font-semibold text-[#2F3B2A]">{STATUS_LABELS[offer.status] ?? offer.status}</span>. Já não podes aceitar ou recusar através desta página.</div>}
                    </section>
                    <div className="rounded-2xl border border-[#E8ECDF] bg-[#F8FAF5] p-4 text-xs leading-5 text-gray-500"><LockKeyhole size={16} className="mb-2 text-[#77836B]" />Os dados pessoais e a morada completa não são apresentados nesta fase. O efeito de desfocagem é apenas visual; a API também deve impedir o acesso a esses dados antes da aceitação.</div>
                </aside>
            </div>

            {showAcceptModal && <Modal labelledBy="accept-offer-title" onClose={() => { if (!processing) setShowAcceptModal(false); }}><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]"><CheckCircle2 size={24} /></div><h2 id="accept-offer-title" className="mt-4 text-center text-xl font-semibold text-[#2F3B2A]">Aceitar esta proposta?</h2><p className="mt-2 text-center text-sm leading-6 text-gray-500">Ao aceitar, ficas responsável por preparar e entregar a encomenda. Os dados completos do destinatário e da entrega ficarão disponíveis após a confirmação.</p><div className="mt-5 rounded-2xl bg-[#F8FAF5] p-4"><div className="flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Valor a receber</span><span className="font-semibold text-[#2F3B2A]">{formatCurrency(offer.price)}</span></div><div className="mt-3 flex items-center justify-between gap-4 text-sm"><span className="text-gray-500">Entrega</span><span className="text-right font-medium text-[#2F3B2A]">{formatDate(order?.deliveryDate)} · {formatTimeSlot(order?.deliveryTimeSlot)}</span></div></div><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={() => setShowAcceptModal(false)} className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] hover:bg-[#F3F5EE] disabled:opacity-50">Voltar</button><button type="button" disabled={processing} onClick={() => void handleAccept()} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#46523C] disabled:opacity-60">{processing && <LoaderCircle size={16} className="animate-spin" />}Confirmar aceitação</button></div></Modal>}

            {showDeclineModal && <Modal labelledBy="decline-offer-title" onClose={() => { if (!processing) setShowDeclineModal(false); }}><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600"><XCircle size={22} /></div><div><h2 id="decline-offer-title" className="text-xl font-semibold text-[#2F3B2A]">Recusar proposta</h2><p className="mt-1 text-sm leading-5 text-gray-500">Seleciona o motivo e acrescenta uma breve explicação para registar a decisão.</p></div></div><form onSubmit={handleDecline} className="mt-6 space-y-4"><div><label htmlFor="decline-reason" className="mb-2 block text-sm font-medium text-[#374132]">Motivo da recusa *</label><select id="decline-reason" value={declineReason} onChange={(event) => { const reason = event.target.value as DeclineReason; setDeclineReason(reason); setDeclineReasonDetails(reason === "OTHER" ? "" : DEFAULT_REASON_DETAILS[reason] ?? ""); }} required disabled={processing} className="w-full rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]">{DECLINE_REASONS.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select></div><div><label htmlFor="decline-reason-details" className="mb-2 block text-sm font-medium text-[#374132]">Detalhes da recusa *</label><textarea id="decline-reason-details" value={declineReasonDetails} onChange={(event) => setDeclineReasonDetails(event.target.value)} placeholder="Explica porque não consegues aceitar esta proposta..." rows={4} required maxLength={1000} disabled={processing} className="w-full resize-y rounded-xl border border-[#E2E6DD] bg-white px-4 py-3 text-sm text-[#2F3B2A] outline-none placeholder:text-[#A0A89A] focus:border-[#55624A] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F3F5EE]"/><p className="mt-1 text-right text-xs text-[#7A8474]">{declineReasonDetails.length}/1000</p></div><div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><button type="button" disabled={processing} onClick={() => setShowDeclineModal(false)} className="rounded-full border border-[#DDE2D7] px-5 py-3 text-sm font-medium text-[#55624A] hover:bg-[#F3F5EE] disabled:opacity-50">Cancelar</button><button type="submit" disabled={processing || !declineReasonDetails.trim()} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{processing ? <LoaderCircle size={16} className="animate-spin" /> : <XCircle size={16} />}Confirmar recusa</button></div></form></Modal>}
        </div>
    );
}
