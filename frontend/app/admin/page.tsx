"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Flower2,
    LayoutGrid,
    Package,
    RefreshCw,
    ShoppingBag,
    Store,
    Truck,
    Users,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import { adminOrdersApi } from "@/lib/api/orders/admin-orders";
import { adminProductsApi } from "@/lib/api/products/admin-products";
import type { AdminOrderList } from "@/types/orders/admin/admin-order-list";
import type { AdminOrderStatus } from "@/types/orders/admin/admin-order-status";

type DashboardOrderResponse = {
    items: AdminOrderList[];
    page: number;
    pages: number;
    total: number;
};

type DashboardState = {
    orders: AdminOrderList[];
    totalOrders: number;
    totalProducts: number;
    pendingPayment: number;
    awaitingFlorists: number;
    inProgress: number;
};

const STATUS_CONFIG: Record<AdminOrderStatus, { label: string; className: string; dot: string }> = {
    CREATED: { label: "Criada", className: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
    PENDING_PAYMENT: { label: "Pagamento pendente", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
    WAITING_FOR_FLORISTS: { label: "À espera de floristas", className: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-500" },
    ASSIGNED: { label: "Atribuída", className: "bg-sky-50 text-sky-700", dot: "bg-sky-500" },
    IN_PRODUCTION: { label: "Em preparação", className: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
    READY_FOR_DELIVERY: { label: "Em entrega", className: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
    DELIVERED: { label: "Entregue", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
    CANCELLED: { label: "Cancelada", className: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
};

function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(Number(value));
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardState>({ orders: [], totalOrders: 0, totalProducts: 0, pendingPayment: 0, awaitingFlorists: 0, inProgress: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            setError(null);

            const [ordersResponse, productsResponse, pendingResponse, awaitingResponse, assignedResponse, productionResponse, deliveryResponse] = await Promise.all([
                adminOrdersApi.getAll({ page: 1, pageSize: 8, sort: "createdAt", order: "desc" }),
                adminProductsApi.getAll({ page: 1, pageSize: 1, sort: "name", order: "asc" }),
                adminOrdersApi.getAll({ page: 1, pageSize: 1, status: "PENDING_PAYMENT" }),
                adminOrdersApi.getAll({ page: 1, pageSize: 1, status: "WAITING_FOR_FLORISTS" }),
                adminOrdersApi.getAll({ page: 1, pageSize: 1, status: "ASSIGNED" }),
                adminOrdersApi.getAll({ page: 1, pageSize: 1, status: "IN_PRODUCTION" }),
                adminOrdersApi.getAll({ page: 1, pageSize: 1, status: "READY_FOR_DELIVERY" }),
            ]);

            const orderResult = ordersResponse as DashboardOrderResponse;
            setData({
                orders: orderResult.items ?? [],
                totalOrders: Number(orderResult.total ?? 0),
                totalProducts: Number(productsResponse.total ?? 0),
                pendingPayment: Number(pendingResponse.total ?? 0),
                awaitingFlorists: Number(awaitingResponse.total ?? 0),
                inProgress: Number(assignedResponse.total ?? 0) + Number(productionResponse.total ?? 0) + Number(deliveryResponse.total ?? 0),
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível carregar os dados do dashboard.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const recentOrderValue = data.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return (
        <div className="space-y-7 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader title="Dashboard" subtitle="Uma visão geral do que está a acontecer na Momentos em Flor." />
                <button
                    type="button"
                    onClick={() => void loadDashboard(true)}
                    disabled={loading || refreshing}
                    className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#E2E6DD] bg-white px-4 text-sm font-semibold text-[#46523C] transition hover:bg-[#F5F7F2] disabled:opacity-60 sm:self-auto"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    Atualizar dados
                </button>
            </div>

            <section className="relative isolate overflow-hidden rounded-[28px] bg-[#35412F] px-6 py-7 text-white shadow-sm sm:px-9 sm:py-9">
                <div className="pointer-events-none absolute -right-10 -top-24 -z-10 h-72 w-72 rounded-full border-[1px] border-white/10" />
                <div className="pointer-events-none absolute -right-1 -top-14 -z-10 h-52 w-52 rounded-full border-[1px] border-white/10" />
                <div className="pointer-events-none absolute bottom-[-95px] right-[20%] -z-10 h-52 w-52 rounded-full bg-[#AAB99A]/15 blur-2xl" />
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#D6DEC8]">Prioridades operacionais</p>
                        <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Começa pelo que requer atenção.</h2>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Contagens globais atualizadas diretamente a partir das encomendas.</p>
                    </div>
                    <Link href="/admin/orders" className="inline-flex items-center gap-2 rounded-xl bg-[#D6DEC8] px-4 py-3 text-sm font-semibold text-[#2F3B2A] transition hover:bg-white">Abrir encomendas <ArrowRight size={16} /></Link>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <PriorityLink href="/admin/orders" label="Pagamentos pendentes" value={data.pendingPayment} loading={loading} />
                    <PriorityLink href="/admin/orders" label="Por atribuir" value={data.awaitingFlorists} loading={loading} />
                    <PriorityLink href="/admin/orders" label="Em curso" value={data.inProgress} loading={loading} />
                </div>
            </section>

            {error && (
                <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between">
                    <span>{error}</span>
                    <button type="button" onClick={() => void loadDashboard()} className="font-semibold underline underline-offset-4">Tentar novamente</button>
                </div>
            )}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Total de encomendas" value={loading ? "—" : data.totalOrders.toLocaleString("pt-PT")} detail="Encomendas registadas" icon={<ShoppingBag size={19} />} accent="sage" href="/admin/orders" loading={loading} />
                <MetricCard title="Produtos no catálogo" value={loading ? "—" : data.totalProducts.toLocaleString("pt-PT")} detail="Produtos disponíveis para gerir" icon={<Package size={19} />} accent="sand" href="/admin/products" loading={loading} />
                <MetricCard title="Em curso" value={loading ? "—" : data.inProgress.toString()} detail="Atribuídas, em preparação ou entrega" icon={<Truck size={19} />} accent="blue" href="/admin/orders" loading={loading} />
                <MetricCard title="Por atribuir" value={loading ? "—" : data.awaitingFlorists.toString()} detail="Aguardam atribuição operacional" icon={<Store size={19} />} accent="amber" href="/admin/orders" loading={loading} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
                <div className="overflow-hidden rounded-[24px] border border-[#E7EAE2] bg-white shadow-[0_4px_24px_rgba(47,59,42,0.035)]">
                    <div className="flex flex-col gap-3 border-b border-[#EEF0EB] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h3 className="text-base font-semibold text-[#2F3B2A]">Encomendas recentes</h3>
                            <p className="mt-1 text-sm text-[#858D7F]">As últimas entradas na plataforma</p>
                        </div>
                        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#55624A] transition hover:text-[#2F3B2A]">Todas as encomendas <ArrowRight size={15} /></Link>
                    </div>
                    {loading ? (
                        <div className="space-y-4 p-6">{[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-[#F5F7F2]" />)}</div>
                    ) : data.orders.length === 0 ? (
                        <div className="flex flex-col items-center px-6 py-14 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#69775D]"><ShoppingBag size={24} /></div>
                            <p className="mt-4 font-semibold text-[#2F3B2A]">Ainda não há encomendas</p>
                            <p className="mt-1 text-sm text-[#858D7F]">Quando chegarem novas encomendas, aparecem aqui.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[620px] text-left">
                                <thead><tr className="bg-[#FAFBF8] text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B9385]"><th className="px-6 py-3.5">Encomenda</th><th className="px-4 py-3.5">Cliente</th><th className="px-4 py-3.5">Estado</th><th className="px-4 py-3.5">Total</th><th className="px-6 py-3.5 text-right">Data</th></tr></thead>
                                <tbody>
                                    {data.orders.map((order) => {
                                        const status = STATUS_CONFIG[order.status];
                                        return <tr key={order.id} className="border-t border-[#F0F2ED] transition hover:bg-[#FCFDFB]">
                                            <td className="px-6 py-4"><Link href={`/admin/orders/${order.id}/edit`} className="font-semibold text-[#35412F] hover:underline">{order.orderNumber}</Link></td>
                                            <td className="px-4 py-4"><p className="max-w-[180px] truncate text-sm font-medium text-[#3D4637]">{order.customerFirstName} {order.customerLastName}</p><p className="mt-0.5 max-w-[180px] truncate text-xs text-[#969D91]">{order.customerEmail}</p></td>
                                            <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${status.className}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span></td>
                                            <td className="px-4 py-4 text-sm font-semibold tabular-nums text-[#35412F]">{formatPrice(order.total)}</td>
                                            <td className="px-6 py-4 text-right text-xs text-[#858D7F]">{formatDate(order.createdAt)}</td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!loading && data.orders.length > 0 && <div className="flex items-center justify-between border-t border-[#EEF0EB] px-6 py-4"><span className="text-xs text-[#92998D]">A mostrar {data.orders.length} encomendas recentes</span><Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[#55624A] hover:underline">Abrir gestão <ArrowRight size={14} /></Link></div>}
                </div>

                <div className="space-y-5">
                    <div className="rounded-[24px] border border-[#E7EAE2] bg-white p-5 shadow-[0_4px_24px_rgba(47,59,42,0.035)] sm:p-6">
                        <div className="flex items-center justify-between"><div><h3 className="text-base font-semibold text-[#2F3B2A]">Resumo rápido</h3><p className="mt-1 text-sm text-[#858D7F]">Estados nas últimas 8 encomendas</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#65745A]"><LayoutGrid size={19} /></div></div>
                        <div className="mt-5 space-y-4">
                            <StatusSummary label="Pagamento pendente" count={data.pendingPayment} total={data.totalOrders} color="bg-amber-400" loading={loading} />
                            <StatusSummary label="Por atribuir" count={data.awaitingFlorists} total={data.totalOrders} color="bg-yellow-400" loading={loading} />
                            <StatusSummary label="Em curso" count={data.orders.filter((order) => order.status === "ASSIGNED" || order.status === "IN_PRODUCTION" || order.status === "READY_FOR_DELIVERY").length} total={data.orders.length} color="bg-[#849574]" loading={loading} />
                            <StatusSummary label="Entregues" count={data.orders.filter((order) => order.status === "DELIVERED").length} total={data.orders.length} color="bg-emerald-500" loading={loading} />
                        </div>
                        <div className="mt-5 rounded-2xl bg-[#F7F8F4] p-4"><p className="text-xs font-medium text-[#858D7F]">Valor total das encomendas recentes</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[#35412F]">{loading ? "—" : formatPrice(recentOrderValue)}</p><p className="mt-1 text-xs text-[#92998D]">Soma das encomendas listadas acima; não representa faturação global.</p></div>
                    </div>

                    <div className="rounded-[24px] border border-[#E7EAE2] bg-[#F8F9F5] p-5 sm:p-6">
                        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#65745A] shadow-sm"><Flower2 size={21} /></div><div><h3 className="font-semibold text-[#2F3B2A]">Atalhos de gestão</h3><p className="mt-0.5 text-xs text-[#858D7F]">Acede rapidamente às áreas principais</p></div></div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <QuickLink href="/admin/products" icon={<Package size={17} />} label="Produtos" />
                            <QuickLink href="/admin/florists" icon={<Store size={17} />} label="Floristas" />
                            <QuickLink href="/admin/customers" icon={<Users size={17} />} label="Clientes" />
                            <QuickLink href="/admin/orders" icon={<ShoppingBag size={17} />} label="Encomendas" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-2 border-t border-[#E7EAE2] pt-5 text-xs text-[#92998D] sm:flex-row sm:items-center sm:justify-between">
                <span>Momentos em Flor · Painel de administração</span>
                <span>Dados carregados a partir da API</span>
            </div>
        </div>
    );
}

function MetricCard({ title, value, detail, icon, accent, href, loading }: { title: string; value: string; detail: string; icon: React.ReactNode; accent: "sage" | "sand" | "blue" | "amber"; href: string; loading: boolean }) {
    const accents = {
        sage: "bg-[#F0F3EA] text-[#5C6B50]",
        sand: "bg-[#F8F1E7] text-[#9B7949]",
        blue: "bg-[#EDF4F6] text-[#547B86]",
        amber: "bg-[#FBF3E4] text-[#A47C37]",
    };
    return <Link href={href} className="group rounded-[22px] border border-[#E7EAE2] bg-white p-5 shadow-[0_4px_24px_rgba(47,59,42,0.025)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-3"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accents[accent]}`}>{icon}</div><ArrowUpRight size={17} className="text-[#B1B7AB] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#55624A]" /></div>
        <p className="mt-5 text-sm font-medium text-[#858D7F]">{title}</p>
        <p className="mt-1.5 text-3xl font-semibold tracking-tight text-[#2F3B2A]">{loading ? <span className="inline-block h-9 w-16 animate-pulse rounded-lg bg-[#F0F2ED]" /> : value}</p>
        <p className="mt-2 text-xs text-[#92998D]">{detail}</p>
    </Link>;
}

function PriorityLink({ href, label, value, loading }: { href: string; label: string; value: number; loading: boolean }) {
    return <Link href={href} className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4 transition hover:bg-white/15">
        <div><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{loading ? "—" : value}</p></div>
        <ArrowRight size={18} className="text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
    </Link>;
}

function StatusSummary({ label, count, total, color, loading }: { label: string; count: number; total: number; color: string; loading: boolean }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return <div>
        <div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm text-[#596252]">{label}</span><span className="text-xs font-semibold tabular-nums text-[#35412F]">{loading ? "—" : count}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F0F2ED]"><div className={`h-full rounded-full transition-all ${color}`} style={{ width: loading ? "0%" : `${percentage}%` }} /></div>
    </div>;
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return <Link href={href} className="group flex items-center justify-between gap-2 rounded-xl border border-[#E7EAE2] bg-white px-3.5 py-3 text-sm font-medium text-[#4B5644] transition hover:border-[#CDD5C4] hover:bg-white hover:text-[#2F3B2A]"><span className="flex items-center gap-2.5">{icon}{label}</span><ArrowDownRight size={15} className="text-[#A6AEA0] transition group-hover:translate-x-0.5 group-hover:translate-y-0.5" /></Link>;
}
