
import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { MoloniSyncMapper } from './mappers/moloni-sync.mapper';

@Injectable()
export class MoloniSyncService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: MoloniSyncMapper,
    ) { }

    async syncProduct(productId: number): Promise<void>{

    }

    async syncTaxCode(taxCodeId: number): Promise<void>{

    }

    async syncCustomer(userId: number): Promise<void>{

    }
}
