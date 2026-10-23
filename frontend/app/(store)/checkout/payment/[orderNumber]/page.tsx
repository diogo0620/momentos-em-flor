"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "@/components/StripePaymentForm";
import { CustomerOrderDetail } from "@/types/orders/customer/customer-order-detail";
import { customerOrdersApi } from "@/lib/api/orders/customer-orders";
import { paymentsApi } from "@/lib/api/payments/payments";

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

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

function formatTimeSlot(value: string) {
    switch (value) {
        case "MORNING":
            return "Manhã";
        case "AFTERNOON":
            return "Tarde";
        case "EVENING":
            return "Final do dia";
        default:
            return value;
    }
}

export default function CheckoutPaymentPage() {
    const params = useParams<{ orderNumber: string }>();
    const router = useRouter();
    const orderNumber = params.orderNumber;

    const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderNumber) {
            setError("Encomenda inválida.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadPayment() {
            try {
                setLoading(true);
                setError(null);

                const orderData = (await customerOrdersApi.getByOrderNumber(orderNumber));

                if (cancelled) return;

                if (!orderData || orderData.orderNumber !== orderNumber) {
                    throw new Error("Não foi possível encontrar esta encomenda.");
                }

                setOrder(orderData);

    
                if (orderData.status !== "PENDING_PAYMENT") {
                    router.replace(`/account/orders/${orderNumber}`);
                    return;
                }

                const paymentResponse =
                    await paymentsApi.createPaymentIntent(orderNumber);

                if (cancelled) return;

                const secret = paymentResponse.clientSecret;

                if (!secret) {
                    throw new Error("Não foi possível preparar o pagamento.");
                }

                setClientSecret(secret);
            } catch (err) {
                if (cancelled) return;

                console.error("Erro ao preparar pagamento:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível preparar o pagamento.",
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadPayment();

        return () => {
            cancelled = true;
        };
    }, [orderNumber, router]);

    const appearance = useMemo(
        () => ({
            theme: "stripe" as const,
            variables: {
                colorPrimary: "#55624A",
                colorText: "#2F3B2A",
                colorBackground: "#FFFFFF",
                colorDanger: "#B91C1C",
                borderRadius: "12px",
                fontFamily: "Inter, system-ui, sans-serif",
            },
        }),
        [],
    );

    if (loading) {
        return (
            <main className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto flex max-w-6xl items-center justify-center">
                    <div className="rounded-[2rem] bg-white px-10 py-12 text-center shadow-sm">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D6DEC8] border-t-[#55624A]" />
                        <p className="mt-4 text-sm text-gray-500">
                            A preparar o pagamento...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !order || !clientSecret) {
        return (
            <main className="min-h-screen bg-[#F7F8F4] px-4 py-16">
                <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBEAEA] text-xl font-semibold text-[#A34B4B]">
                        !
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-[#2F3B2A]">
                        Não foi possível preparar o pagamento
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        {error ?? "Tente novamente a partir da sua encomenda."}
                    </p>

                    <Link
                        href={order ? `/account/orders/${order.orderNumber}` : "/account/orders"}
                        className="mt-8 inline-flex rounded-full bg-[#55624A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#46523D]"
                    >
                        Voltar à encomenda
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F8F4]">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="mb-8">
                    <Link
                        href={`/account/orders/${order.id}`}
                        className="text-sm font-medium text-[#55624A] transition hover:text-[#2F3B2A]"
                    >
                        ← Voltar à encomenda
                    </Link>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E8EDDF] px-3 py-1.5 text-xs font-semibold text-[#55624A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#7D8D6D]" />
                        Pagamento
                    </div>

                    <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#2F3B2A] sm:text-4xl">
                        Finalizar pagamento
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                        A sua encomenda está criada. Complete o pagamento para a podermos processar.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                    <section className="rounded-[1.75rem] border border-[#E9ECE5] bg-white p-6 shadow-[0_8px_30px_rgba(47,59,42,0.04)] sm:p-8">
                        <div className="mb-7 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                    Pagamento seguro
                                </p>
                                <h2 className="mt-2 text-xl font-bold text-[#2F3B2A]">
                                    Dados de pagamento
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    O pagamento é processado de forma segura pelo Stripe.
                                </p>
                            </div>

                            <div className="rounded-2xl bg-[#F8F9F5] px-4 py-3 text-right">
                                <p className="text-xs text-gray-400">Total</p>
                                <p className="mt-1 text-lg font-bold text-[#2F3B2A]">
                                    {formatCurrency(order.total)}
                                </p>
                            </div>
                        </div>

                        <Elements
                            stripe={stripePromise}
                            options={{ clientSecret, appearance }}
                        >
                            <StripePaymentForm
                                onSuccess={() => router.push("/checkout/success")}
                            />
                        </Elements>
                    </section>

                    <aside className="space-y-6">
                        <section className="rounded-[1.75rem] border border-[#E2E7DD] bg-white p-6 shadow-[0_12px_40px_rgba(47,59,42,0.07)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                A sua encomenda
                            </p>

                            <div className="mt-2 flex items-center justify-between gap-4">
                                <h2 className="text-xl font-bold text-[#2F3B2A]">
                                    {order.orderNumber}
                                </h2>
                                <span className="rounded-full bg-[#FFF4DD] px-3 py-1 text-xs font-semibold text-[#9A6B18]">
                                    Pagamento pendente
                                </span>
                            </div>

                            <div className="my-5 border-t border-[#E5E9E1]" />

                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#F1F3EC]">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.productName}
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                                    Flor
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-[#2F3B2A]">
                                                        {item.productName}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {item.quantity} × {formatCurrency(item.unitPrice)}
                                                    </p>
                                    
                                                </div>

                                                <p className="shrink-0 text-sm font-semibold text-[#2F3B2A]">
                                                    {formatCurrency(item.grossAmount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="my-5 border-t border-[#E5E9E1]" />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-[#2F3B2A]">
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">Entrega</span>
                                    <span className="font-medium text-[#2F3B2A]">
                                        {order.deliveryFee > 0
                                            ? formatCurrency(order.deliveryFee)
                                            : "Grátis"}
                                    </span>
                                </div>

                                {order.discount > 0 && (
                                    <div className="flex justify-between gap-4 text-[#55624A]">
                                        <span>Desconto</span>
                                        <span className="font-medium">
                                            -{formatCurrency(order.discount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between gap-4 border-t border-[#E5E9E1] pt-4">
                                    <span className="font-semibold text-[#2F3B2A]">Total</span>
                                    <span className="text-lg font-bold text-[#2F3B2A]">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[1.75rem] border border-[#E2E7DD] bg-white p-6 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                                Entrega
                            </p>

                            <div className="mt-4 space-y-3 text-sm">
                                <div>
                                    <p className="font-semibold text-[#2F3B2A]">
                                        {formatDate(order.deliveryDate)}
                                    </p>
                                    <p className="mt-0.5 text-gray-500">
                                        {formatTimeSlot(order.deliveryTimeSlot)}
                                    </p>
                                </div>

                                <div className="border-t border-[#E5E9E1] pt-3">
                                    <p className="font-medium text-[#2F3B2A]">
                                        {order.recipientFirstName} {order.recipientLastName ?? ""}
                                    </p>
                                    <p className="mt-1 leading-6 text-gray-500">
                                        {order.deliveryStreet}
                                        {order.deliveryStreetNumber
                                            ? `, ${order.deliveryStreetNumber}`
                                            : ""}
                                        {order.deliveryStreet2
                                            ? `, ${order.deliveryStreet2}`
                                            : ""}
                                        <br />
                                        {order.deliveryPostalCode} {order.deliveryCity}
                                        <br />
                                        {order.deliveryDistrict}
                                    </p>
                                    {order.deliveryInstructions && (
                                        <p className="mt-3 text-xs leading-5 text-gray-500">
                                            Instruções: {order.deliveryInstructions}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <div className="rounded-2xl border border-[#E2E7DD] bg-[#F8F9F5] px-5 py-4">
                            <p className="text-xs font-semibold text-[#55624A]">
                                Pagamento seguro
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                Os dados do cartão são processados diretamente pelo Stripe e não são armazenados pela Momentos em Flor.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
