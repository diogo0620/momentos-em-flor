import {
    Module,
} from '@nestjs/common';

import {
    TaxCodesController,
} from './tax-codes.controller';

import {
    TaxCodesService,
} from './tax-codes.service';

import {
    TaxCodeMapper,
} from './mappers/tax-code.mapper';

@Module({
    controllers: [
        TaxCodesController,
    ],

    providers: [
        TaxCodesService,
        TaxCodeMapper,
    ],

    exports: [
        TaxCodesService,
    ],
})
export class TaxCodesModule {}