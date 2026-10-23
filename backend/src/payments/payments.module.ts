import { Module } from '@nestjs/common';


import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
    controllers: [
        PaymentsController,
    ],

    providers: [
        PaymentsService,
        StripeService,
    ],

    exports: [
        PaymentsService,
        StripeService,
    ],
})
export class PaymentsModule {}