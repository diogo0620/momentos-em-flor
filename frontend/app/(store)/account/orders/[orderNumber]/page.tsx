
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  MessageSquareText,
  Package,
  Phone,
  UserRound,
  XCircle,
  Star,
} from "lucide-react";

import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import { CustomerOrderDetail } from "@/types/orders/customer/customer-order-detail";

const labels: Record<string, string> = {
  PENDING_PAYMENT: "A aguardar pagamento",
  CREATED: "Criada",
  WAITING_FOR_FLORISTS: "À espera de floristas",
  ASSIGNED: "Florista atribuída",
  IN_PRODUCTION: "Em preparação",
  PROCESSING: "Em processamento",
  IN_PREPARATION: "Em preparação",
  READY_FOR_DELIVERY: "Pronta para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

const money = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const date = (value: string | Date) =>
  new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const timeLabels: Record<string, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  EVENING: "Final do dia",
};

export default function AccountOrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = decodeURIComponent(params.orderNumber);

  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewRatings, setReviewRatings] = useState({ flowerQuality: 0, presentation: 0, delivery: 0, service: 0 });
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await customerOrdersApi.getByOrderNumber(orderNumber);

        if (active) {
          setOrder(response);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar esta encomenda.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (!orderNumber) {
      setError("O número da encomenda não é válido.");
      setLoading(false);
      return;
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-3xl bg-white"
          />
        ))}
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-3xl border border-[#E8EBE2] bg-white p-8 text-center">
        <Package size={28} className="mx-auto text-[#71805F]" />

        <h2 className="mt-4 text-lg font-semibold text-[#2F3B2A]">
          Não foi possível abrir a encomenda
        </h2>

        <p className="mt-2 text-sm text-[#858A7F]">
          {error ?? "A encomenda não foi encontrada."}
        </p>

        <Link
          href="/account/orders"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#55624A] hover:underline"
        >
          <ArrowLeft size={15} />
          Voltar às encomendas
        </Link>
      </div>
    );
  }

  const address = [
    order.deliveryStreet,
    order.deliveryStreet2,
    `${order.deliveryPostalCode} ${order.deliveryCity}`,
    order.deliveryDistrict,
    order.deliveryCountryCode,
  ]
    .filter(Boolean)
    .join(", ");

  const fullRecipient = [
    order.recipientFirstName,
    order.recipientLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const isPendingPayment = order.status === "PENDING_PAYMENT";

  async function handleCancelPendingPayment() {
    if (
      !window.confirm(
        "Pretende cancelar esta encomenda? Depois de cancelada, não poderá retomar o pagamento.",
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError(null);
      await customerOrdersApi.cancelPendingPayment(order.orderNumber);
      setOrder({
        ...order,
        status: "CANCELLED",
        cancelledAt: new Date().toISOString(),
        cancellationReason: "CUSTOMER_REQUEST",
      });
    } catch (err) {
      setCancelError(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar a encomenda.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  const totalQuantity = (order.items ?? []).reduce(
    (sum, item) => sum + (item.type === "PRODUCT" ? item.quantity : 0),
    0,
  );

  async function handleReviewSubmit() {
    if (Object.values(reviewRatings).some((rating) => rating < 1)) {
      setReviewError("Avalia todas as categorias antes de enviar.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      setReviewError(null);
      const review = await customerOrdersApi.createReview(order.orderNumber, {
        ...reviewRatings,
        comment: reviewComment.trim() || undefined,
      });
      setOrder({ ...order, review });
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Não foi possível guardar a avaliação.");
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <div className="space-y-6 pb-4">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#667557] transition hover:text-[#2F3B2A]"
      >
        <ArrowLeft size={16} />
        Voltar às encomendas
      </Link>

      {/* Cabeçalho da encomenda */}
      <section className="overflow-hidden rounded-3xl border border-[#E8EBE2] bg-white">
        <div className="bg-[#F1F4EB] p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B876C]">
                Detalhes da encomenda
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2F3B2A] sm:text-3xl">
                #{order.orderNumber}
              </h2>

              <p className="mt-2 text-sm text-[#73796D]">
                Realizada a {date(order.createdAt)}
              </p>

              <span
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold ${order.status === "DELIVERED"
                    ? "bg-[#E2EED9] text-[#4D6B3D]"
                    : order.status === "CANCELLED"
                      ? "bg-[#F9E9E4] text-[#965A49]"
                      : isPendingPayment
                        ? "bg-[#FFF0D5] text-[#94651C]"
                        : "bg-white text-[#566449]"
                  }`}
              >
                {order.status === "DELIVERED" ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <Clock3 size={14} />
                )}

                {labels[order.status] ?? order.status}
              </span>
            </div>

            {isPendingPayment && (
              <div className="flex flex-col gap-2 sm:items-end">
                <Link
                  href={`/checkout/payment/${order.orderNumber}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#394633]"
                >
                  <CreditCard size={17} />
                  Pagar
                </Link>
                <button
                  type="button"
                  onClick={() => void handleCancelPendingPayment()}
                  disabled={isCancelling}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-[#965A49] transition hover:bg-[#F9E9E4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle size={16} />
                  {isCancelling ? "A cancelar..." : "Cancelar encomenda"}
                </button>
              </div>
            )}
          </div>

          {isPendingPayment && (
            <div className="mt-5 rounded-2xl border border-[#E9DDBD] bg-[#FFF9EC] p-4">
              <p className="text-sm font-semibold text-[#805B20]">
                Falta concluir o pagamento
              </p>
              <p className="mt-1 text-sm leading-5 text-[#8B754F]">
                Para podermos processar a sua encomenda, conclua o pagamento
                através do botão acima.
              </p>
              {cancelError && (
                <p className="mt-3 text-sm font-medium text-red-700">
                  {cancelError}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-7">
          <InfoTile
            icon={CalendarDays}
            label="Data de entrega"
            value={date(order.deliveryDate)}
          />

          <InfoTile
            icon={Clock3}
            label="Período"
            value={
              timeLabels[order.deliveryTimeSlot] ??
              order.deliveryTimeSlot
            }
          />

          <InfoTile
            icon={Package}
            label="Artigos"
            value={`${totalQuantity} ${totalQuantity === 1 ? "unidade" : "unidades"}`}
          />
        </div>
      </section>

      {order.status === "DELIVERED" && (
        <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Star size={19} className="text-[#71805F]" />
            <h3 className="text-lg font-semibold text-[#2F3B2A]">Avaliar a encomenda</h3>
          </div>
          {order.review ? (
            <div className="mt-5 rounded-2xl bg-[#F6F8F2] p-5">
              <p className="font-semibold text-[#394633]">Obrigado pela sua avaliação · {order.review.averageRating.toFixed(1)} / 5</p>
              <div className="mt-3 grid gap-2 text-sm text-[#73796D] sm:grid-cols-2">
                {order.review.ratings.map((rating) => <p key={rating.category}>{({ FLOWER_QUALITY: "Qualidade das flores", PRESENTATION: "Apresentação", DELIVERY: "Entrega", SERVICE: "Serviço" } as Record<string, string>)[rating.category]}: {rating.rating}/5</p>)}
              </div>
              {order.review.comment && <p className="mt-4 text-sm leading-6 text-[#73796D]">“{order.review.comment}”</p>}
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              {([
                ["flowerQuality", "Qualidade das flores"],
                ["presentation", "Apresentação"],
                ["delivery", "Entrega"],
                ["service", "Serviço"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-[#394633]">{label}</span>
                  <div className="flex gap-1" role="radiogroup" aria-label={label}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button key={value} type="button" onClick={() => setReviewRatings((current) => ({ ...current, [key]: value }))} aria-label={`${value} estrelas`} className="p-1">
                        <Star size={24} className={value <= reviewRatings[key] ? "fill-[#D6A84B] text-[#D6A84B]" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={1000} rows={4} placeholder="Comentário opcional" className="w-full rounded-2xl border border-[#E2E6DC] px-4 py-3 text-sm outline-none focus:border-[#71805F]" />
              {reviewError && <p className="text-sm text-red-700">{reviewError}</p>}
              <button type="button" onClick={() => void handleReviewSubmit()} disabled={isSubmittingReview} className="rounded-2xl bg-[#55624A] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{isSubmittingReview ? "A enviar..." : "Enviar avaliação"}</button>
            </div>
          )}
        </section>
      )}

      {/* Artigos e valores */}
      <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 sm:p-7">
        <h3 className="text-lg font-semibold text-[#2F3B2A]">
          Resumo dos artigos
        </h3>

        <div className="mt-5 divide-y divide-[#EEF0EA]">
          {(order.items ?? []).map((item) => (
            <div
              key={item.id}
              className="flex gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F6F1]">
                {item.type === "DELIVERY_FEE" || item.image ? (
                  <img
                    src={item.type === "DELIVERY_FEE" ? "/images/delivery-fee.svg" : item.image!}
                    alt={item.type === "DELIVERY_FEE" ? "Taxa de entrega" : item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#9AA58D]">
                    <Package size={24} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[#394633]">
                  {item.productName}
                </p>

                {item.variantName && (
                  <p className="mt-1 text-xs text-[#858A7F]">
                    Variante: {item.variantName}
                  </p>
                )}

                {item.description && (
                  <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#858A7F]">
                    {item.description}
                  </p>
                )}

                <p className="mt-2 text-xs text-[#858A7F]">
                  Quantidade: {item.quantity} ·{" "}
                  {money(item.unitPrice)} / unidade
                </p>
              </div>

              <p className="shrink-0 text-sm font-semibold text-[#2F3B2A]">
                {money(item.grossAmount)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-[#EEF0EA] pt-4">
          <PriceRow
            label="Subtotal"
            value={money(order.subtotal)}
          />

          {order.discount > 0 && (
            <PriceRow
              label="Desconto"
              value={`− ${money(order.discount)}`}
            />
          )}

          {order.taxAmount > 0 && (
            <PriceRow
              label="IVA incluído"
              value={money(order.taxAmount)}
            />
          )}

          <div className="mt-3 flex items-center justify-between border-t border-[#EEF0EA] pt-4">
            <span className="font-semibold text-[#2F3B2A]">
              Total
            </span>

            <span className="text-xl font-semibold text-[#2F3B2A]">
              {money(order.total)}
            </span>
          </div>
        </div>

        {isPendingPayment && (
          <div className="mt-6 border-t border-[#EEF0EA] pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#394633]">
                  Pronto para concluir a encomenda?
                </p>
                <p className="mt-1 text-xs text-[#858A7F]">
                  Total a pagar: {money(order.total)}
                </p>
              </div>

              <Link
                href={`/checkout/payment/${order.orderNumber}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#394633]"
              >
                <CreditCard size={16} />
                Pagar agora
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Dados de entrega e cliente */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#71805F]" />
            <h3 className="font-semibold text-[#2F3B2A]">
              Entrega
            </h3>
          </div>

          <p className="mt-4 font-medium text-[#394633]">
            {fullRecipient || "Destinatário"}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#73796D]">
            {address}
          </p>

          {order.recipientPhone && (
            <p className="mt-3 flex items-center gap-2 text-sm text-[#73796D]">
              <Phone size={14} />
              {order.recipientPhone}
            </p>
          )}

          {order.deliveryInstructions && (
            <div className="mt-4 rounded-2xl bg-[#F8F9F5] p-3 text-sm leading-5 text-[#73796D]">
              <p className="mb-1 font-semibold text-[#566449]">
                Instruções de entrega
              </p>
              {order.deliveryInstructions}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-[#71805F]" />
            <h3 className="font-semibold text-[#2F3B2A]">
              Dados do cliente
            </h3>
          </div>

          <p className="mt-4 font-medium text-[#394633]">
            {order.customerFirstName} {order.customerLastName}
          </p>

          <p className="mt-2 break-all text-sm text-[#73796D]">
            {order.customerEmail}
          </p>

          {order.customerPhone && (
            <p className="mt-2 text-sm text-[#73796D]">
              {order.customerPhone}
            </p>
          )}

          {order.cardMessage && (
            <div className="mt-4 rounded-2xl bg-[#F1F4EB] p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#667557]">
                <MessageSquareText size={14} />
                Mensagem do cartão
              </p>

              <p className="mt-2 text-sm italic leading-6 text-[#566449]">
                “{order.cardMessage}”
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F8F9F5] p-4">
      <div className="flex items-center gap-2 text-[#71805F]">
        <Icon size={16} />
        <span className="text-xs font-medium text-[#858A7F]">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-[#394633]">
        {value}
      </p>
    </div>
  );
}

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-[#858A7F]">{label}</span>
      <span className="font-medium text-[#566449]">{value}</span>
    </div>
  );
}
