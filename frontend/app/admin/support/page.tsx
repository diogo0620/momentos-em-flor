"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LifeBuoy, Search } from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import { adminSupportApi } from "@/lib/api/support/support-tickets";
import type { SupportTicket } from "@/types/support/support-ticket";

const statusLabels: Record<string, string> = { OPEN: "Aberto", WAITING_FOR_SUPPORT: "Aguarda suporte", WAITING_FOR_CUSTOMER: "Aguarda cliente", RESOLVED: "Resolvido", CLOSED: "Encerrado" };

export default function AdminSupportPage() {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void adminSupportApi.list({ search, status }).then(setItems).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar os casos.")).finally(() => setLoading(false)); }, [search, status]);
  function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setSearch(searchInput.trim()); }
  return <div className="space-y-6 pb-10"><PageHeader title="Suporte" subtitle="Acompanha e responde aos casos abertos pelos clientes." /><form onSubmit={submit} className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[1fr_240px_auto]"><label className="relative"><Search className="absolute left-4 top-3.5 text-gray-400" size={18} /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Referência, assunto, cliente ou email" className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm" /></label><select value={status} onChange={(e) => { setLoading(true); setStatus(e.target.value); }} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm"><option value="">Todos os estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white">Pesquisar</button></form>{error && <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<section className="overflow-hidden rounded-3xl bg-white shadow-sm">{loading ? <p className="p-10 text-center text-sm text-gray-400">A carregar casos…</p> : items.length === 0 ? <div className="p-12 text-center"><LifeBuoy className="mx-auto text-[#71805F]" /><h2 className="mt-4 font-semibold">Nenhum caso encontrado</h2></div> : <div className="divide-y divide-gray-100">{items.map((ticket) => <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="grid gap-3 p-5 transition hover:bg-[#FAFBF8] sm:grid-cols-[1fr_220px_170px_auto] sm:items-center"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#819078]">{ticket.reference}</p><h2 className="mt-1 font-semibold text-[#2F3B2A]">{ticket.subject}</h2><p className="mt-1 text-xs text-gray-400">{ticket._count?.messages ?? 0} mensagens · {new Date(ticket.updatedAt).toLocaleString("pt-PT")}</p></div><div className="text-sm"><p className="font-medium">{ticket.customer?.firstName} {ticket.customer?.lastName}</p><p className="text-xs text-gray-400">{ticket.customer?.email}</p></div><span className="w-fit rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-semibold text-[#55624A]">{statusLabels[ticket.status]}</span><ArrowUpRight size={17} /></Link>)}</div>}</section></div>;
}
