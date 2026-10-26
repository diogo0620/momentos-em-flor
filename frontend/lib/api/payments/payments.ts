
import { PaymentIntent } from "@/types/payments/payment-intent";
import { BaseApi } from "../common/base-api";

import { apiFetch } from "../common/client";




class PaymentsApi extends BaseApi<
    null,
    null,
    null,
    null
> {
    constructor() {
        super("/payments");
    }

    async createPaymentIntent(orderNumber: string): Promise<PaymentIntent>{
        return apiFetch<PaymentIntent>(
            `${this.endpoint}/intent`,
            {method: 'POST', body: JSON.stringify({orderNumber})}
        )
    }


}



export const paymentsApi = new PaymentsApi();