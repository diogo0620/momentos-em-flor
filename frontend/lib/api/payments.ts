import { apiFetch } from "./common/client";


export type CreateCheckoutSessionResponse = {
    success: boolean;
    data: {
        checkoutUrl: string;
    };
};

class PaymentsApi {
    private readonly endpoint = "/payments";

    async createCheckoutSession(
        orderId: number,
    ) {
        return apiFetch<CreateCheckoutSessionResponse>(
            `${this.endpoint}/checkout`,
            {
                method: "POST",
                body: JSON.stringify({
                    orderId,
                }),
            },
        );
    }

    async createPaymentIntent(orderId: number) {
        return apiFetch<{
            success: boolean;
            data: {
                clientSecret: string;
            };
        }>(
            `${this.endpoint}/intent`,
            {
                method: "POST",
                body: JSON.stringify({
                    orderId,
                }),
            },
        );
    }
}

export const paymentsApi =
    new PaymentsApi();