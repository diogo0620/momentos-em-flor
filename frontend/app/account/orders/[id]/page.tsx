
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ordersApi } from "@/lib/api/orders";
import { Order } from "@/types/order";





const statusLabels: Record<string, string> = {
  PROCESSING: "Em processamento",
  PENDING_PAYMENT: "Pagamento pendente",
  IN_PREPARATION: "Em preparação",
  READY_FOR_DELIVERY: "Pronto para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

const statusColors: Record<string, string> = {
  PROCESSING: "bg-[#F0F2EB] text-[#55624A]",
  PENDING_PAYMENT: "bg-[#FFF4DD] text-[#9A6B18]",
  IN_PREPARATION: "bg-[#EEF4EA] text-[#4D6846]",
  READY_FOR_DELIVERY: "bg-[#E8F0E5] text-[#405B39]",
  DELIVERED: "bg-[#E5EFE3] text-[#3F603A]",
  CANCELLED: "bg-[#FBEAEA] text-[#A34B4B]",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        setError(null);

        const response = await ordersApi.getById(orderId);

        setOrder(response.data);
      } catch (err) {
        console.log("erro", err)
        console.error(err);
        setError("Não foi possível carregar a encomenda.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9F5]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />

          <div className="mt-8 h-32 animate-pulse rounded-3xl bg-white" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-[500px] animate-pulse rounded-3xl bg-white" />
            <div className="h-[400px] animate-pulse rounded-3xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#F8F9F5]">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF1E8] text-2xl">
              !
            </div>

            <h1 className="text-2xl font-semibold text-[#2F3B2A]">
              Encomenda não encontrada
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              {error ??
                "Não foi possível encontrar a encomenda que procuras."}
            </p>

            <Link
              href="/account/orders"
              className="mt-6 inline-flex items-center rounded-xl bg-[#2F3B2A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3F4D38]"
            >
              Voltar às encomendas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const showPayButton = order.status === "PENDING_PAYMENT";

  const showInvoiceButton =
    order.status !== "PENDING_PAYMENT" &&
    order.status !== "CANCELLED";

  const statusLabel =
    statusLabels[order.status] ?? "Em processamento";

  const statusColor =
    statusColors[order.status] ?? statusColors.PROCESSING;

  return (
    <main className="min-h-screen bg-[#F8F9F5]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/account/orders"
            className="text-gray-500 transition hover:text-[#2F3B2A]"
          >
            As minhas encomendas
          </Link>

          <span className="text-gray-300">/</span>

          <span className="font-medium text-[#2F3B2A]">
            {order.orderNumber}
          </span>
        </div>

        {/* Header */}
        <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight text-[#2F3B2A] lg:text-3xl">
                  Encomenda #{order.orderNumber}
                </h1>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                <span>
                  Efetuada em {formatDate(order.createdAt)}
                </span>

                <span>
                  Entrega em {formatDate(order.deliveryDate)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {showPayButton && (
                <Link
                  href={`/account/orders/${order.id}/payment`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#2F3B2A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#3F4D38]"
                >
                  Pagar agora
                </Link>
              )}

              {showInvoiceButton && (
                <button
                  type="button"
                  onClick={() => {
                    // TODO: ligar ao endpoint da fatura
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D6DEC8] bg-white px-5 py-3 text-sm font-medium text-[#2F3B2A] transition hover:bg-[#F8F9F5]"
                >
                  Ver fatura
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Products */}
            <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#2F3B2A]">
                  Produtos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "produto" : "produtos"} nesta
                  encomenda
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    {/* Product image */}
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#F3F4EF]">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          Sem imagem
                        </div>
                      )}
                    </div>

                    {/* Product information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-medium text-[#2F3B2A]">
                            {item.name}
                          </h3>

                          {item.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <p className="font-medium text-[#2F3B2A]">
                          {formatCurrency(item.grossAmount)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        <span>
                          Quantidade: {item.quantity}
                        </span>

                        {item.variantName && (
                          <span>
                            {item.variantType}: {item.variantName}
                          </span>
                        )}
                      </div>

                      {/* Components */}
                      {item.components &&
                        item.components.length > 0 && (
                          <div className="mt-3 rounded-xl bg-[#F8F9F5] px-4 py-3">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#55624A]">
                              Composição
                            </p>

                            <div className="space-y-1">
                              {item.components.map((component) => (
                                <div
                                  key={component.componentId}
                                  className="flex justify-between gap-4 text-sm text-gray-600"
                                >
                                  <span>
                                    {component.componentName}
                                  </span>

                                  <span>
                                    x{component.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Delivery */}
            <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-lg font-semibold text-[#2F3B2A]">
                Entrega
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Data de entrega
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2F3B2A]">
                    {formatDate(order.deliveryDate)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Horário
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2F3B2A]">
                    {order.deliveryTimeSlot}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Morada
                  </p>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {order.deliveryStreet}
                    {order.deliveryStreet2 && (
                      <>
                        <br />
                        {order.deliveryStreet2}
                      </>
                    )}
                    <br />
                    {order.deliveryPostalCode} {order.deliveryCity}
                    <br />
                    {order.deliveryDistrict}
                  </p>
                </div>

                {order.deliveryInstructions && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Instruções de entrega
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {order.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Recipient / message */}
            <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-lg font-semibold text-[#2F3B2A]">
                Destinatário
              </h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Nome
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {order.recipientFirstName}{" "}
                    {order.recipientLastName ?? ""}
                  </p>
                </div>

                {order.recipientPhone && (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Telefone
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {order.recipientPhone}
                    </p>
                  </div>
                )}

                {order.cardMessage && (
                  <div className="sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Mensagem do cartão
                    </p>

                    <div className="mt-3 rounded-2xl bg-[#F8F9F5] p-5">
                      <p className="text-sm italic leading-6 text-gray-600">
                        “{order.cardMessage}”
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Summary */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2F3B2A]">
                Resumo
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-[#2F3B2A]">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Entrega
                  </span>

                  <span className="font-medium text-[#2F3B2A]">
                    {formatCurrency(order.deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-gray-500">
                    Impostos
                  </span>

                  <span className="font-medium text-[#2F3B2A]">
                    {formatCurrency(order.taxAmount)}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Desconto
                    </span>

                    <span className="font-medium text-green-700">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium text-[#2F3B2A]">
                      Total
                    </span>

                    <span className="text-xl font-semibold text-[#2F3B2A]">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Status */}
            <section className="rounded-3xl bg-[#EEF1E8] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#55624A]">
                  ✓
                </div>

                <div>
                  <h2 className="font-semibold text-[#2F3B2A]">
                    {statusLabel}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#687261]">
                    {order.status === "PENDING_PAYMENT"
                      ? "A tua encomenda aguarda o pagamento para poder avançar."
                      : order.status === "DELIVERED"
                        ? "A tua encomenda foi entregue."
                        : order.status === "CANCELLED"
                          ? "Esta encomenda foi cancelada."
                          : "Estamos a tratar da tua encomenda. Poderás acompanhar aqui a evolução do estado."}
                  </p>
                </div>
              </div>
            </section>

            {/* Help */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-[#2F3B2A]">
                Precisas de ajuda?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Se tiveres alguma questão sobre esta encomenda, entra em
                contacto connosco.
              </p>

              <button
                type="button"
                className="mt-4 text-sm font-medium text-[#55624A] transition hover:text-[#2F3B2A]"
              >
                Contactar apoio →
              </button>
            </section>
          </aside>
        </div>

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-sm font-medium text-[#55624A] transition hover:text-[#2F3B2A]"
          >
            ← Voltar às encomendas
          </Link>
        </div>
      </div>
    </main>
  );
}
