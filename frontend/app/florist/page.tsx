"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Package,
    RefreshCw,
    Timer,
    TrendingUp,
} from "lucide-react";

import { floristOrderOffersApi } from "@/lib/api/order-offers/florist-order-offers";
import type { FloristOrderOfferList } from "@/types/order-offers/florist/florist-order-offer-list";
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
    PENDING: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    VIEWED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
    ACCEPTED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    DECLINED: "bg-red-50 text-red-700 ring-1 ring-red-100",
    EXPIRED: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
    CANCELLED: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(value);
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function getTimeRemaining(expiresAt: string, now: number) {
    const milliseconds = new Date(expiresAt).getTime() - now;

    if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
        return { expired: true, label: "Prazo terminado", urgent: true };
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let label: string;
    if (days > 0) label = `${days}d ${hours}h ${minutes}m`;
    else if (hours > 0) label = `${hours}h ${minutes}m ${seconds}s`;
    else label = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

    return {
        expired: false,
        label,
        urgent: milliseconds <= 60 * 60 * 1000,
    };
}

export default function FloristPage() {
    const [offers, setOffers] = useState<FloristOrderOfferList[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());

    const loadOffers = useCallback(async (manual = false) => {
        try {
            if (manual) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const response = await floristOrderOffersApi.getAll({
                page: 1,
                pageSize: 100,
                sort: "createdAt",
                order: "desc",
            });

            setOffers(response.items);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar as propostas.",
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadOffers();
    }, [loadOffers]);

    useEffect(() => {
        const interval = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    const openOffers = useMemo(
        () =>
            offers.filter(
                (offer) =>
                    (offer.status === "PENDING" || offer.status === "VIEWED") &&
                    new Date(offer.expiresAt).getTime() > now,
            ),
        [offers, now],
    );

    const pendingOffers = useMemo(
        () => openOffers.filter((offer) => offer.status === "PENDING"),
        [openOffers],
    );

    const viewedOffers = useMemo(
        () => openOffers.filter((offer) => offer.status === "VIEWED"),
        [openOffers],
    );

    const acceptedOffers = useMemo(
        () => offers.filter((offer) => offer.status === "ACCEPTED"),
        [offers],
    );

    const expiredOpenOffers = useMemo(
        () =>
            offers.filter(
                (offer) =>
                    (offer.status === "PENDING" || offer.status === "VIEWED") &&
                    new Date(offer.expiresAt).getTime() <= now,
            ),
        [offers, now],
    );

    const urgentOffers = useMemo(
        () =>
            openOffers.filter(
                (offer) => new Date(offer.expiresAt).getTime() - now <= 60 * 60 * 1000,
            ),
        [openOffers, now],
    );

    const recentOffers = useMemo(
        () =>
            [...openOffers]
                .sort(
                    (a, b) =>
                        new Date(a.expiresAt).getTime() -
                        new Date(b.expiresAt).getTime(),
                )
                .slice(0, 5),
        [openOffers],
    );

    if (loading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-9 w-64 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
                </div>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="h-36 animate-pulse rounded-3xl bg-gray-100" />
                    ))}
                </div>
                <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#55624A]">
                        Portal da Florista
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#2F3B2A] sm:text-4xl">
                        A sua dashboard
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        Acompanhe as propostas recebidas e veja quanto tempo tem para responder.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadOffers(true)}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[#DDE2D7] bg-white px-5 py-3 text-sm font-semibold text-[#55624A] shadow-sm transition hover:border-[#AEB9A4] hover:bg-[#F8F9F5] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "A atualizar..." : "Atualizar propostas"}
                </button>
            </header>

            {error && (
                <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Não foi possível carregar as propostas</p>
                        <p className="mt-1">{error}</p>
                        <button
                            type="button"
                            onClick={() => void loadOffers(true)}
                            className="mt-2 font-semibold underline underline-offset-2"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            )}

            {urgentOffers.length > 0 && (
                <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                            <Timer size={21} />
                        </div>
                        <div>
                            <p className="font-semibold text-amber-950">
                                {urgentOffers.length === 1
                                    ? "Tem uma proposta quase a expirar"
                                    : `Tem ${urgentOffers.length} propostas quase a expirar`}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-amber-800">
                                Responda às propostas abaixo antes de terminar o prazo.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/florist/offers"
                        className="inline-flex items-center gap-2 self-start rounded-full bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-950 sm:self-auto"
                    >
                        Rever propostas <ArrowRight size={16} />
                    </Link>
                </div>
            )}

            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    href="/florist/offers"
                    label="Por responder"
                    value={openOffers.length}
                    description="Propostas ainda dentro do prazo"
                    icon={<Clock3 size={21} />}
                    accent="olive"
                />
                <MetricCard
                    href="/florist/offers"
                    label="Novas propostas"
                    value={pendingOffers.length}
                    description="Ainda não consultadas"
                    icon={<Package size={21} />}
                    accent="amber"
                />
                <MetricCard
                    href="/florist/offers"
                    label="A aguardar decisão"
                    value={viewedOffers.length}
                    description="Já consultadas por si"
                    icon={<Timer size={21} />}
                    accent="blue"
                />
                <MetricCard
                    href="/florist/offers"
                    label="Propostas aceites"
                    value={acceptedOffers.length}
                    description="Total de propostas aceites"
                    icon={<CheckCircle2 size={21} />}
                    accent="green"
                />
            </section>

            <section className="overflow-hidden rounded-3xl border border-[#E9ECE4] bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-bold text-[#2F3B2A] sm:text-2xl">
                                Propostas a tratar
                            </h2>
                            <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-[#EEF1E8] px-2.5 py-1 text-xs font-bold text-[#55624A]">
                                {openOffers.length}
                            </span>
                        </div>
                        <p className="mt-1.5 text-sm text-gray-500">
                            As propostas com menos tempo disponível aparecem primeiro.
                        </p>
                    </div>
                    <Link
                        href="/florist/offers"
                        className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#55624A] transition hover:text-[#2F3B2A] hover:underline"
                    >
                        Ver todas as propostas <ArrowRight size={16} />
                    </Link>
                </div>

                {recentOffers.length === 0 ? (
                    <div className="px-6 py-14 text-center sm:px-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="mt-4 font-semibold text-[#2F3B2A]">
                            Está tudo em dia!
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            Não tem propostas por responder dentro do prazo.
                            {expiredOpenOffers.length > 0
                                ? ` ${expiredOpenOffers.length} ${expiredOpenOffers.length === 1 ? "proposta terminou" : "propostas terminaram"} o prazo de resposta.`
                                : " Quando receber uma nova proposta, poderá geri-la aqui."}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {recentOffers.map((offer) => {
                            const remaining = getTimeRemaining(offer.expiresAt.toString(), now);
                            const location = [offer.order.deliveryCity, offer.order.deliveryDistrict]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <Link
                                    key={offer.id}
                                    href={`/florist/offers/${offer.id}`}
                                    className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-[#FBFCF9] sm:flex-row sm:items-center sm:justify-between sm:px-8"
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A] transition group-hover:bg-[#E8EDDF]">
                                            <Package size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold text-[#2F3B2A]">
                                                    Proposta de entrega
                                                </p>
                                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[offer.status]}`}>
                                                    {STATUS_LABELS[offer.status]}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 truncate text-sm text-gray-500">
                                                {location || "Local de entrega a confirmar"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-5 pl-16 sm:pl-0">
                                        <div className="sm:text-right">
                                            <p className="text-lg font-bold text-[#2F3B2A]">
                                                {formatCurrency(offer.price)}
                                            </p>
                                            <div className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${remaining.urgent ? "text-red-600" : "text-[#68745D]"}`}>
                                                <Timer size={14} />
                                                <span>{remaining.label}</span>
                                            </div>
                                            <p className="mt-1 text-[11px] text-gray-400">
                                                Prazo: {formatDate(offer.expiresAt.toString())}
                                            </p>
                                        </div>
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition group-hover:border-[#55624A] group-hover:bg-[#55624A] group-hover:text-white">
                                            <ArrowRight size={17} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {openOffers.length > recentOffers.length && (
                    <div className="border-t border-gray-100 bg-[#FAFBF8] px-5 py-4 text-center sm:px-8">
                        <Link
                            href="/florist/offers"
                            className="text-sm font-semibold text-[#55624A] hover:underline"
                        >
                            Ver mais {openOffers.length - recentOffers.length} propostas
                        </Link>
                    </div>
                )}
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-[#E5E9DF] bg-[#F8F9F5] p-4 text-sm text-[#68745D]">
                <TrendingUp size={18} className="mt-0.5 shrink-0" />
                <p className="leading-6">
                    <span className="font-semibold text-[#2F3B2A]">Sugestão:</span>{" "}
                    consulte primeiro as propostas com o temporizador a vermelho. O contador atualiza automaticamente enquanto esta página estiver aberta.
                </p>
            </div>
        </div>
    );
}

function MetricCard({
    href,
    label,
    value,
    description,
    icon,
    accent,
}: {
    href: string;
    label: string;
    value: number;
    description: string;
    icon: React.ReactNode;
    accent: "olive" | "amber" | "blue" | "green";
}) {
    const accentStyles = {
        olive: "bg-[#F3F5EE] text-[#55624A]",
        amber: "bg-amber-50 text-amber-700",
        blue: "bg-blue-50 text-blue-700",
        green: "bg-emerald-50 text-emerald-700",
    };

    return (
        <Link
            href={href}
            className="group rounded-3xl border border-[#E9ECE4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D5DCCB] hover:shadow-md sm:p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="mt-3 text-4xl font-bold tracking-tight text-[#2F3B2A]">
                        {value}
                    </p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accentStyles[accent]}`}>
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-500">{description}</p>
        </Link>
    );
}
