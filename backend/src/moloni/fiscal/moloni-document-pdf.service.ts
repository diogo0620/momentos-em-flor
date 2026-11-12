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

type PdfLinkObserver = (url: string) => Promise<void>;

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
        id: true,
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
      kind === 'invoice' ? this.invoiceLinkObserver(record.id) : undefined,
    );
  }

  async getInvoiceByOrderId(orderId: number): Promise<MoloniPdfDocument> {
    const record = await this.prisma.moloniFiscalDocument.findUnique({
      where: { orderId },
      select: {
        id: true,
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
      this.invoiceLinkObserver(record.id),
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
        moloniFiscalDocument: { select: { id: true, invoiceId: true } },
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
      this.invoiceLinkObserver(order.moloniFiscalDocument.id),
    );
  }

  async download(
    documentId: string,
    filename: string,
    onLink?: PdfLinkObserver,
  ): Promise<MoloniPdfDocument> {
    const settings = await this.prisma.moloniSettings.findUnique({
      where: { id: 1 },
      select: { signedPdf: true },
    });
    const signed = settings?.signedPdf ?? true;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const pdf = await this.moloniApi.getDocumentPdfLink<{ url?: string }>(
        documentId,
        signed,
      );
      const url = this.parsePdfUrl(pdf.url);
      if (onLink) await onLink(url);

      try {
        const response = await fetch(url, {
          headers: {
            Accept: 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.1',
            'User-Agent': 'MomentosEmFlor/1.0',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(30_000),
        });
        const declaredLength = Number(response.headers.get('content-length') ?? 0);
        if (response.ok && declaredLength <= MAX_PDF_BYTES) {
          const received = Buffer.from(await response.arrayBuffer());
          const headerIndex = received.subarray(0, 1024).indexOf('%PDF-');
          if (headerIndex >= 0 && received.length <= MAX_PDF_BYTES) {
            return { buffer: received.subarray(headerIndex), filename };
          }
        }
      } catch {
        // A geração do PDF assinado pode demorar alguns instantes. Voltamos a
        // pedir uma ligação nova antes de considerar a operação falhada.
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    throw new ServiceUnavailableException(
      'Não foi possível obter um documento PDF válido da Moloni.',
    );
  }

  async downloadInvoice(
    fiscalDocumentId: number,
    documentId: string,
    filename: string,
  ): Promise<MoloniPdfDocument> {
    return this.download(
      documentId,
      filename,
      this.invoiceLinkObserver(fiscalDocumentId),
    );
  }

  private invoiceLinkObserver(fiscalDocumentId: number): PdfLinkObserver {
    return async (url) => {
      await this.prisma.moloniFiscalDocument.update({
        where: { id: fiscalDocumentId },
        data: {
          invoicePdfUrl: url,
          invoicePdfUrlUpdatedAt: new Date(),
        },
      });
    };
  }

  private parsePdfUrl(value?: string): string {
    if (!value) {
      throw new ServiceUnavailableException(
        'A Moloni não devolveu a ligação do documento PDF.',
      );
    }
    try {
      const url = new URL(value.trim());
      if (url.protocol !== 'https:') throw new Error('Invalid protocol');
      return url.toString();
    } catch {
      throw new ServiceUnavailableException(
        'A Moloni devolveu uma ligação de PDF inválida.',
      );
    }
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
