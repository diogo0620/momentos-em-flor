import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class MoloniFiscalLifecycleService {
  async queuePaidOrder(
    tx: Prisma.TransactionClient,
    orderId: number,
  ): Promise<void> {
    await tx.moloniFiscalDocument.upsert({
      where: { orderId },
      create: { orderId },
      update: {},
    });
  }
}
