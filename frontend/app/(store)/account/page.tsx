"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Heart,
  Package,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { customerUsersApi } from "@/lib/api/users/customer-users";
import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import type { CustomerUserDetail } from "@/types/users/customer/customer-user-detail";
import type {
  CustomerOrderList,
  CustomerOrderStatus,
} from "@/types/orders/customer/customer-order-list";

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

const statusLabel: Record<CustomerOrderStatus, string> = {
  CREATED: "Criada",
  PENDING_PAYMENT: "A aguardar pagamento",
  WAITING_FOR_FLORISTS: "À procura de florista",
  ASSIGNED: "Atribuída a uma florista",
  IN_PRODUCTION: "Em preparação",
  READY_FOR_DELIVERY: "Pronta para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelada",
};

export default function AccountHomePage() {
  const [user, setUser] = useState<CustomerUserDetail | null>(null);
  const [orders, setOrders] = useState<CustomerOrderList[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccountData() {
      try {
        const [userResponse, ordersResponse] = await Promise.all([
          customerUsersApi.getMe(),
          customerOrdersApi.getAll({
            page: 1,
            pageSize: 4,
            sort: "createdAt",
            order: "desc",
          }),
        ]);

        if (!active) return;

        setUser(userResponse);
        setOrders(ordersResponse.items ?? []);
        setTotalOrders(ordersResponse.total ?? ordersResponse.items?.length ?? 0);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAccountData();

    return () => {
      active = false;
    };
  }, []);

  const firstName = user?.firstName?.trim() || "";

  return (
    <div className="space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-3xl bg-[#394633] p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-1 top-7 h-32 w-32 rounded-full border border-white/10" />

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/85">
            <Sparkles size={13} />
            O seu espaço pessoal
          </span>

          <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {firstName ? `Olá, ${firstName}.` : "Bem-vindo à sua conta."}
          </h2>

          <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
            Acompanhe as suas encomendas, atualize os seus dados e guarde as
            flores que mais gosta.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D6DEC8] px-5 py-3 text-sm font-semibold text-[#2F3B2A] transition hover:bg-white"
          >
            Descobrir flores
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <QuickLink
          href="/account/orders"
          icon={Package}
          title="As minhas encomendas"
          description="Consulte estados, datas e detalhes."
        />
        <QuickLink
          href="/account/profile"
          icon={UserRound}
          title="Dados pessoais"
          description="Mantenha os seus contactos atualizados."
        />
        <QuickLink
          href="/favorites"
          icon={Heart}
          title="Os meus favoritos"
          description="Encontre rapidamente as suas flores preferidas."
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#E8EBE2] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#EEF0EA] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7B876C]">
              Acompanhe tudo
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#2F3B2A]">
              Encomendas recentes
            </h2>
          </div>

          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#55624A] hover:underline"
          >
            Ver todas
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-2xl bg-[#F5F6F1]"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#777D71]">
              Não foi possível carregar os dados da sua conta.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold text-[#55624A] underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F4EB] text-[#55624A]">
              <Package size={21} />
            </div>
            <p className="mt-4 font-semibold text-[#2F3B2A]">
              Ainda não tem encomendas
            </p>
            <p className="mt-1 text-sm text-[#818679]">
              As suas próximas surpresas começam aqui.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#55624A] hover:underline"
            >
              Explorar produtos
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF0EA]">
            {orders.map((order) => (
              <Link
                href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
                key={order.id}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-[#FBFCF9] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[#394633]">
                    Encomenda #{order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-[#858A7F]">
                    Realizada a {date(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="rounded-full bg-[#F1F4EB] px-3 py-1.5 text-xs font-medium text-[#566449]">
                    {statusLabel[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-semibold text-[#2F3B2A]">
                    {money(order.total)}
                  </span>
                  <ArrowRight
                    className="hidden text-[#9BA38F] sm:block"
                    size={16}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && !loadError && totalOrders > 0 && (
          <div className="border-t border-[#EEF0EA] px-5 py-3 text-xs text-[#858A7F] sm:px-6">
            A mostrar {orders.length} de {totalOrders} encomendas
          </div>
        )}
      </section>

      <section className="flex items-start gap-3 rounded-3xl border border-[#E6EBDD] bg-[#F1F4EB] p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#55624A]">
          <ShieldCheck size={19} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#394633]">
            Os seus dados, com cuidado
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#73796D]">
            Pode rever os seus dados pessoais e alterar a palavra-passe a
            qualquer momento.
          </p>
          <Link
            href="/account/security"
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#55624A] hover:underline"
          >
            Definições de segurança
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof Package;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-[#E8EBE2] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#D5DDCA] hover:shadow-[0_10px_28px_rgba(47,59,42,0.05)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1F4EB] text-[#55624A]">
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <ArrowRight
          size={17}
          className="text-[#A1A797] transition group-hover:translate-x-1 group-hover:text-[#55624A]"
        />
      </div>
      <h3 className="mt-5 font-semibold text-[#2F3B2A]">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-[#858A7F]">{description}</p>
    </Link>
  );
}