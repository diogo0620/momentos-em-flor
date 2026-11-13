"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Save,
} from "lucide-react";
import { apiFetch } from "@/lib/api/common/client";
import { adminMoloniFiscalDocumentsApi } from "@/lib/api/moloni/admin-moloni-fiscal-documents";
import type {
  MoloniDocumentStatus,
  MoloniFiscalDocument,
} from "@/types/moloni/admin/moloni-fiscal-document";

type Mapping = {
  localId: number;
  name: string;
  moloniId: string | null;
  rate?: number;
};

type IntegrationContext = {
  fiscalDocumentId: number;
  orderNumber: string;
  lastError: string | null;
  customer: Mapping | null;
  products: Mapping[];
  taxes: Mapping[];
};

const statusLabels: Record<MoloniDocumentStatus, string> = {
  QUEUED: "Por emitir",
  PROCESSING: "A processar",
  DRAFT: "Rascunho",
  ISSUED: "Emitido",
  FAILED: "Falhou",
  NOT_REQUIRED: "Não necessário",
};

const statusStyles: Record<MoloniDocumentStatus, string> = {
  QUEUED: "bg-amber-50 text-amber-800",
  PROCESSING: "bg-blue-50 text-blue-700",
  DRAFT: "bg-violet-50 text-violet-700",
  ISSUED: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  NOT_REQUIRED: "bg-gray-100 text-gray-600",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProcessCard({
  title,
  status,
  moloniId,
  date,
  pdfUrl,
  emailSentAt,
  emailError,
  actions,
}: {
  title: string;
  status: MoloniDocumentStatus;
  moloniId: string | null;
  date: string | null;
  pdfUrl: string | null;
  emailSentAt: string | null;
  emailError: string | null;
  actions: ReactNode;
}) {
  const created = Boolean(moloniId);
  const issued = status === "ISSUED";
  const pdfReady = Boolean(pdfUrl);
  const emailSent = Boolean(emailSentAt);
  const complete = created && issued && pdfReady && emailSent;
  const steps = [
    { label: "Documento criado no Moloni", done: created, detail: moloniId ? `ID ${moloniId}` : "Ainda não criado" },
    { label: "Documento confirmado", done: issued, detail: issued ? formatDate(date) : status === "DRAFT" ? "Aguarda confirmação" : statusLabels[status] },
    { label: "PDF disponível", done: pdfReady, detail: pdfReady ? "Ligação obtida" : issued ? "Por obter" : "Disponível após confirmação" },
    { label: "Email enviado ao cliente", done: emailSent, detail: emailSent ? formatDate(emailSentAt) : issued ? "Pendente" : "Disponível após confirmação" },
  ];
  return (
    <article className="border border-[#E2E7DF] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-[#26392F]">{title}</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${complete ? "bg-green-100 text-green-800" : statusStyles[status]}`}
        >
          {complete ? "Processo concluído" : statusLabels[status]}
        </span>
      </div>
      <ol className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <li key={step.label} className="flex gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step.done ? "bg-[#40513C] text-white" : "bg-[#EEF1EA] text-[#778077]"}`}>{step.done ? "✓" : index + 1}</span>
            <div><p className="text-sm font-semibold text-[#26392F]">{step.label}</p><p className="mt-0.5 text-xs text-[#778077]">{step.detail}</p></div>
          </li>
        ))}
      </ol>
      {emailError && <p className="mt-4 border-l-2 border-amber-500 pl-3 text-xs leading-5 text-amber-800">{emailError}</p>}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-[#E8ECE5] pt-5">{actions}</div>
    </article>
  );
}

function MappingRow({
  type,
  item,
  onSaved,
}: {
  type: "customer" | "product" | "tax";
  item: Mapping;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(item.moloniId ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await apiFetch("/admin/moloni/mappings", {
        method: "PUT",
        body: JSON.stringify({
          type,
          localId: item.localId,
          moloniId: Number(value),
        }),
      });
      setMessage("Associação validada e guardada.");
      onSaved();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Não foi possível guardar.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 border-t border-[#E2E7DF] py-4 first:border-t-0 sm:grid-cols-[minmax(0,1fr)_180px_auto] sm:items-end"
    >
      <div>
        <p className="text-sm font-semibold text-[#26392F]">{item.name}</p>
        <p className="mt-1 text-xs text-[#778077]">
          ID local {item.localId}
          {item.rate !== undefined ? ` · IVA ${item.rate}%` : ""}
        </p>
      </div>
      <label className="text-xs font-medium text-[#657456]">
        ID Moloni
        <input
          required
          min="1"
          step="1"
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="mt-1 w-full rounded-lg border border-[#D8DED1] px-3 py-2.5 text-sm outline-none focus:border-[#55624A]"
        />
      </label>
      <button
        disabled={saving}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#40513C] px-4 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Save size={15} />
        )}
        Guardar
      </button>
      {message && (
        <p
          role="status"
          className={`text-xs sm:col-span-3 ${message.includes("guardada") ? "text-green-700" : "text-red-700"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

export default function FiscalDocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [refresh, setRefresh] = useState(0);
  const [document, setDocument] = useState<MoloniFiscalDocument | null>(null);
  const [context, setContext] = useState<IntegrationContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminMoloniFiscalDocumentsApi.getDetail(id),
      adminMoloniFiscalDocumentsApi.getRepairContext<IntegrationContext>(id),
    ])
      .then(([detail, integration]) => {
        if (cancelled) return;
        setDocument(detail);
        setContext(integration);
        setError("");
      })
      .catch((loadError) => {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o documento fiscal.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, refresh]);

  function reload() {
    setRefresh((value) => value + 1);
  }

  async function issue() {
    if (!document) return;
    const confirmed = window.confirm(
      "Confirmas a criação da fatura no Moloni? O estado inicial respeita a configuração de rascunho.",
    );
    if (!confirmed) return;
    setAction("issue");
    setError("");
    setSuccess("");
    try {
      await adminMoloniFiscalDocumentsApi.issue(id);
      setSuccess("A integração foi processada com sucesso.");
      reload();
    } catch (issueError) {
      setError(
        issueError instanceof Error
          ? issueError.message
          : "A integração voltou a falhar.",
      );
      reload();
    } finally {
      setAction(null);
    }
  }

  async function issueCreditNote() {
    if (!document) return;
    if (!window.confirm("Confirmas a emissão da nota de crédito na Moloni?"))
      return;
    setAction("credit-note");
    setError("");
    try {
      await adminMoloniFiscalDocumentsApi.issueCreditNote(id);
      setSuccess("A nota de crédito foi processada com sucesso.");
      reload();
    } catch (creditError) {
      setError(
        creditError instanceof Error
          ? creditError.message
          : "Não foi possível emitir a nota de crédito.",
      );
      reload();
    } finally {
      setAction(null);
    }
  }

  async function confirmDocument(kind: "invoice" | "credit-note") {
    if (!window.confirm(`Confirmas o fecho ${kind === "invoice" ? "da fatura" : "da nota de crédito"} no Moloni? Depois desta ação o documento deixa de ser rascunho.`)) return;
    setAction(`confirm-${kind}`);
    setError("");
    try {
      if (kind === "invoice") await adminMoloniFiscalDocumentsApi.confirmInvoice(id);
      else await adminMoloniFiscalDocumentsApi.confirmCreditNote(id);
      setSuccess("Documento confirmado no Moloni. O PDF e o email estão agora a ser processados.");
      reload();
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Não foi possível confirmar o documento.");
      reload();
    } finally { setAction(null); }
  }

  async function sendEmail(kind: "invoice" | "credit-note") {
    setAction(`email-${kind}`);
    setError("");
    try {
      if (kind === "invoice") await adminMoloniFiscalDocumentsApi.sendInvoiceEmail(id);
      else await adminMoloniFiscalDocumentsApi.sendCreditNoteEmail(id);
      setSuccess("Email enviado ao cliente.");
      reload();
    } catch (emailError) {
      setError(emailError instanceof Error ? emailError.message : "Não foi possível enviar o email.");
      reload();
    } finally { setAction(null); }
  }

  async function openPdf(kind: "invoice" | "credit-note") {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      setError(
        "O navegador bloqueou a nova janela. Permite pop-ups para abrir o PDF.",
      );
      return;
    }
    popup.opener = null;
    setAction(`pdf-${kind}`);
    try {
      const blob = await adminMoloniFiscalDocumentsApi.getPdf(id, kind);
      const objectUrl = URL.createObjectURL(blob);
      popup.location.replace(objectUrl);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (pdfError) {
      const refreshedDocument = await adminMoloniFiscalDocumentsApi.getDetail(id).catch(() => null);
      if (refreshedDocument) setDocument(refreshedDocument);
      const fallbackUrl =
        kind === "invoice"
          ? refreshedDocument?.invoicePdfUrl ?? document?.invoicePdfUrl
          : refreshedDocument?.creditNotePdfUrl ?? document?.creditNotePdfUrl;

      if (fallbackUrl) {
        popup.location.replace(fallbackUrl);
        setSuccess(
          "O download pelo servidor falhou; foi aberta a ligação guardada da Moloni.",
        );
      } else {
        popup.close();
        setError(
          pdfError instanceof Error
            ? pdfError.message
            : "Não foi possível abrir o PDF.",
        );
      }
    } finally {
      setAction(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl bg-white">
        <Loader2 className="animate-spin text-[#55624A]" />
      </div>
    );
  }

  if (!document || !context) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error || "Documento fiscal não encontrado."}
      </div>
    );
  }

  const failed =
    document.invoiceStatus === "FAILED" ||
    document.creditNoteStatus === "FAILED";

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <Link
        href="/admin/fiscal-documents"
        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#657456]"
      >
        <ArrowLeft size={16} /> Voltar à faturação
      </Link>

      <header className="flex flex-col gap-5 border-b border-[#DDE2D8] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#7A876F]">
            Documento fiscal #{document.id}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#26392F] sm:text-4xl">
            Encomenda {document.orderNumber}
          </h1>
          <p className="mt-3 text-sm text-[#687363]">
            Criado em {formatDate(document.createdAt)} · {document.attempts}{" "}
            tentativa{document.attempts === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/orders/${document.orderId}/edit`}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#CBD3C3] px-4 text-sm font-semibold text-[#40513C]"
          >
            Ver encomenda <ExternalLink size={15} />
          </Link>
          {!["ISSUED", "DRAFT"].includes(document.invoiceStatus) && (
            <button
              type="button"
              onClick={() => void issue()}
              disabled={action !== null || document.invoiceStatus === "PROCESSING"}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#40513C] px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {action === "issue" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {failed ? "Tentar integração novamente" : "Emitir na Moloni"}
            </button>
          )}
        </div>
      </header>

      {success && (
        <div
          role="status"
          className="flex gap-3 border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={18} className="shrink-0" /> {success}
        </div>
      )}
      {(error || context.lastError) && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 p-5 text-sm text-red-800"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Último erro da integração</p>
              <p className="mt-2 whitespace-pre-wrap leading-6">
                {error || context.lastError}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <ProcessCard
          title="Fatura"
          status={document.invoiceStatus}
          moloniId={document.invoiceId}
          date={document.invoiceIssuedAt}
          pdfUrl={document.invoicePdfUrl}
          emailSentAt={document.invoiceEmailSentAt}
          emailError={document.invoiceEmailLastError}
          actions={<>
            {!document.invoiceId && <button onClick={() => void issue()} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#40513C] px-4 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} /> Criar fatura</button>}
            {document.invoiceStatus === "DRAFT" && <button onClick={() => void confirmDocument("invoice")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={15} /> Confirmar rascunho</button>}
            {document.invoiceStatus === "ISSUED" && <button onClick={() => void openPdf("invoice")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD3C3] px-4 text-sm font-semibold text-[#40513C] disabled:opacity-50"><FileText size={15} /> Abrir PDF</button>}
            {document.invoiceStatus === "ISSUED" && <button onClick={() => void sendEmail("invoice")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD3C3] px-4 text-sm font-semibold text-[#40513C] disabled:opacity-50"><Mail size={15} /> {document.invoiceEmailSentAt ? "Reenviar email" : "Enviar email"}</button>}
            {document.invoiceId && <a href="https://www.moloni.pt/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 px-2 text-sm font-semibold text-[#40513C]">Abrir Moloni <ExternalLink size={14} /></a>}
          </>}
        />
        <ProcessCard
          title="Nota de crédito"
          status={document.creditNoteStatus}
          moloniId={document.creditNoteId}
          date={document.creditNoteRecordedAt}
          pdfUrl={document.creditNotePdfUrl}
          emailSentAt={document.creditNoteEmailSentAt}
          emailError={document.creditNoteEmailLastError}
          actions={<>
            {document.creditNoteRequiredAt && !document.creditNoteId && <button onClick={() => void issueCreditNote()} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} /> Criar nota de crédito</button>}
            {document.creditNoteStatus === "DRAFT" && <button onClick={() => void confirmDocument("credit-note")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 size={15} /> Confirmar rascunho</button>}
            {document.creditNoteStatus === "ISSUED" && <button onClick={() => void openPdf("credit-note")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD3C3] px-4 text-sm font-semibold text-[#40513C] disabled:opacity-50"><FileText size={15} /> Abrir PDF</button>}
            {document.creditNoteStatus === "ISSUED" && <button onClick={() => void sendEmail("credit-note")} disabled={action !== null} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CBD3C3] px-4 text-sm font-semibold text-[#40513C] disabled:opacity-50"><Mail size={15} /> {document.creditNoteEmailSentAt ? "Reenviar email" : "Enviar email"}</button>}
            {document.creditNoteId && <a href="https://www.moloni.pt/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 px-2 text-sm font-semibold text-[#40513C]">Abrir Moloni <ExternalLink size={14} /></a>}
            {!document.creditNoteRequiredAt && <span className="text-sm text-[#778077]">Não é necessária para esta encomenda.</span>}
          </>}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <article className="border border-[#E2E7DF] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#26392F]">
            Dados da integração
          </h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[#778077]">Última tentativa</dt>
              <dd className="mt-1 font-medium">
                {formatDate(document.lastAttemptAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[#778077]">Última atualização</dt>
              <dd className="mt-1 font-medium">
                {formatDate(document.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[#778077]">Email da fatura</dt>
              <dd className="mt-1 font-medium">
                {document.invoiceEmailSentAt
                  ? `Enviado em ${formatDate(document.invoiceEmailSentAt)}`
                  : "Ainda não enviado"}
              </dd>
            </div>
            <div>
              <dt className="text-[#778077]">ID do email</dt>
              <dd className="mt-1 font-medium">
                {document.invoiceEmailId ?? "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[#778077]">Ligação da fatura</dt>
              <dd className="mt-1">
                {document.invoicePdfUrl ? (
                  <a
                    href={document.invoicePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 break-all font-medium text-[#40513C] underline underline-offset-4"
                  >
                    Abrir ligação guardada <ExternalLink size={14} />
                  </a>
                ) : (
                  <span className="font-medium">Ainda não obtida</span>
                )}
                {document.invoicePdfUrlUpdatedAt && (
                  <span className="mt-1 block text-xs text-[#778077]">
                    Atualizada em {formatDate(document.invoicePdfUrlUpdatedAt)}
                  </span>
                )}
              </dd>
            </div>
          </dl>
          {document.invoiceEmailLastError && (
            <p className="mt-5 border-l-2 border-amber-500 pl-4 text-sm leading-6 text-amber-800">
              Erro no envio do email: {document.invoiceEmailLastError}
            </p>
          )}
        </article>
        <article className="border border-[#E2E7DF] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#26392F]">Cliente</h2>
          <p className="mt-4 font-semibold">{document.customerName}</p>
          <p className="mt-1 text-sm text-[#687363]">
            {document.customerEmail}
          </p>
          <p className="mt-1 text-sm text-[#687363]">
            NIF: {document.customerTaxNumber || "Não indicado"}
          </p>
          {document.customerId && (
            <Link
              href={`/admin/users/${document.customerId}/edit`}
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#40513C] underline underline-offset-4"
            >
              Abrir cliente <ExternalLink size={14} />
            </Link>
          )}
        </article>
      </section>

      <section className="border border-[#E2E7DF] bg-white p-5 sm:p-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#7A876F]">
            Associações desta fatura
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#26392F]">
            Mapeamentos Moloni
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#687363]">
            O cliente e os produtos são criados automaticamente quando ainda não
            existem. Se a criação falhar, associa aqui o ID correto. Os códigos
            de IVA são sempre mapeados manualmente.
          </p>
        </div>

        {context.customer && (
          <div className="mt-7">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[.1em] text-[#657456]">
              Cliente
            </h3>
            <MappingRow
              key={`customer-${context.customer.moloniId}`}
              type="customer"
              item={context.customer}
              onSaved={reload}
            />
          </div>
        )}
        <div className="mt-7">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[.1em] text-[#657456]">
            Produtos
          </h3>
          {context.products.map((item) => (
            <MappingRow
              key={`product-${item.localId}-${item.moloniId}`}
              type="product"
              item={item}
              onSaved={reload}
            />
          ))}
          {context.products.length === 0 && (
            <p className="py-4 text-sm text-[#778077]">
              Esta fatura não tem produtos de catálogo associados.
            </p>
          )}
        </div>
        <div className="mt-7">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[.1em] text-[#657456]">
            Códigos de IVA
          </h3>
          {context.taxes.map((item) => (
            <MappingRow
              key={`tax-${item.localId}-${item.moloniId}`}
              type="tax"
              item={item}
              onSaved={reload}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
