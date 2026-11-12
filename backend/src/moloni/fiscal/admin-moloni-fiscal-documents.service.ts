import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MoloniDocumentStatus,
  OrderItemType,
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
import { SupabaseStorageService } from '@/storage/supabase-storage.service';
import { MoloniSyncService } from '../sync/moloni-sync.service';
import { formatOrderItemConfiguration } from '@/orders/order-item-configuration';

type MoloniDocumentResult = { valid?: number; document_id?: number };
type MoloniTax = {
  tax_id?: number;
  value?: number;
  type?: number;
  saft_type?: number;
};
type MoloniProduct = { product_id?: number };
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
      customerId: true,
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
          id: true,
          productId: true,
          type: true,
          name: true,
          variantType: true,
          variantName: true,
          quantity: true,
          imagePath: true,
          netAmount: true,
          grossAmount: true,
          taxCodeId: true,
          taxRate: true,
          components: { select: { componentName: true, quantity: true } },
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
    private readonly configService: ConfigService,
    private readonly storageService: SupabaseStorageService,
    private readonly moloniSync: MoloniSyncService,
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

  async findOne(id: number) {
    return ApiResponse.success(this.toResponse(await this.getRecord(id)));
  }

  async getRepairContext(id: number) {
    const document = await this.prisma.moloniFiscalDocument.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            customer: { include: { moloniSync: true } },
            items: {
              include: {
                product: { include: { moloniSync: true } },
                taxCode: { include: { moloniSync: true } },
              },
            },
          },
        },
      },
    });
    if (!document)
      throw new NotFoundException('Documento fiscal não encontrado.');
    const products = new Map<
      number,
      { localId: number; name: string; moloniId: string | null }
    >();
    const taxes = new Map<
      number,
      { localId: number; name: string; rate: number; moloniId: string | null }
    >();
    for (const item of document.order.items) {
      if (item.product)
        products.set(item.product.id, {
          localId: item.product.id,
          name: item.product.name,
          moloniId: item.product.moloniSync?.moloniId ?? null,
        });
      if (item.taxCode)
        taxes.set(item.taxCode.id, {
          localId: item.taxCode.id,
          name: item.taxCode.name,
          rate: Number(item.taxCode.rate),
          moloniId: item.taxCode.moloniSync?.moloniId ?? null,
        });
    }
    return ApiResponse.success({
      fiscalDocumentId: document.id,
      orderNumber: document.order.orderNumber,
      lastError: document.lastError,
      customer: document.order.customerId
        ? {
            localId: document.order.customerId,
            name: `${document.order.customerFirstName} ${document.order.customerLastName}`.trim(),
            moloniId: document.order.customer?.moloniSync?.moloniId ?? null,
          }
        : null,
      products: [...products.values()],
      taxes: [...taxes.values()],
    });
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
        const customerId = await this.resolveCustomerId(
          record,
          settings.paymentMethodId,
        );
        const existing =
          await this.moloniApi.getInvoiceByReference<MoloniDocumentResult>(
            String(record.order.id),
          );
        let result = existing;

        if (!result?.document_id) {
          const products = await this.buildInvoiceProducts(record);
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
            lastError:
              totalDifference >= 0.005
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
        const result = await this.moloniApi.insertReceipt<MoloniDocumentResult>(
          {
            date: this.toDate(current.order.paidAt!),
            document_set_id: Number(settings.receiptDocumentSetId),
            customer_id: Number(current.moloniCustomerId),
            net_value: Number(current.order.total),
            associated_documents: [
              {
                associated_id: Number(current.invoiceId),
                value: Number(current.order.total),
              },
            ],
            payments: [
              {
                payment_method_id: Number(settings.paymentMethodId),
                date: this.toDate(current.order.paidAt!),
                value: Number(current.order.total),
              },
            ],
            notes: `Pagamento da encomenda ${current.order.orderNumber}`,
            status: 1,
          },
        );

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
      throw new BadRequestException(
        'Esta encomenda não tem uma nota de crédito pendente.',
      );
    }

    const moloniCreditNote =
      await this.moloniApi.getCreditNote<MoloniCreditNote>(creditNoteId.trim());
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
        (product) =>
          product.related_id && invoiceProductIds.has(product.related_id),
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
      throw new BadRequestException(
        'Esta encomenda não tem uma nota de crédito pendente.',
      );
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
      throw new ConflictException(
        'Esta nota de crédito já está a ser processada.',
      );
    }

    try {
      const invoice = await this.getMoloniInvoice(record);
      const reference = `NC-${record.order.id}`;
      const existing =
        await this.moloniApi.getCreditNoteByReference<MoloniDocumentResult>(
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
            associated_documents: [
              {
                associated_id: Number(record.invoiceId),
                value: associatedValue,
              },
            ],
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
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido da Moloni.';
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
      throw new BadRequestException(
        'A encomenda não tem uma fatura Moloni associada.',
      );
    }
    const invoice = await this.moloniApi.getInvoice<MoloniInvoice>(
      record.invoiceId,
    );
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
    paymentMethodId: string | null,
  ): Promise<string> {
    const address = [
      record.order.deliveryStreet,
      record.order.deliveryStreetNumber,
      record.order.deliveryStreet2,
    ]
      .filter(Boolean)
      .join(', ');
    const customerId = await this.moloniSync.resolveCustomer({
      userId: record.order.customerId,
      orderId: record.order.id,
      firstName: record.order.customerFirstName,
      lastName: record.order.customerLastName,
      email: record.order.customerEmail,
      phone: record.order.customerPhone,
      taxNumber: record.order.customerTaxNumber,
      address,
      postalCode: record.order.deliveryPostalCode,
      city: record.order.deliveryCity,
      countryCode: record.order.deliveryCountryCode,
      configuredPaymentMethodId: paymentMethodId,
    });
    return String(customerId);
  }

  getPdf(id: number, kind: MoloniPdfDocumentKind) {
    return this.pdfService.getByFiscalDocumentId(id, kind);
  }

  private async buildInvoiceProducts(record: FiscalDocumentRecord) {
    const orderedItems = [
      ...record.order.items.filter(
        (item) => item.type !== OrderItemType.DELIVERY_FEE,
      ),
      ...record.order.items.filter(
        (item) => item.type === OrderItemType.DELIVERY_FEE,
      ),
    ];
    const taxIds = new Map<number, number>();

    for (const item of orderedItems) {
      if (!item.taxCodeId || item.taxRate === null) {
        throw new BadRequestException(
          `A linha "${item.name}" não tem um código de IVA associado.`,
        );
      }

      const rate = Number(item.taxRate);
      if (!taxIds.has(item.taxCodeId)) {
        taxIds.set(
          item.taxCodeId,
          await this.resolveMoloniTaxId(item.taxCodeId, rate),
        );
      }
    }

    const products: Array<Record<string, unknown>> = [];
    for (const [index, item] of orderedItems.entries()) {
      const rate = Number(item.taxRate);
      const unitNetPrice =
        Number(item.grossAmount) / item.quantity / (1 + rate / 100);
      const reference =
        item.type === OrderItemType.DELIVERY_FEE
          ? 'MEF-DELIVERY-FEE'
          : item.productId
            ? `MEF-PRODUCT-${item.productId}`
            : 'MEF-CUSTOM-ARRANGEMENT';
      const productId =
        item.type === OrderItemType.DELIVERY_FEE
          ? await this.resolveDeliveryMoloniProductId({
              unitNetPrice,
              moloniTaxId: taxIds.get(item.taxCodeId!)!,
              taxRate: rate,
            })
          : await this.moloniSync.resolveProduct({
              productId: item.productId,
              reference,
              name: item.name,
              summary: null,
              unitNetPrice,
              moloniTaxId: taxIds.get(item.taxCodeId!)!,
              taxRate: rate,
              type: 1,
            });

      products.push({
        product_id: productId,
        name: item.name,
        summary: formatOrderItemConfiguration(item) || undefined,
        qty: item.quantity,
        price: Number(unitNetPrice.toFixed(8)),
        order: index + 1,
        taxes: [
          {
            tax_id: taxIds.get(item.taxCodeId!)!,
            value: rate,
            order: 1,
            cumulative: 0,
          },
        ],
      });
    }
    return products;
  }

  private async resolveDeliveryMoloniProductId(input: {
    unitNetPrice: number;
    moloniTaxId: number;
    taxRate: number;
  }): Promise<number> {
    const settings = await this.prisma.storeSettings.findUnique({
      where: { id: 1 },
      select: { deliveryMoloniProductId: true },
    });
    const configuredId = Number(settings?.deliveryMoloniProductId);

    if (Number.isInteger(configuredId) && configuredId > 0) {
      const product = await this.moloniApi.getProduct<MoloniProduct>(
        String(configuredId),
      );
      if (Number(product.product_id) !== configuredId) {
        throw new BadRequestException(
          'O artigo de portes configurado não existe na Moloni. Corrige o ID nas definições e repete a emissão.',
        );
      }
      return configuredId;
    }

    const productId = await this.moloniSync.resolveProduct({
      productId: null,
      reference: 'MEF-DELIVERY-FEE',
      name: 'Taxa de entrega',
      summary: null,
      unitNetPrice: input.unitNetPrice,
      moloniTaxId: input.moloniTaxId,
      taxRate: input.taxRate,
      type: 2,
    });

    await this.prisma.storeSettings.update({
      where: { id: 1 },
      data: { deliveryMoloniProductId: String(productId) },
    });
    return productId;
  }

  private async resolveMoloniTaxId(
    taxCodeId: number,
    rate: number,
  ): Promise<number> {
    const mapped = await this.prisma.moloniSync.findUnique({
      where: { taxCodeId },
      select: { moloniId: true },
    });
    if (mapped?.moloniId) return Number(mapped.moloniId);
    throw new BadRequestException(
      `O código de IVA de ${rate}% não tem Moloni ID configurado. Abre o código de IVA no admin, associa o ID da Moloni e repete a emissão.`,
    );
  }

  private toMoloniDiscountPercentage(
    discount: number,
    grossBeforeDiscount: number,
  ): number {
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
      const itemsHtml = record.order.items
        .map((item) => {
          const image = item.imagePath
            ? `<img src="${this.escapeHtml(this.storageService.getPublicUrl(item.imagePath))}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:12px;" />`
            : '';

          return `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid #D6DEC8;">
            <tr>
              ${image ? `<td width="88" valign="top">${image}</td>` : ''}
              <td valign="top">
                <p style="margin:0;font-size:14px;line-height:1.5;"><strong>${this.escapeHtml(item.name)}</strong><span> — ${item.quantity} un.</span></p>
                ${this.configurationHtml(item)}
              </td>
            </tr>
          </table>
        `;
        })
        .join('');
      const result = await this.emailService.sendEmail({
        to: record.order.customerEmail,
        templateId: this.configService.getOrThrow<string>(
          'RESEND_TEMPLATE_INVOICE_ISSUED',
        ),
        variables: {
          CUSTOMER_NAME: customerName,
          ORDER_NUMBER: orderNumber,
          ITEMS_HTML: itemsHtml,
        },
        attachments: [
          {
            filename: pdf.filename,
            content: pdf.buffer,
            contentType: 'application/pdf',
          },
        ],
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
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido no envio da fatura.';
      await this.prisma.moloniFiscalDocument.update({
        where: { id: record.id },
        data: { invoiceEmailLastError: message.slice(0, 1000) },
      });
    }
  }

  private configurationHtml(
    item: Parameters<typeof formatOrderItemConfiguration>[0],
  ): string {
    const configuration = formatOrderItemConfiguration(item);
    return configuration
      ? `<p style="margin:4px 0 0;color:#66705F;font-size:13px;line-height:1.5;">${this.escapeHtml(configuration)}</p>`
      : '';
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
    issueReceiptAfterPayment: boolean;
  }): void {
    if (!settings.invoiceDocumentSetId) {
      throw new BadRequestException(
        'A configuração fiscal da Moloni está incompleta.',
      );
    }
    if (
      settings.issueReceiptAfterPayment &&
      (!settings.receiptDocumentSetId || !settings.paymentMethodId)
    ) {
      throw new BadRequestException(
        'Configura a série de recibos e o método de pagamento.',
      );
    }
  }

  private async getRecord(id: number): Promise<FiscalDocumentRecord> {
    const record = await this.prisma.moloniFiscalDocument.findUnique({
      where: { id },
      include: fiscalDocumentInclude,
    });
    if (!record)
      throw new NotFoundException('Documento fiscal não encontrado.');
    return record;
  }

  private async markFailure(
    id: number,
    field: 'invoiceStatus' | 'receiptStatus',
    error: unknown,
  ): Promise<void> {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido da Moloni.';
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
      customerId: record.order.customerId,
      customerName:
        `${record.order.customerFirstName} ${record.order.customerLastName}`.trim(),
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
