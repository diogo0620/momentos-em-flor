"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Package, Search, ShoppingBag } from "lucide-react";
import { getCustomerOrders, type CustomerOrderListItem, type OrderStatusFilter } from "@/lib/api/customer-account";
import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import { CustomerOrderList } from "@/types/orders/customer/customer-order-list";

const statusOptions: { value: OrderStatusFilter | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos os estados" }, { value: "PENDING_PAYMENT", label: "A aguardar pagamento" }, { value: "CREATED", label: "Criada" }, { value: "WAITING_FOR_FLORISTS", label: "Em processamento" }, { value: "ASSIGNED", label: "Em processamento" }, { value: "IN_PRODUCTION", label: "Em preparação" }, { value: "READY_FOR_DELIVERY", label: "Pronta para entrega" }, { value: "DELIVERED", label: "Entregue" }, { value: "CANCELLED", label: "Cancelada" },
];
const labels: Record<string, string> = { PENDING_PAYMENT: "A aguardar pagamento", PROCESSING: "Em processamento", IN_PREPARATION: "Em preparação", READY_FOR_DELIVERY: "Pronta para entrega", DELIVERED: "Entregue", CANCELLED: "Cancelada" };
const money = (value: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
const date = (value: string) => new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrderList[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<OrderStatusFilter | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
        const response = await customerOrdersApi.getAll({
            page,
            pageSize: 8,
            search,
            status: status === "ALL" ? undefined : status,
        });

        setOrders(response.items);
        setPages(Math.max(1, response.pages));
        setTotal(response.total);
    } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : "Não foi possível carregar as encomendas.",
        );
    } finally {
        setLoading(false);
    }
}, [page, search, status]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);
  function applySearch(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }
  function changeStatus(value: OrderStatusFilter | "ALL") { setStatus(value); setPage(1); }

  return <div className="space-y-6 pb-4">
    <div><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#7B876C]">O seu histórico</p><div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-2xl font-semibold tracking-tight text-[#2F3B2A] sm:text-3xl">As minhas encomendas</h2><p className="mt-2 text-sm leading-6 text-[#7D8377]">Consulte o estado e os detalhes de todas as suas encomendas.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-[#657157] ring-1 ring-[#E8EBE2]"><Package size={14} /> {total} {total === 1 ? "encomenda" : "encomendas"}</span></div></div>

    <section className="rounded-3xl border border-[#E8EBE2] bg-white p-4 sm:p-5">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]"><form onSubmit={applySearch} className="flex gap-2"><div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA091]" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Pesquisar pelo número da encomenda" className="w-full rounded-2xl border border-[#E2E6DC] bg-[#FCFCFA] py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A3A89D] focus:border-[#71805F] focus:ring-4 focus:ring-[#55624A]/10" /></div><button className="rounded-2xl bg-[#55624A] px-4 text-sm font-semibold text-white transition hover:bg-[#394633]">Pesquisar</button></form><select value={status} onChange={(e) => changeStatus(e.target.value as OrderStatusFilter | "ALL")} className="w-full rounded-2xl border border-[#E2E6DC] bg-white px-3 py-3 text-sm text-[#59644F] outline-none focus:border-[#71805F]">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    </section>

    <section className="overflow-hidden rounded-3xl border border-[#E8EBE2] bg-white">
      {loading ? <div className="space-y-3 p-5">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#F5F6F1]" />)}</div> : error ? <div className="p-8 text-center"><p className="text-sm text-[#8C5D4D]">{error}</p><button onClick={() => void loadOrders()} className="mt-3 text-sm font-semibold text-[#55624A] underline">Tentar novamente</button></div> : orders.length === 0 ? <div className="px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F4EB] text-[#55624A]"><ShoppingBag size={23} /></div><h3 className="mt-4 text-base font-semibold text-[#2F3B2A]">Não encontrámos encomendas</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#858A7F]">Experimente alterar a pesquisa ou o filtro. Quando fizer uma encomenda, poderá acompanhá-la aqui.</p><Link href="/products" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#394633]">Explorar flores <ArrowRight size={15} /></Link></div> : <div className="divide-y divide-[#EEF0EA]">{orders.map((order) => <Link key={order.id} href={`/account/orders/${order.id}`} className="group flex flex-col gap-4 px-5 py-5 transition hover:bg-[#FBFCF9] sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4EB] text-[#55624A]"><Package size={19} /></div><div><p className="font-semibold text-[#394633]">Encomenda #{order.orderNumber}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#858A7F]"><CalendarDays size={13} /> Realizada a {date(order.createdAt)}</p></div></div><div className="flex items-center justify-between gap-4 pl-14 sm:pl-0"><div className="sm:text-right"><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${order.status === "DELIVERED" ? "bg-[#EDF5E8] text-[#4D6B3D]" : order.status === "CANCELLED" ? "bg-[#F9EFEB] text-[#965A49]" : "bg-[#F1F4EB] text-[#566449]"}`}>{labels[order.status] ?? order.status}</span><p className="mt-2 text-sm font-semibold text-[#2F3B2A]">{money(order.total)}</p></div><ArrowRight size={17} className="text-[#A1A797] transition group-hover:translate-x-1 group-hover:text-[#55624A]" /></div></Link>)}</div>}
      {!loading && !error && pages > 1 && <div className="flex items-center justify-between border-t border-[#EEF0EA] px-5 py-4 sm:px-6"><p className="text-xs text-[#858A7F]">Página {page} de {pages}</p><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} aria-label="Página anterior" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E6DC] text-[#55624A] transition hover:bg-[#F1F4EB] disabled:opacity-40"><ChevronLeft size={17} /></button><button disabled={page >= pages} onClick={() => setPage((current) => Math.min(pages, current + 1))} aria-label="Página seguinte" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E6DC] text-[#55624A] transition hover:bg-[#F1F4EB] disabled:opacity-40"><ChevronRight size={17} /></button></div></div>}
    </section>
  </div>;
}
