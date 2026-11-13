import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MoloniDocumentStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { AdminMoloniFiscalDocumentsService } from './admin-moloni-fiscal-documents.service';

@Injectable()
export class MoloniFiscalAutomationService {
  private readonly logger = new Logger(MoloniFiscalAutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documents: AdminMoloniFiscalDocumentsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async recoverPendingDocuments(): Promise<void> {
    const staleAttempt = new Date(Date.now() - 15 * 60 * 1000);
    const records = await this.prisma.moloniFiscalDocument.findMany({
      where: {
        order: { payment: { status: PaymentStatus.PAID } },
        OR: [
          {
            invoiceStatus: {
              in: [MoloniDocumentStatus.QUEUED, MoloniDocumentStatus.FAILED],
            },
          },
          {
            invoiceStatus: MoloniDocumentStatus.PROCESSING,
            lastAttemptAt: { lt: staleAttempt },
          },
          {
            invoiceStatus: MoloniDocumentStatus.ISSUED,
            invoiceEmailSentAt: null,
          },
        ],
      },
      select: { id: true, orderId: true },
      orderBy: { updatedAt: 'asc' },
      take: 10,
    });

    for (const record of records) {
      try {
        await this.documents.issue(record.id);
      } catch (error) {
        this.logger.error(
          `Automatic fiscal processing failed for order ${record.orderId}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    const creditNotes = await this.prisma.moloniFiscalDocument.findMany({
      where: {
        creditNoteRequiredAt: { not: null },
        order: { payment: { status: PaymentStatus.REFUNDED } },
        OR: [
          {
            creditNoteStatus: {
              in: [MoloniDocumentStatus.QUEUED, MoloniDocumentStatus.FAILED],
            },
          },
          {
            creditNoteStatus: MoloniDocumentStatus.PROCESSING,
            lastAttemptAt: { lt: staleAttempt },
          },
          {
            creditNoteStatus: MoloniDocumentStatus.ISSUED,
            creditNoteEmailSentAt: null,
          },
        ],
      },
      select: { id: true, orderId: true },
      orderBy: { updatedAt: 'asc' },
      take: 10,
    });

    for (const record of creditNotes) {
      try {
        await this.documents.issueCreditNote(record.id);
      } catch (error) {
        this.logger.error(
          `Automatic credit note processing failed for order ${record.orderId}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }
}
