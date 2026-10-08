"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ordersApi } from "@/lib/api/orders";
import type { Pagination } from "@/types/order";

type CustomerOrderStatus =
  | "PROCESSING"
  | "PENDING_PAYMENT"
  | "IN_PREPARATION"
  | "READY_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

interface CustomerOrder {
  id: number;
  orderNumber: string;
  status: CustomerOrderStatus;
  total: number;
  createdAt: string;
  deliveryDate: string;
}

interface CustomerOrdersResponse {
  data: CustomerOrder[];
  pagination: Pagination;
}

const statusLabels: Record<CustomerOrderStatus, string> = {
  PROCESSING: "Em processamento",
  PENDING_PAYMENT: "Pagamento pendente",
  IN_PREPARATION: "Em preparação",
  READY_FOR_DELIVERY: "Pronta para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getStatusClass(status: CustomerOrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";

    case "CANCELLED":
      return "bg-red-100 text-red-800";

    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800";

    default:
      return "bg-[#D6DEC8] text-[#2F3B2A]";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await ordersApi.getAll({
            page: 1,
            pageSize: 20,
            sort: "createdAt",
            order: "desc",
          });

        setOrders(
          response.data as CustomerOrder[],
        );

        setPagination(response.pagination);
      } catch (err) {
        console.error(err);
        setError(
          "Não foi possível carregar as tuas encomendas.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9F5]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
            As minhas encomendas
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Consulta o estado e os detalhes das tuas encomendas.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              A carregar encomendas...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#D6DEC8]">
                <span className="text-xl">♡</span>
              </div>

              <h2 className="text-lg font-medium text-[#2F3B2A]">
                Ainda não tens encomendas
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Quando fizeres uma encomenda, poderás
                acompanhar aqui todos os detalhes.
              </p>

              <Link
                href="/"
                className="mt-6 inline-flex rounded-full bg-[#2F3B2A] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Explorar flores
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#AEB8A0] hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-medium text-[#2F3B2A]">
                          Encomenda #{order.orderNumber}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            order.status,
                          )}`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:gap-5">
                        <span>
                          Encomendada em{" "}
                          {formatDate(order.createdAt)}
                        </span>

                        <span>
                          Entrega em{" "}
                          {formatDate(order.deliveryDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <span className="font-semibold text-[#2F3B2A]">
                        {formatPrice(order.total)}
                      </span>

                      <span className="text-gray-400">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        {pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              A mostrar {orders.length} de{" "}
              {pagination.total} encomendas
            </div>
          )}
      </div>
    </div>
  );
}