"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { adminSupportApi } from "@/lib/api/support/support-tickets";
import type { SupportTicket, SupportTicketStatus } from "@/types/support/support-ticket";

const statusLabels: Record<SupportTicketStatus, string> = { OPEN: "Aberto", WAITING_FOR_SUPPORT: "Aguarda suporte", WAITING_FOR_CUSTOMER: "Aguarda cliente", RESOLVED: "Resolvido", CLOSED: "Encerrado" };

export default function AdminSupportDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = () => adminSupportApi.get(id).then(setTicket).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar o caso."));
  useEffect(() => { void load(); }, [id]);
  async function reply(event: FormEvent) { event.preventDefault(); if (!message.trim()) return; try { setSaving(true); setTicket(await adminSupportApi.reply(id, message.trim())); setMessage(""); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível enviar a resposta."); } finally { setSaving(false); } }
  async function changeStatus(status: SupportTicketStatus) { try { setSaving(true); await adminSupportApi.updateStatus(id, status); await load(); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível alterar o estado."); } finally { setSaving(false); } }
  if (!ticket) return <div className="rounded-3xl bg-white p-8 text-sm text-gray-500">{error ?? "A carregar caso…"}</div>;
  return <div className="mx-auto max-w-5xl space-y-6 pb-10"><Link href="/admin/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#55624A]"><ArrowLeft size={16} /> Voltar ao suporte</Link><header className="rounded-3xl bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#819078]">{ticket.reference}</p><h1 className="mt-2 text-2xl font-semibold text-[#2F3B2A]">{ticket.subject}</h1><p className="mt-2 text-sm text-gray-500">{ticket.customer?.firstName} {ticket.customer?.lastName} · {ticket.customer?.email}</p>{ticket.order && <Link href={`/admin/orders/${ticket.order.id}/edit`} className="mt-2 inline-block text-sm font-semibold text-[#55624A] underline">Abrir encomenda {ticket.order.orderNumber}</Link>}</div><label className="text-sm font-semibold text-gray-600">Estado<select disabled={saving} value={ticket.status} onChange={(e) => void changeStatus(e.target.value as SupportTicketStatus)} className="mt-2 block rounded-xl border bg-white px-4 py-2.5">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div></header><section className="space-y-4">{ticket.messages?.map((item) => { const admin = item.author.role === "SYSTEM_ADMIN"; return <article key={item.id} className={`max-w-[88%] rounded-3xl p-5 ${admin ? "ml-auto bg-[#55624A] text-white" : "mr-auto border border-[#E2E7DD] bg-white"}`}><p className="text-xs font-semibold opacity-70">{admin ? "Administração" : `${item.author.firstName} ${item.author.lastName}`} · {new Date(item.createdAt).toLocaleString("pt-PT")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.message}</p></article>; })}</section>{ticket.status !== "CLOSED" && <form onSubmit={reply} className="rounded-3xl bg-white p-6 shadow-sm"><label className="text-sm font-semibold text-[#2F3B2A]">Responder ao cliente<textarea required minLength={2} maxLength={5000} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 font-normal" /></label>{error && <p className="mt-2 text-sm text-red-700">{error}</p>}<button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Send size={16} /> {saving ? "A enviar…" : "Enviar resposta"}</button></form>}</div>;
}
