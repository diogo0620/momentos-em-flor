
import { BadRequestException, Injectable } from '@nestjs/common';
import { MoloniSyncStatus } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { MoloniApiService } from '../api/moloni-api.service';

type MoloniCustomer = { customer_id?: number };
type MoloniProduct = { product_id?: number; reference?: string };
type MoloniInsertResult = {
  valid?: number;
  customer_id?: number;
  product_id?: number;
  category_id?: number;
};
type MoloniLanguage = { language_id?: number; code?: string };
type MoloniCountry = { country_id?: number; iso_3166_1?: string };
type MoloniMaturityDate = { maturity_date_id?: number; days?: number };
type MoloniPaymentMethod = { payment_method_id?: number; active_by_default?: number };
type MoloniDocumentType = { document_type_id?: number; saft_code?: string };
type MoloniMeasurementUnit = { unit_id?: number; name?: string; short_name?: string };
type MoloniProductCategory = { category_id?: number; name?: string };

export type MoloniCustomerSyncInput = {
  userId: number | null;
  orderId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  taxNumber: string | null;
  address: string;
  postalCode: string;
  city: string;
  countryCode: string;
  configuredPaymentMethodId?: string | null;
};

export type MoloniProductSyncInput = {
  productId: number | null;
  reference: string;
  name: string;
  summary?: string | null;
  unitNetPrice: number;
  moloniTaxId: number;
  taxRate: number;
  type: 1 | 2;
};

@Injectable()
export class MoloniSyncService {
  private categoryId?: number;
  private unitId?: number;
  private pendingCategoryId?: Promise<number>;
  private readonly pendingCustomers = new Map<string, Promise<number>>();
  private readonly pendingProducts = new Map<string, Promise<number>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly moloniApi: MoloniApiService,
  ) {}

  async resolveCustomer(input: MoloniCustomerSyncInput): Promise<number> {
    const key = input.userId ? `user:${input.userId}` : `order:${input.orderId}`;
    const pending = this.pendingCustomers.get(key);
    if (pending) return pending;

    const operation = this.resolveCustomerInternal(input).finally(() => {
      this.pendingCustomers.delete(key);
    });
    this.pendingCustomers.set(key, operation);
    return operation;
  }

  private async resolveCustomerInternal(input: MoloniCustomerSyncInput): Promise<number> {
    const current = input.userId
      ? await this.prisma.moloniSync.findUnique({
          where: { userId: input.userId },
          select: { moloniId: true },
        })
      : null;
    if (current?.moloniId) return Number(current.moloniId);

    if (input.userId) await this.markCustomerPending(input.userId);

    try {
      const vat = this.normalizeVat(input.taxNumber);
      if (vat) {
        const matches = await this.moloniApi.getCustomersByVat<MoloniCustomer[]>(vat);
        if (matches[0]?.customer_id) {
          if (input.userId) await this.markCustomerSynced(input.userId, matches[0].customer_id);
          return matches[0].customer_id;
        }
      }

      const defaults = await this.resolveCustomerDefaults(
        input.countryCode,
        input.configuredPaymentMethodId,
      );
      const customerNumber = input.userId ? `MEF-${input.userId}` : `MEF-O-${input.orderId}`;
      const existingByNumber = await this.moloniApi.getCustomersByNumber<MoloniCustomer[]>(
        customerNumber,
      );
      if (existingByNumber[0]?.customer_id) {
        if (input.userId) {
          await this.markCustomerSynced(input.userId, existingByNumber[0].customer_id);
        }
        return existingByNumber[0].customer_id;
      }



      const result = await this.moloniApi.insertCustomer<MoloniInsertResult>({
        vat: vat || '999999990',
        number: customerNumber,
        name: `${input.firstName} ${input.lastName}`.trim(),
        language_id: defaults.languageId,
        address: input.address || 'Não indicada',
        zip_code: input.postalCode,
        city: input.city || 'Não indicada',
        country_id: defaults.countryId,
        email: input.email,
        phone: input.phone,
        salesman_id: 0,
        payment_day: 0,
        discount: 0,
        credit_limit: 0,
        delivery_method_id: 0,
        maturity_date_id: defaults.maturityDateId,
        payment_method_id: defaults.paymentMethodId,
      });

      if (!result.customer_id) {
        throw new BadRequestException('A Moloni não devolveu o ID do cliente criado.');
      }

      if (input.userId) await this.markCustomerSynced(input.userId, result.customer_id);
      return result.customer_id;
    } catch (error) {
      if (input.userId) await this.markCustomerFailed(input.userId, error);
      throw error;
    }
  }

  async resolveProduct(input: MoloniProductSyncInput): Promise<number> {
    const pending = this.pendingProducts.get(input.reference);
    if (pending) return pending;

    const operation = this.resolveProductInternal(input).finally(() => {
      this.pendingProducts.delete(input.reference);
    });
    this.pendingProducts.set(input.reference, operation);
    return operation;
  }

  private async resolveProductInternal(input: MoloniProductSyncInput): Promise<number> {
    if (input.productId) {
      const current = await this.prisma.moloniSync.findUnique({
        where: { productId: input.productId },
        select: { moloniId: true },
      });
      if (current?.moloniId) return Number(current.moloniId);
      await this.markProductPending(input.productId);
    }

    try {
      const matches = await this.moloniApi.getProductsByReference<MoloniProduct[]>(input.reference);
      let moloniId = matches.find(
        (product) => product.reference === input.reference,
      )?.product_id;

      if (!moloniId) {
        const [categoryId, unitId] = await Promise.all([
          this.resolveProductCategoryId(),
          this.resolveMeasurementUnitId(),
        ]);
        const result = await this.moloniApi.insertProduct<MoloniInsertResult>({
          category_id: categoryId,
          type: input.type,
          name: input.name,
          summary: input.summary || '',
          reference: input.reference,
          price: Number(input.unitNetPrice.toFixed(8)),
          unit_id: unitId,
          has_stock: 0,
          stock: 0,
          pos_favorite: 0,
          taxes: [{
            tax_id: input.moloniTaxId,
            value: input.taxRate,
            order: 1,
            cumulative: 0,
          }],
        });
        moloniId = result.product_id;
      }

      if (!moloniId) {
        throw new BadRequestException('A Moloni não devolveu o ID do produto criado.');
      }

      if (input.productId) await this.markProductSynced(input.productId, moloniId);
      return moloniId;
    } catch (error) {
      if (input.productId) await this.markProductFailed(input.productId, error);
      throw error;
    }
  }

  private async resolveCustomerDefaults(
    countryCode: string,
    configuredPaymentMethodId?: string | null,
  ) {
    const [languages, countries, maturityDates, paymentMethods] = await Promise.all([
      this.moloniApi.getLanguages<MoloniLanguage[]>(),
      this.moloniApi.getCountries<MoloniCountry[]>(),
      this.moloniApi.getMaturityDates<MoloniMaturityDate[]>(),
      this.moloniApi.getPaymentMethods<MoloniPaymentMethod[]>(),
    ]);
    const language = languages.find((item) => item.code?.toLowerCase() === 'pt') || languages[0];
    const country = countries.find(
      (item) => item.iso_3166_1?.toUpperCase() === countryCode.toUpperCase(),
    );
    const maturityDate = maturityDates.find((item) => item.days === 0) || maturityDates[0];
    const configuredPaymentMethod = Number(configuredPaymentMethodId);
    const paymentMethod = paymentMethods.find(
      (item) => configuredPaymentMethod > 0 && item.payment_method_id === configuredPaymentMethod,
    ) || paymentMethods.find((item) => item.active_by_default === 1) || paymentMethods[0];

    if (!language?.language_id || !country?.country_id ||
        !maturityDate?.maturity_date_id || !paymentMethod?.payment_method_id) {
      throw new BadRequestException(
        'Não foi possível obter as definições necessárias para criar o cliente na Moloni.',
      );
    }

    const documentTypes = await this.moloniApi.getDocumentTypes<MoloniDocumentType[]>(
      language.language_id,
    );
    const documentType = documentTypes.find((item) => item.saft_code === 'FT');
    if (!documentType?.document_type_id) {
      throw new BadRequestException('A Moloni não devolveu o tipo de documento Fatura.');
    }

    return {
      languageId: language.language_id,
      countryId: country.country_id,
      maturityDateId: maturityDate.maturity_date_id,
      paymentMethodId: paymentMethod.payment_method_id,
      documentTypeId: documentType.document_type_id,
    };
  }

  private async resolveProductCategoryId(): Promise<number> {
    if (this.categoryId) return this.categoryId;
    if (this.pendingCategoryId) return this.pendingCategoryId;
    this.pendingCategoryId = this.loadOrCreateProductCategoryId().finally(() => {
      this.pendingCategoryId = undefined;
    });
    return this.pendingCategoryId;
  }

  private async loadOrCreateProductCategoryId(): Promise<number> {
    const categories = await this.moloniApi.getProductCategories<MoloniProductCategory[]>();
    const existing = categories.find(
      (category) => category.name?.trim().toLowerCase() === 'momentos em flor',
    );
    if (existing?.category_id) {
      this.categoryId = existing.category_id;
      return existing.category_id;
    }

    const created = await this.moloniApi.insertProductCategory<MoloniInsertResult>({
      parent_id: 0,
      name: 'Momentos em Flor',
      description: 'Produtos sincronizados automaticamente pela plataforma.',
      pos_enabled: 1,
    });
    if (!created.category_id) {
      throw new BadRequestException('Não foi possível criar a categoria de produtos na Moloni.');
    }
    this.categoryId = created.category_id;
    return created.category_id;
  }

  private async resolveMeasurementUnitId(): Promise<number> {
    if (this.unitId) return this.unitId;
    const units = await this.moloniApi.getMeasurementUnits<MoloniMeasurementUnit[]>();
    const unit = units.find((item) => {
      const value = `${item.short_name || ''} ${item.name || ''}`.toLowerCase();
      return /(^|\s)(un|uni|unidade)(\s|$)/.test(value);
    }) || units[0];
    if (!unit?.unit_id) {
      throw new BadRequestException('A Moloni não devolveu uma unidade de medida válida.');
    }
    this.unitId = unit.unit_id;
    return unit.unit_id;
  }

  private normalizeVat(value: string | null): string | null {
    const vat = value?.replace(/\D/g, '') || '';
    return vat.length ? vat : null;
  }

  private markCustomerPending(userId: number) {
    return this.prisma.moloniSync.upsert({
      where: { userId },
      create: { userId, status: MoloniSyncStatus.PENDING, lastAttemptAt: new Date() },
      update: { status: MoloniSyncStatus.PENDING, message: null, lastAttemptAt: new Date() },
    });
  }

  private markCustomerSynced(userId: number, moloniId: number) {
    return this.prisma.moloniSync.update({
      where: { userId },
      data: { moloniId: String(moloniId), status: MoloniSyncStatus.SYNCED, syncedAt: new Date(), message: null },
    });
  }

  private markCustomerFailed(userId: number, error: unknown) {
    return this.prisma.moloniSync.update({
      where: { userId },
      data: { status: MoloniSyncStatus.FAILED, message: this.errorMessage(error) },
    });
  }

  private markProductPending(productId: number) {
    return this.prisma.moloniSync.upsert({
      where: { productId },
      create: { productId, status: MoloniSyncStatus.PENDING, lastAttemptAt: new Date() },
      update: { status: MoloniSyncStatus.PENDING, message: null, lastAttemptAt: new Date() },
    });
  }

  private markProductSynced(productId: number, moloniId: number) {
    return this.prisma.moloniSync.update({
      where: { productId },
      data: { moloniId: String(moloniId), status: MoloniSyncStatus.SYNCED, syncedAt: new Date(), message: null },
    });
  }

  private markProductFailed(productId: number, error: unknown) {
    return this.prisma.moloniSync.update({
      where: { productId },
      data: { status: MoloniSyncStatus.FAILED, message: this.errorMessage(error) },
    });
  }

  private errorMessage(error: unknown): string {
    return (error instanceof Error ? error.message : 'Erro desconhecido da Moloni.').slice(0, 1000);
  }
}
