import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { MoloniApiService } from '../api/moloni-api.service';

export type MoloniPdfDocumentKind = 'invoice' | 'receipt' | 'credit-note';

export type MoloniPdfDocument = {
  buffer: Buffer;
  filename: string;
};

const MAX_PDF_BYTES = 15 * 1024 * 1024;

@Injectable()
export class MoloniDocumentPdfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moloniApi: MoloniApiService,
  ) {}

  async getByFiscalDocumentId(
    id: number,
    kind: MoloniPdfDocumentKind,
  ): Promise<MoloniPdfDocument> {
    const record = await this.prisma.moloniFiscalDocument.findUnique({
      where: { id },
      select: {
        invoiceId: true,
        receiptId: true,
        creditNoteId: true,
        order: { select: { orderNumber: true } },
      },
    });

    if (!record) {
      throw new BadRequestException('Documento fiscal não encontrado.');
    }

    const documentId = kind === 'invoice'
      ? record.invoiceId
      : kind === 'receipt'
        ? record.receiptId
        : record.creditNoteId;

    if (!documentId) {
      throw new BadRequestException('O documento ainda não foi emitido na Moloni.');
    }

    return this.download(
      documentId,
      this.buildFilename(record.order.orderNumber, kind),
    );
  }

  async getInvoiceByOrderId(orderId: number): Promise<MoloniPdfDocument> {
    const record = await this.prisma.moloniFiscalDocument.findUnique({
      where: { orderId },
      select: {
        invoiceId: true,
        order: { select: { orderNumber: true } },
      },
    });

    if (!record?.invoiceId) {
      throw new BadRequestException('A fatura desta encomenda ainda não está disponível.');
    }

    return this.download(
      record.invoiceId,
      this.buildFilename(record.order.orderNumber, 'invoice'),
    );
  }

  async getCustomerInvoice(
    orderNumber: string,
    customerId: number,
  ): Promise<MoloniPdfDocument> {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber, customerId },
      select: {
        orderNumber: true,
        moloniFiscalDocument: { select: { invoiceId: true } },
      },
    });

    if (!order) {
      throw new BadRequestException('Encomenda não encontrada.');
    }
    if (!order.moloniFiscalDocument?.invoiceId) {
      throw new BadRequestException('A fatura desta encomenda ainda não está disponível.');
    }

    return this.download(
      order.moloniFiscalDocument.invoiceId,
      this.buildFilename(order.orderNumber, 'invoice'),
    );
  }

  async download(documentId: string, filename: string): Promise<MoloniPdfDocument> {
    const pdf = await this.moloniApi.getDocumentPdfLink<{ url?: string }>(documentId);
    if (!pdf.url || !pdf.url.startsWith('https://')) {
      throw new ServiceUnavailableException(
        'A Moloni não devolveu o documento PDF esperado.',
      );
    }

    let response: Response;
    try {
      response = await fetch(pdf.url, {
        headers: { Accept: 'application/pdf' },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível descarregar o documento PDF da Moloni.',
      );
    }

    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (!response.ok || declaredLength > MAX_PDF_BYTES) {
      throw new ServiceUnavailableException(
        'A Moloni não devolveu um documento PDF válido.',
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (
      buffer.length === 0 ||
      buffer.length > MAX_PDF_BYTES ||
      buffer.subarray(0, 5).toString('ascii') !== '%PDF-'
    ) {
      throw new ServiceUnavailableException(
        'A Moloni não devolveu um documento PDF válido.',
      );
    }

    return { buffer, filename };
  }

  private buildFilename(orderNumber: string, kind: MoloniPdfDocumentKind): string {
    const safeOrderNumber = orderNumber.replace(/[^a-zA-Z0-9_-]/g, '-');
    const prefix = kind === 'invoice'
      ? 'fatura'
      : kind === 'receipt'
        ? 'recibo'
        : 'nota-de-credito';
    return `${prefix}-${safeOrderNumber}.pdf`;
  }
}
