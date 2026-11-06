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
            <PaymentElement />

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
