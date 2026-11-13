"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LifeBuoy, Plus, X } from "lucide-react";
import { customerSupportApi } from "@/lib/api/support/support-tickets";
import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import type { CustomerOrderList } from "@/types/orders/customer/customer-order-list";
import type { SupportTicket, SupportTicketCategory } from "@/types/support/support-ticket";

const categoryLabels: Record<SupportTicketCategory, string> = { ORDER: "Encomenda", PAYMENT: "Pagamento", DELIVERY: "Entrega", PRODUCT: "Produto", ACCOUNT: "Conta", OTHER: "Outro" };
const statusLabels: Record<string, string> = { OPEN: "Aberto", WAITING_FOR_SUPPORT: "Aguarda resposta", WAITING_FOR_CUSTOMER: "Aguarda a sua resposta", RESOLVED: "Resolvido", CLOSED: "Encerrado" };

export default function CustomerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<CustomerOrderList[]>([]);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("ORDER");
  const [orderId, setOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => customerSupportApi.list().then(setTickets).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar os casos.")).finally(() => setLoading(false));
  useEffect(() => { void load(); void customerOrdersApi.getAll({ page: 1, pageSize: 100, sort: "createdAt", order: "desc" }).then((result) => setOrders(result.items)).catch(() => undefined); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setSaving(true); setError(null);
      await customerSupportApi.create({ subject: subject.trim(), category, message: message.trim(), ...(orderId ? { orderId: Number(orderId) } : {}) });
      setSubject(""); setMessage(""); setOrderId(""); setOpen(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível abrir o caso."); }
    finally { setSaving(false); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#7d897f]">Atendimento</p><h2 className="mt-2 text-3xl font-semibold text-[#203128]">Suporte</h2><p className="mt-2 text-sm text-[#6d776f]">Abra um caso e acompanhe toda a conversa num só lugar.</p></div><button onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#304b39] px-5 text-sm font-semibold text-white"><Plus size={17} /> Novo caso</button></div>
    {error && <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-3xl border border-[#e1e5df] bg-white">
      {loading ? <p className="p-8 text-sm text-[#7b857d]">A carregar casos…</p> : tickets.length === 0 ? <div className="p-10 text-center"><LifeBuoy className="mx-auto text-[#71805f]" /><h3 className="mt-4 font-semibold text-[#203128]">Ainda não tem casos de suporte</h3><p className="mt-2 text-sm text-[#7b857d]">Quando precisar de ajuda, a conversa ficará registada aqui.</p></div> : <div className="divide-y divide-[#edf0ec]">{tickets.map((ticket) => <Link key={ticket.id} href={`/account/support/${ticket.id}`} className="flex items-center justify-between gap-4 p-5 transition hover:bg-[#f8faf7]"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#829087]">{ticket.reference} · {categoryLabels[ticket.category]}</p><h3 className="mt-1 font-semibold text-[#203128]">{ticket.subject}</h3><p className="mt-1 text-xs text-[#7b857d]">Atualizado em {new Date(ticket.updatedAt).toLocaleDateString("pt-PT")} · {ticket._count?.messages ?? 0} mensagens</p></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-[#eef3eb] px-3 py-1 text-xs font-semibold text-[#46604d] sm:inline">{statusLabels[ticket.status]}</span><ArrowUpRight size={17} /></div></Link>)}</div>}
    </section>
    {open && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><form onSubmit={submit} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-[#203128]">Abrir caso de suporte</h2><p className="mt-1 text-sm text-[#7b857d]">Explique o que aconteceu com o máximo de contexto possível.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-gray-100"><X size={18} /></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium">Assunto<input required minLength={3} maxLength={160} value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Categoria<select value={category} onChange={(e) => setCategory(e.target.value as SupportTicketCategory)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="block text-sm font-medium">Encomenda (opcional)<select value={orderId} onChange={(e) => setOrderId(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-4 py-3"><option value="">Sem encomenda</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber}</option>)}</select></label></div><label className="block text-sm font-medium">Mensagem<textarea required minLength={2} maxLength={5000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div><button disabled={saving} className="mt-6 w-full rounded-full bg-[#304b39] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "A abrir…" : "Abrir caso"}</button></form></div>}
  </div>;
}
