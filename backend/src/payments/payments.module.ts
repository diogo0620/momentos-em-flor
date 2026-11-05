import { Module } from '@nestjs/common';


import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MoloniModule } from '@/moloni/moloni.module';
import { AdminPaymentsController } from './admin-payments.controller';

@Module({
    imports: [MoloniModule],
    controllers: [
        PaymentsController,
        AdminPaymentsController,
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
