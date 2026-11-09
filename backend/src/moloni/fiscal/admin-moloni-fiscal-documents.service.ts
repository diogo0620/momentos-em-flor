import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MoloniDocumentStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { MoloniApiService } from '../api/moloni-api.service';
import { MoloniFiscalDocumentQueryDto } from './dtos/moloni-fiscal-document-query.dto';
import { EmailService } from '@/email/email.service';
import {
  MoloniDocumentPdfService,
  MoloniPdfDocumentKind,
} from './moloni-document-pdf.service';

type MoloniCustomer = { customer_id: number };
type MoloniDocumentResult = { valid?: number; document_id?: number };
type MoloniTax = {
  tax_id?: number;
  value?: number;
  type?: number;
  saft_type?: number;
};
type MoloniDocumentTax = {
  tax_id: number;
  value: number;
  order: number;
  cumulative: number;
};
type MoloniDocumentProduct = {
  document_product_id?: number;
  product_id?: number;
  related_id?: number;
  name?: string;
  summary?: string;
  qty?: number;
  price?: number;
  discount?: number;
  order?: number;
  exemption_reason?: string;
  taxes?: MoloniDocumentTax[];
};
type MoloniInvoice = {
  document_id?: number;
  customer_id?: number;
  status?: number;
  net_value?: number;
  products?: MoloniDocumentProduct[];
};
type MoloniCreditNote = {
  document_id?: number;
  customer_id?: number;
  status?: number;
  associated_documents?: Array<{ associated_id: number }>;
  products?: MoloniDocumentProduct[];
};

const fiscalDocumentInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      customerFirstName: true,
      customerLastName: true,
      customerEmail: true,
      customerPhone: true,
      customerTaxNumber: true,
      deliveryStreet: true,
      deliveryStreetNumber: true,
      deliveryStreet2: true,
      deliveryPostalCode: true,
      deliveryCity: true,
      deliveryCountryCode: true,
      discount: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      paidAt: true,
      payment: { select: { status: true, currency: true } },
      items: {
        select: {
          name: true,
          description: true,
          quantity: true,
          netAmount: true,
          grossAmount: true,
          taxCodeId: true,
          taxRate: true,
        },
      },
    },
  },
} satisfies Prisma.MoloniFiscalDocumentInclude;

type FiscalDocumentRecord = Prisma.MoloniFiscalDocumentGetPayload<{
  include: typeof fiscalDocumentInclude;
}>;

@Injectable()
export class AdminMoloniFiscalDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly moloniApi: MoloniApiService,
    private readonly emailService: EmailService,
    private readonly pdfService: MoloniDocumentPdfService,
  ) {}

  async issueForOrder(orderId: number) {
    const record = await this.prisma.moloniFiscalDocument.upsert({
      where: { orderId },
      create: { orderId },
      update: {},
      select: { id: true },
    });
    return this.issue(record.id);
  }

  async findAll(query: MoloniFiscalDocumentQueryDto) {
    const where: Prisma.MoloniFiscalDocumentWhereInput = {
      ...(query.status && { invoiceStatus: query.status }),
      ...(query.search && {
        order: {
          OR: [
            { orderNumber: { contains: query.search, mode: 'insensitive' } },
            { customerEmail: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.moloniFiscalDocument.findMany({
        where,
        include: fiscalDocumentInclude,
        orderBy: { createdAt: query.order },
        ...getPagination(query.page, query.pageSize),
      }),
      this.prisma.moloniFiscalDocument.count({ where }),
    ]);

    return ApiResponse.paginated(
      items.map((item) => this.toResponse(item)),
      getPaginationResponse(query.page, query.pageSize, total),
    );
  }

  async issue(id: number) {
    const record = await this.getRecord(id);

    if (record.order.payment?.status !== PaymentStatus.PAID) {
      throw new BadRequestException('A encomenda ainda não está paga.');
    }

    const settings = await this.prisma.moloniSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings?.connected) {
      throw new BadRequestException('A ligação à Moloni não está validada.');
    }

    this.assertSettings(settings);

    if (record.invoiceStatus !== MoloniDocumentStatus.ISSUED) {
      const locked = await this.prisma.moloniFiscalDocument.updateMany({
        where: {
          id,
          OR: [
            {
              invoiceStatus: {
                in: [MoloniDocumentStatus.QUEUED, MoloniDocumentStatus.FAILED],
              },
            },
            {
              invoiceStatus: MoloniDocumentStatus.PROCESSING,
              lastAttemptAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
            },
          ],
        },
        data: {
          invoiceStatus: MoloniDocumentStatus.PROCESSING,
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
          lastError: null,
        },
      });

      if (locked.count !== 1) {
        throw new ConflictException('Este documento já está a ser processado.');
      }

      try {
        const customerId = await this.resolveCustomerId(record, settings.defaultCustomerId!);
        const existing = await this.moloniApi.getInvoiceByReference<MoloniDocumentResult>(
          String(record.order.id),
        );
        let result = existing;

        if (!result?.document_id) {
          const products = await this.buildInvoiceProducts(
            record,
            settings.defaultProductId!,
          );
          result = await this.moloniApi.insertInvoice<MoloniDocumentResult>({
              date: this.toDate(record.order.paidAt!),
              expiration_date: this.toDate(record.order.paidAt!),
              document_set_id: Number(settings.invoiceDocumentSetId),
              customer_id: Number(customerId),
              our_reference: String(record.order.id),
              your_reference: record.order.orderNumber,
              special_discount: this.toMoloniDiscountPercentage(
                Number(record.order.discount),
                Number(record.order.subtotal) + Number(record.order.deliveryFee),
              ),
              products,
              notes: `Encomenda ${record.order.orderNumber}`,
              status: 1,
            });
        }

        if (!result.document_id) {
          throw new Error('A Moloni não devolveu o ID da fatura.');
        }

        const issuedInvoice = await this.moloniApi.getInvoice<MoloniInvoice>(
          String(result.document_id),
        );
        const totalDifference = Math.abs(
          Number(issuedInvoice.net_value) - Number(record.order.total),
        );

        await this.prisma.moloniFiscalDocument.update({
          where: { id },
          data: {
            moloniCustomerId: String(customerId),
            invoiceStatus: MoloniDocumentStatus.ISSUED,
            invoiceId: String(result.document_id),
            invoiceIssuedAt: new Date(),
            lastError: totalDifference >= 0.005
              ? `A fatura Moloni difere ${totalDifference.toFixed(2)} EUR do total da encomenda.`
              : null,
          },
        });
      } catch (error) {
        await this.markFailure(id, 'invoiceStatus', error);
        throw error;
      }
    }

    const current = await this.getRecord(id);

    await this.sendInvoiceEmailIfNeeded(current);

    if (!settings.issueReceiptAfterPayment) {
      if (current.receiptStatus !== MoloniDocumentStatus.NOT_REQUIRED) {
        await this.prisma.moloniFiscalDocument.update({
          where: { id },
          data: { receiptStatus: MoloniDocumentStatus.NOT_REQUIRED },
        });
      }
      return ApiResponse.success(this.toResponse(await this.getRecord(id)));
    }

    if (current.receiptStatus !== MoloniDocumentStatus.ISSUED) {
      const locked = await this.prisma.moloniFiscalDocument.updateMany({
        where: {
          id,
          OR: [
            {
              receiptStatus: {
                in: [
                  MoloniDocumentStatus.NOT_REQUIRED,
                  MoloniDocumentStatus.QUEUED,
                  MoloniDocumentStatus.FAILED,
                ],
              },
            },
            {
              receiptStatus: MoloniDocumentStatus.PROCESSING,
              lastAttemptAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
            },
          ],
        },
        data: {
          receiptStatus: MoloniDocumentStatus.PROCESSING,
          lastAttemptAt: new Date(),
          lastError: null,
        },
      });

      if (locked.count !== 1) {
        throw new ConflictException('Este recibo já está a ser processado.');
      }

      try {
        const result = await this.moloniApi.insertReceipt<MoloniDocumentResult>({
          date: this.toDate(current.order.paidAt!),
          document_set_id: Number(settings.receiptDocumentSetId),
          customer_id: Number(current.moloniCustomerId),
          net_value: Number(current.order.total),
          associated_documents: [{
            associated_id: Number(current.invoiceId),
            value: Number(current.order.total),
          }],
          payments: [{
            payment_method_id: Number(settings.paymentMethodId),
            date: this.toDate(current.order.paidAt!),
            value: Number(current.order.total),
          }],
          notes: `Pagamento da encomenda ${current.order.orderNumber}`,
          status: 1,
        });

        if (!result.document_id) {
          throw new Error('A Moloni não devolveu o ID do recibo.');
        }

        await this.prisma.moloniFiscalDocument.update({
          where: { id },
          data: {
            receiptStatus: MoloniDocumentStatus.ISSUED,
            receiptId: String(result.document_id),
            receiptIssuedAt: new Date(),
            lastError: null,
          },
        });
      } catch (error) {
        await this.markFailure(id, 'receiptStatus', error);
        throw error;
      }
    }

    return ApiResponse.success(this.toResponse(await this.getRecord(id)));
  }

  async recordCreditNote(id: number, creditNoteId: string) {
    const record = await this.getRecord(id);
    if (
      !record.creditNoteRequiredAt ||
      record.invoiceStatus !== MoloniDocumentStatus.ISSUED ||
      record.order.payment?.status !== PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException('Esta encomenda não tem uma nota de crédito pendente.');
    }

    const moloniCreditNote = await this.moloniApi.getCreditNote<MoloniCreditNote>(
      creditNoteId.trim(),
    );
    const invoice = await this.getMoloniInvoice(record);
    const invoiceProductIds = new Set(
      invoice.products!.map((product) => product.document_product_id),
    );
    const matchesInvoice = moloniCreditNote.associated_documents?.some(
      (document) => String(document.associated_id) === record.invoiceId,
    );
    const linesMatchInvoice = Boolean(
      moloniCreditNote.products?.length &&
      moloniCreditNote.products.every(
        (product) => product.related_id && invoiceProductIds.has(product.related_id),
      ),
    );
    if (
      String(moloniCreditNote.document_id ?? '') !== creditNoteId.trim() ||
      String(moloniCreditNote.customer_id ?? '') !== record.moloniCustomerId ||
      moloniCreditNote.status !== 1 ||
      !matchesInvoice ||
      !linesMatchInvoice
    ) {
      throw new BadRequestException(
        'A nota de crédito Moloni não está fechada ou não corresponde à fatura desta encomenda.',
      );
    }

    const updated = await this.prisma.moloniFiscalDocument.update({
      where: { id },
      data: {
        creditNoteStatus: MoloniDocumentStatus.ISSUED,
        creditNoteId: creditNoteId.trim(),
        creditNoteRecordedAt: new Date(),
      },
      include: fiscalDocumentInclude,
    });

    return ApiResponse.success(this.toResponse(updated));
  }

  async issueCreditNote(id: number) {
    const record = await this.getRecord(id);
    if (
      !record.creditNoteRequiredAt ||
      record.invoiceStatus !== MoloniDocumentStatus.ISSUED ||
      record.order.payment?.status !== PaymentStatus.REFUNDED
    ) {
      throw new BadRequestException('Esta encomenda não tem uma nota de crédito pendente.');
    }

    if (record.creditNoteId) {
      return ApiResponse.success(this.toResponse(record));
    }

    const settings = await this.prisma.moloniSettings.findUnique({
      where: { id: 1 },
    });
    if (!settings?.connected) {
      throw new BadRequestException('A ligação à Moloni não está validada.');
    }
    if (!settings.creditNoteDocumentSetId) {
      throw new BadRequestException(
        'Configura a série de notas de crédito nas definições Moloni.',
      );
    }

    const locked = await this.prisma.moloniFiscalDocument.updateMany({
      where: {
        id,
        creditNoteId: null,
        OR: [
          {
            creditNoteStatus: {
              in: [
                MoloniDocumentStatus.NOT_REQUIRED,
                MoloniDocumentStatus.QUEUED,
                MoloniDocumentStatus.FAILED,
              ],
            },
          },
          {
            creditNoteStatus: MoloniDocumentStatus.PROCESSING,
            lastAttemptAt: { lt: new Date(Date.now() - 15 * 60 * 1000) },
          },
        ],
      },
      data: {
        creditNoteStatus: MoloniDocumentStatus.PROCESSING,
        attempts: { increment: 1 },
        lastAttemptAt: new Date(),
        lastError: null,
      },
    });
    if (locked.count !== 1) {
      throw new ConflictException('Esta nota de crédito já está a ser processada.');
    }

    try {
      const invoice = await this.getMoloniInvoice(record);
      const reference = `NC-${record.order.id}`;
      const existing = await this.moloniApi.getCreditNoteByReference<MoloniDocumentResult>(
        reference,
      );

      const products = invoice.products!.map((product, index) => {
      const taxes = product.taxes?.map((tax, taxIndex) => ({
        tax_id: tax.tax_id,
        value: tax.value,
        order: tax.order ?? taxIndex + 1,
        cumulative: tax.cumulative ?? 0,
      }));
      if (!product.exemption_reason && !taxes?.length) {
        throw new BadRequestException(
          `A linha ${index + 1} da fatura Moloni não contém imposto nem motivo de isenção.`,
        );
      }
      return {
        product_id: product.product_id,
        related_id: product.document_product_id,
        name: product.name,
        summary: product.summary || undefined,
        qty: product.qty,
        price: product.price,
        discount: product.discount || undefined,
        order: product.order ?? index + 1,
        ...(product.exemption_reason
          ? { exemption_reason: product.exemption_reason }
          : { taxes }),
      };
      });

      const associatedValue = Number(invoice.net_value ?? record.order.total);
      const result = existing?.document_id
        ? existing
        : await this.moloniApi.insertCreditNote<MoloniDocumentResult>({
          date: this.toDate(record.creditNoteRequiredAt),
          document_set_id: Number(settings.creditNoteDocumentSetId),
          customer_id: invoice.customer_id,
          our_reference: reference,
          your_reference: record.order.orderNumber,
          associated_documents: [{
            associated_id: Number(record.invoiceId),
            value: associatedValue,
          }],
          products,
          notes: `Anulação integral da fatura da encomenda ${record.order.orderNumber}`,
          status: 1,
          });

      if (!result.document_id) {
        throw new Error('A Moloni não devolveu o ID da nota de crédito.');
      }

      const updated = await this.prisma.moloniFiscalDocument.update({
        where: { id },
        data: {
          creditNoteStatus: MoloniDocumentStatus.ISSUED,
          creditNoteId: String(result.document_id),
          creditNoteRecordedAt: new Date(),
          lastError: null,
        },
        include: fiscalDocumentInclude,
      });
      return ApiResponse.success(this.toResponse(updated));
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Erro desconhecido da Moloni.';
      await this.prisma.moloniFiscalDocument.update({
        where: { id },
        data: {
          creditNoteStatus: MoloniDocumentStatus.FAILED,
          lastError: message.slice(0, 1000),
        },
      });
      throw error;
    }
  }

  private async getMoloniInvoice(
    record: FiscalDocumentRecord,
  ): Promise<MoloniInvoice> {
    if (!record.invoiceId) {
      throw new BadRequestException('A encomenda não tem uma fatura Moloni associada.');
    }
    const invoice = await this.moloniApi.getInvoice<MoloniInvoice>(record.invoiceId);
    if (
      String(invoice.document_id ?? '') !== record.invoiceId ||
      invoice.status !== 1 ||
      !invoice.customer_id ||
      !invoice.products?.length ||
      invoice.products.some(
        (product) =>
          !product.document_product_id ||
          !product.product_id ||
          !product.name ||
          !product.qty ||
          product.price === undefined,
      )
    ) {
      throw new BadRequestException(
        'A fatura Moloni não está fechada ou não contém as referências necessárias das linhas.',
      );
    }
    return invoice;
  }

  private async resolveCustomerId(
    record: FiscalDocumentRecord,
    defaultCustomerId: string,
  ): Promise<string> {
    const vat = record.order.customerTaxNumber?.trim();
    if (!vat) return defaultCustomerId;

    const customers = await this.moloniApi.getCustomersByVat<MoloniCustomer[]>(vat);
    const customer = customers[0];
    if (!customer?.customer_id) {
      throw new BadRequestException(
        `O cliente com NIF ${vat} não existe na Moloni. Cria-o antes de emitir a fatura.`,
      );
    }
    return String(customer.customer_id);
  }

  getPdf(id: number, kind: MoloniPdfDocumentKind) {
    return this.pdfService.getByFiscalDocumentId(id, kind);
  }

  private async buildInvoiceProducts(
    record: FiscalDocumentRecord,
    defaultProductId: string,
  ) {
    const taxIds = new Map<number, number>();

    for (const item of record.order.items) {
      if (!item.taxCodeId || item.taxRate === null) {
        throw new BadRequestException(
          `A linha "${item.name}" não tem um código de IVA associado.`,
        );
      }

      const rate = Number(item.taxRate);
      if (!taxIds.has(item.taxCodeId)) {
        taxIds.set(item.taxCodeId, await this.resolveMoloniTaxId(rate));
      }
    }

    return record.order.items.map((item, index) => {
      const rate = Number(item.taxRate);
      const unitNetPrice = Number(item.grossAmount) /
        item.quantity /
        (1 + rate / 100);

      return {
        product_id: Number(defaultProductId),
        name: item.name,
        summary: item.description || undefined,
        qty: item.quantity,
        price: Number(unitNetPrice.toFixed(8)),
        order: index + 1,
        taxes: [{
          tax_id: taxIds.get(item.taxCodeId!)!,
          value: rate,
          order: 1,
          cumulative: 0,
        }],
      };
    });
  }

  private async resolveMoloniTaxId(rate: number): Promise<number> {
    const taxes = await this.moloniApi.getTaxes<MoloniTax[]>({
      value: rate,
      type: 1,
      fiscal_zone: 'PT',
      active_by_default: 1,
    });
    const matches = taxes.filter(
      (tax) => tax.tax_id &&
        Number(tax.value) === rate &&
        tax.type === 1 &&
        tax.saft_type === 1,
    );

    if (matches.length !== 1) {
      throw new BadRequestException(
        `Não foi possível identificar de forma inequívoca o IVA de ${rate}% na Moloni.`,
      );
    }

    return matches[0].tax_id!;
  }

  private toMoloniDiscountPercentage(discount: number, grossBeforeDiscount: number): number {
    if (discount <= 0 || grossBeforeDiscount <= 0) return 0;
    return Number(((discount / grossBeforeDiscount) * 100).toFixed(8));
  }

  private async sendInvoiceEmailIfNeeded(
    record: FiscalDocumentRecord,
  ): Promise<void> {
    if (!record.invoiceId || record.invoiceEmailSentAt) return;

    try {
      const pdf = await this.pdfService.download(
        record.invoiceId,
        `fatura-${record.order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`,
      );

      const customerName = this.escapeHtml(
        `${record.order.customerFirstName} ${record.order.customerLastName}`.trim(),
      );
      const orderNumber = this.escapeHtml(record.order.orderNumber);
      const result = await this.emailService.sendEmail({
        to: record.order.customerEmail,
        subject: `Fatura da encomenda ${record.order.orderNumber}`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#2F3B2A;line-height:1.6;max-width:620px;margin:auto">
            <h1 style="font-size:24px">A sua fatura está disponível</h1>
            <p>Olá ${customerName},</p>
            <p>A fatura da encomenda <strong>${orderNumber}</strong> foi emitida e segue em anexo.</p>
            <p style="font-size:13px;color:#73796D">Pode também consultar o documento nos detalhes da encomenda.</p>
          </div>
        `,
        attachments: [{
          filename: pdf.filename,
          content: pdf.buffer,
          contentType: 'application/pdf',
        }],
      });
      await this.prisma.moloniFiscalDocument.update({
        where: { id: record.id },
        data: {
          invoiceEmailId: result.id,
          invoiceEmailSentAt: new Date(),
          invoiceEmailLastError: null,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido no envio da fatura.';
      await this.prisma.moloniFiscalDocument.update({
        where: { id: record.id },
        data: { invoiceEmailLastError: message.slice(0, 1000) },
      });
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private assertSettings(settings: {
    invoiceDocumentSetId: string | null;
    creditNoteDocumentSetId: string | null;
    receiptDocumentSetId: string | null;
    paymentMethodId: string | null;
    defaultCustomerId: string | null;
    defaultProductId: string | null;
    issueReceiptAfterPayment: boolean;
  }): void {
    if (
      !settings.invoiceDocumentSetId ||
      !settings.defaultCustomerId ||
      !settings.defaultProductId
    ) {
      throw new BadRequestException('A configuração fiscal da Moloni está incompleta.');
    }
    if (
      settings.issueReceiptAfterPayment &&
      (!settings.receiptDocumentSetId || !settings.paymentMethodId)
    ) {
      throw new BadRequestException('Configura a série de recibos e o método de pagamento.');
    }
  }

  private async getRecord(id: number): Promise<FiscalDocumentRecord> {
    const record = await this.prisma.moloniFiscalDocument.findUnique({
      where: { id },
      include: fiscalDocumentInclude,
    });
    if (!record) throw new NotFoundException('Documento fiscal não encontrado.');
    return record;
  }

  private async markFailure(
    id: number,
    field: 'invoiceStatus' | 'receiptStatus',
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : 'Erro desconhecido da Moloni.';
    await this.prisma.moloniFiscalDocument.update({
      where: { id },
      data: {
        [field]: MoloniDocumentStatus.FAILED,
        lastError: message.slice(0, 1000),
      },
    });
  }

  private toDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toResponse(record: FiscalDocumentRecord) {
    return {
      id: record.id,
      orderId: record.orderId,
      orderNumber: record.order.orderNumber,
      customerName: `${record.order.customerFirstName} ${record.order.customerLastName}`.trim(),
      customerEmail: record.order.customerEmail,
      customerTaxNumber: record.order.customerTaxNumber,
      total: Number(record.order.total),
      currency: record.order.payment?.currency ?? 'EUR',
      invoiceStatus: record.invoiceStatus,
      invoiceId: record.invoiceId,
      invoiceIssuedAt: record.invoiceIssuedAt,
      invoiceEmailId: record.invoiceEmailId,
      invoiceEmailSentAt: record.invoiceEmailSentAt,
      invoiceEmailLastError: record.invoiceEmailLastError,
      receiptStatus: record.receiptStatus,
      receiptId: record.receiptId,
      receiptIssuedAt: record.receiptIssuedAt,
      creditNoteRequiredAt: record.creditNoteRequiredAt,
      creditNoteStatus: record.creditNoteStatus,
      creditNoteId: record.creditNoteId,
      creditNoteRecordedAt: record.creditNoteRecordedAt,
      attempts: record.attempts,
      lastAttemptAt: record.lastAttemptAt,
      lastError: record.lastError,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
