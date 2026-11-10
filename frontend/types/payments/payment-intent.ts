export type PaymentIntent = {
    status: "REQUIRES_PAYMENT" | "PROCESSING" | "PAID";
    clientSecret: string | null;
}
