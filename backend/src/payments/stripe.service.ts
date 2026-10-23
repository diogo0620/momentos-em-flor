import {
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const secretKey =
            this.configService.get<string>(
                'STRIPE_SECRET_KEY',
            );

        if (!secretKey) {
            throw new InternalServerErrorException(
                'Stripe secret key is not configured.',
            );
        }

        this.stripe = new Stripe(secretKey);
    }

    async createCheckoutSession(
        params: Stripe.Checkout.SessionCreateParams,
    ): Promise<Stripe.Checkout.Session> {
        return this.stripe.checkout.sessions.create(
            params,
        );
    }

    async createPaymentIntent(
        amount: number,
        metadata: Record<string, string>,
    ): Promise<Stripe.PaymentIntent> {
        return this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'eur',
            metadata,
            automatic_payment_methods: {
                enabled: true,
            },
        });
    }

    async retrieveCheckoutSession(
        sessionId: string,
    ): Promise<Stripe.Checkout.Session> {
        return this.stripe.checkout.sessions.retrieve(
            sessionId,
        );
    }

    constructWebhookEvent(
        payload: string | Buffer,
        signature: string,
    ): Stripe.Event {
        const webhookSecret =
            this.configService.get<string>(
                'STRIPE_WEBHOOK_SECRET',
            );

        if (!webhookSecret) {
            throw new InternalServerErrorException(
                'Stripe webhook secret is not configured.',
            );
        }

        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            webhookSecret,
        );
    }
}