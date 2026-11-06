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
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { CustomerCreatePaymentIntentDto } from './dtos/customer-create-payment-intent.dto';


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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('JWT')
    async createPaymentIntent(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: CustomerCreatePaymentIntentDto,
    ) {
        return this.paymentsService.createPaymentIntent(user, dto.orderNumber);
    }
}
