import {
    Body,
    Controller,
    Headers,
    Post,
    Req,
} from '@nestjs/common';

import type { Request } from 'express';

import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

type RawBodyRequest = Request & {
    rawBody: Buffer;
};

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) {}

    @Post('checkout')
    async createCheckoutSession(
        @Body()
        dto: CreateCheckoutSessionDto,
    ) {
        return this.paymentsService.createCheckoutSession(
            dto.orderId,
        );
    }

    @Post('webhook')
    async handleWebhook(
        @Req() request: RawBodyRequest,
        @Headers('stripe-signature')
        signature: string,
    ) {
        return this.paymentsService.handleWebhook(
            request.rawBody,
            signature,
        );
    }
}