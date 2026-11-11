"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import { adminMoloniFiscalDocumentsApi } from "@/lib/api/moloni/admin-moloni-fiscal-documents";
import type {
  MoloniDocumentStatus,
  MoloniFiscalDocument,
} from "@/types/moloni/admin/moloni-fiscal-document";

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<MoloniDocumentStatus, string> = {
  QUEUED: "Por emitir",
  PROCESSING: "A processar",
  ISSUED: "Emitida",
  FAILED: "Falhou",
  NOT_REQUIRED: "Não necessário",
};

const STATUS_STYLES: Record<MoloniDocumentStatus, string> = {
  QUEUED: "bg-amber-50 text-amber-800",
  PROCESSING: "bg-blue-50 text-blue-700",
  ISSUED: "bg-green-50 text-green-700",
  FAILED: "bg-red-50 text-red-700",
  NOT_REQUIRED: "bg-gray-100 text-gray-600",
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(
    value,
  );
}

export default function FiscalDocumentsPage() {
  const [items, setItems] = useState<MoloniFiscalDocument[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    (requestedPage = 1) =>
      adminMoloniFiscalDocumentsApi.getAll({
          page: requestedPage,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
          order: "desc",
      }),
    [search, status],
  );

  useEffect(() => {
    let cancelled = false;
    void fetchDocuments(1)
      .then((response) => {
        if (cancelled) return;
        setError(null);
        setItems(response.items);
        setPage(response.page);
        setPages(response.pages);
        setTotal(response.total);
      })
      .catch((loadError) => {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os documentos fiscais.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchDocuments]);

  async function load(requestedPage: number) {
    try {
      const response = await fetchDocuments(requestedPage);
      setError(null);
      setItems(response.items);
      setPage(response.page);
      setPages(response.pages);
      setTotal(response.total);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os documentos fiscais.",
      );
    } finally {
      setLoading(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setLoading(true);
    if (nextSearch === search) void load(1);
    else setSearch(nextSearch);
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Faturação Moloni"
        subtitle="Emite faturas de encomendas pagas e acompanha falhas sem duplicar documentos."
      />

      <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
          onSubmit={submitSearch}
        >
          <label className="relative">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Encomenda ou email"
              className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-[#55624A]"
            />
          </label>
          <select
            value={status}
            onChange={(event) => {
              setLoading(true);
              setStatus(event.target.value);
            }}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#55624A]"
          >
            <option value="">Todos os estados</option>
            {(
              [
                "QUEUED",
                "PROCESSING",
                "ISSUED",
                "FAILED",
              ] as MoloniDocumentStatus[]
            ).map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          <button className="rounded-2xl bg-[#55624A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#46523D]">
            Pesquisar
          </button>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-[#FAFBF8] text-[#55624A]">
              <tr>
                <th className="px-6 py-4">Encomenda</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Fatura</th>
                <th className="px-6 py-4">Recibo</th>
                <th className="px-6 py-4">Último resultado</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    <Loader2 className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <FileText className="mx-auto mb-3 text-[#7A8A6B]" />
                    Ainda não existem encomendas pagas por faturar.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-5 font-semibold text-[#2F3B2A]">
                      <Link
                        href={`/admin/orders/${item.orderId}/edit`}
                        className="hover:underline"
                      >
                        {item.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      {item.customerId ? (
                        <Link
                          href={`/admin/users/${item.customerId}/edit`}
                          className="inline-flex items-center gap-1.5 font-medium text-gray-700 hover:underline"
                        >
                          {item.customerName} <ExternalLink size={13} />
                        </Link>
                      ) : (
                        <p className="font-medium text-gray-700">
                          {item.customerName}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {item.customerTaxNumber || item.customerEmail}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-semibold text-[#2F3B2A]">
                      {formatCurrency(item.total, item.currency)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[item.invoiceStatus]}`}
                      >
                        {STATUS_LABELS[item.invoiceStatus]}
                      </span>
                      {item.invoiceId && (
                        <p className="mt-2 text-xs text-gray-400">
                          ID {item.invoiceId}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[item.receiptStatus]}`}
                      >
                        {STATUS_LABELS[item.receiptStatus]}
                      </span>
                      {item.receiptId && (
                        <p className="mt-2 text-xs text-gray-400">
                          ID {item.receiptId}
                        </p>
                      )}
                    </td>
                    <td className="max-w-xs px-6 py-5 text-xs text-gray-500">
                      {item.creditNoteRequiredAt && !item.creditNoteId ? (
                        <span className="font-semibold text-amber-700">
                          Nota de crédito pendente após reembolso
                        </span>
                      ) : item.creditNoteId ? (
                        `Nota de crédito Moloni ID ${item.creditNoteId}`
                      ) : item.lastError ? (
                        <span className="font-semibold text-red-700">
                          {item.lastError}
                        </span>
                      ) : item.invoiceEmailSentAt ? (
                        "Fatura emitida e enviada por email"
                      ) : (
                        item.invoiceEmailLastError ||
                        (item.invoiceStatus === "ISSUED"
                          ? "Fatura emitida; envio de email pendente"
                          : "Aguarda emissão")
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/fiscal-documents/${item.id}`}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#CBD3C3] px-4 py-2 text-xs font-semibold text-[#40513C] transition hover:bg-[#F3F5EE]"
                        >
                          Ver detalhe <ArrowRight size={15} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
          <span>{total} documentos</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                void load(page - 1);
              }}
              disabled={page <= 1 || loading}
              className="rounded-xl border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>
            <span>
              {page} / {Math.max(pages, 1)}
            </span>
            <button
              onClick={() => {
                setLoading(true);
                void load(page + 1);
              }}
              disabled={page >= pages || loading}
              className="rounded-xl border border-gray-200 p-2 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
