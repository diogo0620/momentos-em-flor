"use client";

import {
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";

type StripePaymentFormProps = {
    onSuccess: () => void;
    amount: string;
};

export default function StripePaymentForm({
    onSuccess,
    amount,
}: StripePaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isReady, setIsReady] = useState(false);
    const [elementLoadFailed, setElementLoadFailed] = useState(false);

    const [error, setError] =
        useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { error } =
            await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url:
                        `${window.location.origin}/checkout/success`,
                },
                redirect: "if_required",
            });

        if (error) {
            setError(
                error.type === "card_error"
                    ? "O pagamento foi recusado. Confirma os dados do cartão ou utiliza outro método de pagamento."
                    : error.type === "validation_error"
                      ? "Verifica os dados de pagamento introduzidos."
                      : "Não foi possível processar o pagamento. Tenta novamente.",
            );

            setIsSubmitting(false);
            return;
        }

        onSuccess();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div className="relative min-h-40">
                {!isReady && (
                    <div className="absolute inset-0 z-10 space-y-3 bg-white" aria-label="A carregar métodos de pagamento">
                        <div className="h-11 animate-pulse rounded-xl bg-[#F1F3EC]" />
                        <div className="h-24 animate-pulse rounded-xl bg-[#F1F3EC]" />
                    </div>
                )}

                <div className={isReady ? "opacity-100" : "opacity-0"}>
                    <PaymentElement
                        onReady={() => setIsReady(true)}
                        onLoadError={() => {
                            setIsReady(true);
                            setElementLoadFailed(true);
                            setError(
                                "Não foi possível carregar os métodos de pagamento. Atualiza a página e tenta novamente.",
                            );
                        }}
                    />
                </div>
            </div>

            <p className="rounded-xl bg-[#F8F9F5] px-4 py-3 text-xs leading-5 text-[#626B5D]">
                Ao selecionar o botão abaixo confirma a compra e o pagamento do total apresentado, sujeito aos Termos e Condições aceites no checkout.
            </p>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={
                    !stripe ||
                    !elements ||
                    !isReady ||
                    elementLoadFailed ||
                    isSubmitting
                }
                className="w-full rounded-xl bg-[#2F3B2A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3F4C38] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting
                    ? "A processar pagamento..."
                    : `Pagar ${amount}`}
            </button>
        </form>
    );
}
