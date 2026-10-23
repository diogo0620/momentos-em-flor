import {
    Body,
    Controller,
    Headers,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';


type RawBodyRequest = Request & {
    rawBody: Buffer;
};

@Controller('/payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
    ) { }

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

    @Post('intent')
    async createPaymentIntent(
        @Body('orderNumber') orderNumber: string,
    ) {
        return await this.paymentsService.createPaymentIntent(orderNumber);
    }
}