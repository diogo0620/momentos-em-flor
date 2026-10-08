"use client";

import {
    PaymentElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";

type StripePaymentFormProps = {
    onSuccess: () => void;
};

export default function StripePaymentForm({
    onSuccess,
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
                error.message ??
                    "Não foi possível processar o pagamento.",
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
                    : "Pagar"}
            </button>
        </form>
    );
}