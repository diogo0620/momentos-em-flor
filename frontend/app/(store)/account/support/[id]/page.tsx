"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { customerSupportApi } from "@/lib/api/support/support-tickets";
import type { SupportTicket } from "@/types/support/support-ticket";

const statusLabels: Record<string, string> = { OPEN: "Aberto", WAITING_FOR_SUPPORT: "Aguarda resposta", WAITING_FOR_CUSTOMER: "Aguarda a sua resposta", RESOLVED: "Resolvido", CLOSED: "Encerrado" };

export default function CustomerSupportDetailPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void customerSupportApi.get(id).then(setTicket).catch((err) => setError(err instanceof Error ? err.message : "Não foi possível carregar o caso.")); }, [id]);
  async function reply(event: FormEvent) { event.preventDefault(); if (!message.trim()) return; try { setSaving(true); const updated = await customerSupportApi.reply(id, message.trim()); setTicket(updated); setMessage(""); } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem."); } finally { setSaving(false); } }
  if (!ticket) return <div className="rounded-3xl bg-white p-8 text-sm text-[#6d776f]">{error ?? "A carregar caso…"}</div>;
  return <div className="space-y-5"><Link href="/account/support" className="inline-flex items-center gap-2 text-sm font-semibold text-[#46604d]"><ArrowLeft size={16} /> Voltar ao suporte</Link><header className="rounded-3xl border border-[#e1e5df] bg-white p-6"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[#829087]">{ticket.reference}</p><h2 className="mt-2 text-2xl font-semibold text-[#203128]">{ticket.subject}</h2>{ticket.order && <Link href={`/account/orders/${encodeURIComponent(ticket.order.orderNumber)}`} className="mt-2 inline-block text-sm font-semibold text-[#46604d] underline">Encomenda {ticket.order.orderNumber}</Link>}</div><span className="h-fit rounded-full bg-[#eef3eb] px-3 py-1.5 text-xs font-semibold text-[#46604d]">{statusLabels[ticket.status]}</span></div></header><section className="space-y-4">{ticket.messages?.map((item) => { const admin = item.author.role === "SYSTEM_ADMIN"; return <article key={item.id} className={`max-w-[88%] rounded-3xl p-5 ${admin ? "mr-auto border border-[#dfe5dc] bg-white" : "ml-auto bg-[#304b39] text-white"}`}><p className="text-xs font-semibold opacity-70">{admin ? "Momentos em Flor" : "Você"} · {new Date(item.createdAt).toLocaleString("pt-PT")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.message}</p></article>; })}</section>{ticket.status !== "CLOSED" && <form onSubmit={reply} className="rounded-3xl border border-[#e1e5df] bg-white p-5"><label className="text-sm font-semibold text-[#203128]">Responder<textarea required minLength={2} maxLength={5000} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 w-full rounded-2xl border px-4 py-3 font-normal" /></label>{error && <p className="mt-2 text-sm text-red-700">{error}</p>}<button disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#304b39] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Send size={16} /> {saving ? "A enviar…" : "Enviar resposta"}</button></form>}</div>;
}
