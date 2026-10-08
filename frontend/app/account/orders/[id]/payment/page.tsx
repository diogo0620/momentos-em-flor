"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    LockKeyhole,
    ShieldCheck,
} from "lucide-react";

import {
    Elements,
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";

/* -------------------------------------------------------------------------- */
/* STRIPE                                                                     */
/* -------------------------------------------------------------------------- */

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface CustomerOrderItem {
    id: number;
    name: string;
    quantity: number;
    customerPrice: number;
    grossAmount: number;
    imageUrl?: string;
    variantName?: string;
}

interface CustomerOrder {
    id: number;
    orderNumber: string;
    status: string;
    createdAt: string;
    total: number;
    items: CustomerOrderItem[];
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(value));
}

/* -------------------------------------------------------------------------- */
/* PAYMENT FORM                                                               */
/* -------------------------------------------------------------------------- */

function PaymentForm({
    order,
}: {
    order: CustomerOrder;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const result =
                await stripe.confirmPayment({
                    elements,
                    redirect: "if_required",
                });

            if (result.error) {
                setError(
                    result.error.message ??
                        "Não foi possível processar o pagamento.",
                );

                return;
            }

            /*
             * The webhook is responsible for updating
             * the payment/order status in the backend.
             *
             * We only redirect the customer after Stripe
             * successfully confirms the payment.
             */
            router.push(
                `/account/orders/${order.id}`,
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível processar o pagamento.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
        >
            <div
                className="
                    rounded-[1.75rem]
                    border
                    border-[#E9ECE5]
                    bg-white
                    p-6
                    shadow-[0_8px_30px_rgba(47,59,42,0.04)]
                    sm:p-8
                "
            >
                <div className="mb-7 flex items-start gap-4">
                    <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-2xl
                            bg-[#E8EDDF]
                            text-[#55624A]
                        "
                    >
                        <CreditCard
                            size={20}
                        />
                    </div>

                    <div>
                        <h2
                            className="
                                text-lg
                                font-bold
                                text-[#2F3B2A]
                            "
                        >
                            Dados de pagamento
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            Escolha o método de pagamento
                            e complete os dados abaixo.
                        </p>
                    </div>
                </div>

                <div
                    className="
                        rounded-2xl
                        border
                        border-[#E9ECE5]
                        bg-[#FAFBF8]
                        p-4
                        sm:p-5
                    "
                >
                    <PaymentElement />
                </div>

                {error && (
                    <div
                        className="
                            mt-5
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            px-4
                            py-3
                            text-sm
                            text-red-700
                        "
                    >
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={
                        !stripe ||
                        !elements ||
                        isSubmitting
                    }
                    className="
                        mt-6
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-[#55624A]
                        px-6
                        py-4
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#46523D]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {isSubmitting ? (
                        <>
                            <span
                                className="
                                    h-4
                                    w-4
                                    animate-spin
                                    rounded-full
                                    border-2
                                    border-white/30
                                    border-t-white
                                "
                            />

                            A processar pagamento...
                        </>
                    ) : (
                        <>
                            <LockKeyhole
                                size={17}
                            />

                            Pagar{" "}
                            {formatCurrency(
                                order.total,
                            )}
                        </>
                    )}
                </button>

                <div
                    className="
                        mt-5
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        text-gray-400
                    "
                >
                    <ShieldCheck
                        size={15}
                        className="text-[#7D8D6D]"
                    />

                    Pagamento seguro e processado
                    através da Stripe
                </div>
            </div>
        </form>
    );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();

    const [order, setOrder] =
        useState<CustomerOrder | null>(null);

    const [clientSecret, setClientSecret] =
        useState<string | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        async function loadPayment() {
            const rawId = params.id;

            const orderId = Number(rawId);

            if (
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                setError(
                    "O ID da encomenda é inválido.",
                );

                setLoading(false);

                return;
            }

            try {
                setLoading(true);
                setError(null);

                /*
                 * Load the order first.
                 *
                 * The backend customer endpoint already
                 * validates that the order belongs to the
                 * authenticated customer.
                 */
                const orderResponse =
                    await ordersApi.getById(orderId);

                const currentOrder =
                    orderResponse.data;

                if (!currentOrder) {
                    throw new Error(
                        "Não foi possível encontrar a encomenda.",
                    );
                }

                setOrder(currentOrder);

                /*
                 * If the order is already paid/finished,
                 * there is no reason to create another
                 * PaymentIntent.
                 */
                if (
                    currentOrder.status !==
                    "PENDING_PAYMENT"
                ) {
                    router.replace(
                        `/account/orders/${orderId}`,
                    );

                    return;
                }

                /*
                 * The backend creates or reuses the
                 * existing PaymentIntent for this order.
                 */
                const paymentResponse =
                    await paymentsApi.createPaymentIntent(
                        orderId,
                    );

                setClientSecret(
                    paymentResponse.data.clientSecret,
                );
            } catch (err) {
                console.error(
                    "Payment page error:",
                    err,
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Não foi possível preparar o pagamento.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadPayment();
    }, [params.id, router]);

    /* ---------------------------------------------------------------------- */
    /* LOADING                                                                 */
    /* ---------------------------------------------------------------------- */

    if (loading) {
        return (
            <div
                className="
                    min-h-screen
                    bg-[#F7F8F4]
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        min-h-[70vh]
                        max-w-5xl
                        items-center
                        justify-center
                        px-4
                    "
                >
                    <div className="text-center">
                        <div
                            className="
                                mx-auto
                                h-10
                                w-10
                                animate-spin
                                rounded-full
                                border-2
                                border-[#D6DEC8]
                                border-t-[#55624A]
                            "
                        />

                        <p
                            className="
                                mt-5
                                text-sm
                                text-gray-500
                            "
                        >
                            A preparar o pagamento...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* ERROR                                                                   */
    /* ---------------------------------------------------------------------- */

    if (error || !order) {
        return (
            <div
                className="
                    min-h-screen
                    bg-[#F7F8F4]
                "
            >
                <div
                    className="
                        mx-auto
                        flex
                        min-h-[70vh]
                        max-w-5xl
                        items-center
                        justify-center
                        px-4
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-md
                            rounded-[1.75rem]
                            border
                            border-[#E9ECE5]
                            bg-white
                            p-8
                            text-center
                            shadow-[0_8px_30px_rgba(47,59,42,0.04)]
                        "
                    >
                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-red-50
                                text-red-500
                            "
                        >
                            !
                        </div>

                        <h1
                            className="
                                mt-5
                                text-xl
                                font-bold
                                text-[#2F3B2A]
                            "
                        >
                            Não foi possível
                            preparar o pagamento
                        </h1>

                        <p
                            className="
                                mt-2
                                text-sm
                                leading-6
                                text-gray-500
                            "
                        >
                            {error ??
                                "Não foi possível carregar a encomenda."}
                        </p>

                        <Link
                            href="/account/orders"
                            className="
                                mt-6
                                inline-flex
                                items-center
                                justify-center
                                rounded-full
                                bg-[#55624A]
                                px-6
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#46523D]
                            "
                        >
                            Voltar às encomendas
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* MAIN                                                                    */
    /* ---------------------------------------------------------------------- */

    return (
        <div
            className="
                min-h-screen
                bg-[#F7F8F4]
            "
        >
            <div
                className="
                    mx-auto
                    max-w-6xl
                    px-4
                    py-8
                    sm:px-6
                    sm:py-12
                    lg:px-8
                "
            >
                {/* BACK */}
                <Link
                    href={`/account/orders/${order.id}`}
                    className="
                        mb-8
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />

                    Voltar para a encomenda
                </Link>

                {/* HEADER */}
                <div className="mb-8">
                    <div
                        className="
                            mb-3
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-[#E8EDDF]
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            text-[#55624A]
                        "
                    >
                        <span
                            className="
                                h-1.5
                                w-1.5
                                rounded-full
                                bg-[#7D8D6D]
                            "
                        />

                        Pagamento
                    </div>

                    <h1
                        className="
                            text-3xl
                            font-bold
                            tracking-tight
                            text-[#2F3B2A]
                            sm:text-4xl
                        "
                    >
                        Finalizar pagamento
                    </h1>

                    <p
                        className="
                            mt-2
                            max-w-2xl
                            text-sm
                            leading-6
                            text-gray-500
                            sm:text-base
                        "
                    >
                        Complete o pagamento da sua
                        encomenda{" "}
                        <span className="font-medium text-[#55624A]">
                            #{order.orderNumber}
                        </span>
                        .
                    </p>
                </div>

                {/* CONTENT */}
                {clientSecret && (
                    <Elements
                        stripe={stripePromise}
                        options={{
                            clientSecret,
                            appearance: {
                                theme: "stripe",
                                variables: {
                                    colorPrimary:
                                        "#55624A",
                                    colorText:
                                        "#2F3B2A",
                                    colorDanger:
                                        "#A34B4B",
                                    fontFamily:
                                        "Inter, system-ui, sans-serif",
                                    borderRadius:
                                        "12px",
                                },
                            },
                        }}
                    >
                        <div
                            className="
                                grid
                                items-start
                                gap-6
                                lg:grid-cols-[minmax(0,1fr)_340px]
                            "
                        >
                            {/* PAYMENT */}
                            <PaymentForm
                                order={order}
                            />

                            {/* SUMMARY */}
                            <aside
                                className="
                                    lg:sticky
                                    lg:top-28
                                "
                            >
                                <div
                                    className="
                                        rounded-[1.75rem]
                                        border
                                        border-[#E9ECE5]
                                        bg-white
                                        p-6
                                        shadow-[0_8px_30px_rgba(47,59,42,0.04)]
                                    "
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-[#E8EDDF]
                                                text-[#55624A]
                                            "
                                        >
                                            <CheckCircle2
                                                size={19}
                                            />
                                        </div>

                                        <div>
                                            <h2
                                                className="
                                                    text-base
                                                    font-bold
                                                    text-[#2F3B2A]
                                                "
                                            >
                                                Resumo
                                            </h2>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-400
                                                "
                                            >
                                                Encomenda #
                                                {
                                                    order.orderNumber
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* PRODUCTS */}
                                    <div
                                        className="
                                            mt-6
                                            divide-y
                                            divide-[#EEF0EB]
                                        "
                                    >
                                        {order.items.map(
                                            (item) => (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-4
                                                        py-4
                                                        first:pt-0
                                                        last:pb-0
                                                    "
                                                >
                                                    <div className="min-w-0">
                                                        <p
                                                            className="
                                                                text-sm
                                                                font-medium
                                                                text-[#2F3B2A]
                                                            "
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </p>

                                                        {item.variantName && (
                                                            <p
                                                                className="
                                                                    mt-0.5
                                                                    text-xs
                                                                    text-gray-400
                                                                "
                                                            >
                                                                {
                                                                    item.variantName
                                                                }
                                                            </p>
                                                        )}

                                                        <p
                                                            className="
                                                                mt-1
                                                                text-xs
                                                                text-gray-400
                                                            "
                                                        >
                                                            Quantidade:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </p>
                                                    </div>

                                                    <span
                                                        className="
                                                            shrink-0
                                                            text-sm
                                                            font-semibold
                                                            text-[#55624A]
                                                        "
                                                    >
                                                        {formatCurrency(
                                                            Number(
                                                                item.grossAmount ??
                                                                    item.customerPrice,
                                                            ) *
                                                                item.quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    {/* TOTAL */}
                                    <div
                                        className="
                                            mt-6
                                            border-t
                                            border-[#E9ECE5]
                                            pt-5
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                items-end
                                                justify-between
                                                gap-4
                                            "
                                        >
                                            <div>
                                                <p
                                                    className="
                                                        text-xs
                                                        font-medium
                                                        uppercase
                                                        tracking-wide
                                                        text-gray-400
                                                    "
                                                >
                                                    Total
                                                </p>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-sm
                                                        text-gray-500
                                                    "
                                                >
                                                    Valor a pagar
                                                </p>
                                            </div>

                                            <span
                                                className="
                                                    text-2xl
                                                    font-bold
                                                    text-[#2F3B2A]
                                                "
                                            >
                                                {formatCurrency(
                                                    order.total,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* SECURITY */}
                                <div
                                    className="
                                        mt-4
                                        rounded-2xl
                                        border
                                        border-[#E3E7DE]
                                        bg-[#EEF1E9]
                                        p-4
                                    "
                                >
                                    <div className="flex gap-3">
                                        <ShieldCheck
                                            size={18}
                                            className="
                                                mt-0.5
                                                shrink-0
                                                text-[#55624A]
                                            "
                                        />

                                        <div>
                                            <p
                                                className="
                                                    text-sm
                                                    font-semibold
                                                    text-[#2F3B2A]
                                                "
                                            >
                                                Pagamento seguro
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    leading-5
                                                    text-[#68725F]
                                                "
                                            >
                                                Os seus dados de
                                                pagamento são
                                                processados de
                                                forma segura pela
                                                Stripe.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </Elements>
                )}
            </div>
        </div>
    );
}