import { BadRequestException, Injectable } from '@nestjs/common';
import { MoloniSyncStatus, ProductType } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { MoloniApiService } from '../api/moloni-api.service';
import { MoloniSyncService } from '../sync/moloni-sync.service';

export type MoloniMappingType = 'customer' | 'product' | 'tax';

type MoloniCustomer = {
  customer_id?: number;
  vat?: string;
  number?: string;
  language_id?: number;
  address?: string;
  zip_code?: string;
  city?: string;
  country_id?: number;
  maturity_date_id?: number;
  payment_method_id?: number;
  copies?: Array<{ document_type_id: number; copies: number }>;
};

type MoloniProduct = {
  product_id?: number;
  category_id?: number;
  type?: number;
  unit_id?: number;
  has_stock?: number;
  stock?: number;
  pos_favorite?: number;
};

type MoloniTax = { tax_id?: number; value?: number | string };

@Injectable()
export class MoloniMappingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly api: MoloniApiService,
    private readonly sync: MoloniSyncService,
  ) {}

  async save(type: MoloniMappingType, localId: number, moloniId: number) {
    await this.assertLocalExists(type, localId);
    await this.assertRemoteExists(type, moloniId);
    await this.saveSuccess(type, localId, moloniId);
    return { saved: true, moloniId: String(moloniId) };
  }

  async integrate(type: MoloniMappingType, localId: number) {
    this.assertType(type);
    if (type === 'customer') return this.integrateCustomer(localId);
    if (type === 'product') return this.integrateProduct(localId);
    return this.validateTax(localId);
  }

  private async integrateCustomer(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { moloniSync: true },
    });
    if (!user) throw new BadRequestException('O cliente local não existe.');
    if (!this.normalizeVat(user.taxNumber)) {
      throw new BadRequestException(
        'Não é possível sincronizar um cliente sem NIF com a Moloni.',
      );
    }

    const currentId = this.positiveId(user.moloniSync?.moloniId);
    try {
      if (!currentId) {
        const settings = await this.prisma.moloniSettings.findUnique({
          where: { id: 1 },
          select: { paymentMethodId: true },
        });
        const createdId = await this.sync.resolveCustomer({
          userId: user.id,
          orderId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          taxNumber: user.taxNumber,
          address: 'Não indicada',
          postalCode: '0000-000',
          city: 'Não indicada',
          countryCode: 'PT',
          configuredPaymentMethodId: settings?.paymentMethodId,
        });
        return {
          moloniId: String(createdId),
          action: 'created',
          message: 'Cliente criado e associado na Moloni.',
        };
      }

      await this.markPending('customer', user.id);
      const remote = await this.api.getCustomer<MoloniCustomer>(
        String(currentId),
      );
      if (Number(remote.customer_id) !== currentId) {
        throw new BadRequestException(
          'O cliente associado não existe na Moloni.',
        );
      }
      await this.api.updateCustomer(String(currentId), {
        vat: this.normalizeVat(user.taxNumber) || remote.vat || '999999990',
        number: remote.number || `MEF-${user.id}`,
        name: `${user.firstName} ${user.lastName}`.trim(),
        language_id: remote.language_id,
        address: remote.address || 'Não indicada',
        zip_code: remote.zip_code || '0000-000',
        city: remote.city || 'Não indicada',
        country_id: remote.country_id,
        email: user.email,
        phone: user.phone,
        maturity_date_id: remote.maturity_date_id,
        payment_method_id: remote.payment_method_id,
        ...(remote.copies?.length ? { copies: remote.copies } : {}),
      });
      await this.saveSuccess('customer', user.id, currentId);
      return {
        moloniId: String(currentId),
        action: 'synced',
        message: 'Cliente sincronizado com a Moloni.',
      };
    } catch (error) {
      await this.saveFailure('customer', user.id, error);
      throw error;
    }
  }

  private async integrateProduct(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        moloniSync: true,
        taxCode: { include: { moloniSync: true } },
      },
    });
    if (!product) throw new BadRequestException('O produto local não existe.');

    const taxId = this.positiveId(product.taxCode.moloniSync?.moloniId);
    if (!taxId) {
      throw new BadRequestException(
        'O código de IVA do produto ainda não tem Moloni ID configurado.',
      );
    }
    await this.assertTaxRate(
      taxId,
      Number(product.taxCode.rate),
      product.taxCode.name,
    );

    const reference = `MEF-PRODUCT-${product.id}`;
    const rate = Number(product.taxCode.rate);
    const unitNetPrice = Number(product.customerPrice) / (1 + rate / 100);
    const currentId = this.positiveId(product.moloniSync?.moloniId);

    try {
      if (!currentId) {
        const createdId = await this.sync.resolveProduct({
          productId: product.id,
          reference,
          name: product.name,
          summary: null,
          unitNetPrice,
          moloniTaxId: taxId,
          taxRate: rate,
          type: product.type === ProductType.RENTAL ? 2 : 1,
        });
        return {
          moloniId: String(createdId),
          action: 'created',
          message: 'Produto criado e associado na Moloni.',
        };
      }

      await this.markPending('product', product.id);
      const remote = await this.api.getProduct<MoloniProduct>(
        String(currentId),
      );
      if (Number(remote.product_id) !== currentId) {
        throw new BadRequestException(
          'O produto associado não existe na Moloni.',
        );
      }
      if (!remote.category_id || !remote.unit_id) {
        throw new BadRequestException(
          'A Moloni não devolveu a categoria ou unidade do produto associado.',
        );
      }
      await this.api.updateProduct(String(currentId), {
        category_id: remote.category_id,
        type: product.type === ProductType.RENTAL ? 2 : (remote.type ?? 1),
        name: product.name,
        summary: '',
        reference,
        price: Number(unitNetPrice.toFixed(8)),
        unit_id: remote.unit_id,
        has_stock: remote.has_stock ?? 0,
        stock: remote.stock ?? 0,
        pos_favorite: remote.pos_favorite ?? 0,
        taxes: [
          {
            tax_id: taxId,
            value: rate,
            order: 1,
            cumulative: 0,
          },
        ],
      });
      await this.saveSuccess('product', product.id, currentId);
      return {
        moloniId: String(currentId),
        action: 'synced',
        message: 'Produto sincronizado com a Moloni.',
      };
    } catch (error) {
      await this.saveFailure('product', product.id, error);
      throw error;
    }
  }

  private async validateTax(taxCodeId: number) {
    const taxCode = await this.prisma.taxCode.findUnique({
      where: { id: taxCodeId },
      include: { moloniSync: true },
    });
    if (!taxCode)
      throw new BadRequestException('O código de IVA local não existe.');
    const moloniId = this.positiveId(taxCode.moloniSync?.moloniId);
    if (!moloniId) {
      throw new BadRequestException(
        'Introduz primeiro o Moloni ID do código de IVA.',
      );
    }

    try {
      await this.markPending('tax', taxCode.id);
      await this.assertTaxRate(moloniId, Number(taxCode.rate), taxCode.name);
      await this.saveSuccess('tax', taxCode.id, moloniId);
      return {
        moloniId: String(moloniId),
        action: 'validated',
        message: `Código de IVA validado na Moloni com a taxa de ${Number(taxCode.rate)}%.`,
      };
    } catch (error) {
      await this.saveFailure('tax', taxCode.id, error);
      throw error;
    }
  }

  private async assertTaxRate(
    moloniId: number,
    expectedRate: number,
    name: string,
  ) {
    const remote = await this.api.getTax<MoloniTax>(String(moloniId));
    if (Number(remote.tax_id) !== moloniId) {
      throw new BadRequestException(
        `O código de IVA "${name}" não existe na Moloni configurada.`,
      );
    }
    const remoteRate = Number(remote.value);
    if (
      !Number.isFinite(remoteRate) ||
      Math.abs(remoteRate - expectedRate) > 0.001
    ) {
      throw new BadRequestException(
        `A taxa do código de IVA não coincide: local ${expectedRate}% e Moloni ${Number.isFinite(remoteRate) ? `${remoteRate}%` : 'sem taxa válida'}.`,
      );
    }
  }

  private async assertLocalExists(type: MoloniMappingType, localId: number) {
    this.assertType(type);
    const local =
      type === 'customer'
        ? await this.prisma.user.findUnique({
            where: { id: localId },
            select: { id: true },
          })
        : type === 'product'
          ? await this.prisma.product.findUnique({
              where: { id: localId },
              select: { id: true },
            })
          : await this.prisma.taxCode.findUnique({
              where: { id: localId },
              select: { id: true },
            });
    if (!local) throw new BadRequestException('O registo local não existe.');
  }

  private async assertRemoteExists(type: MoloniMappingType, moloniId: number) {
    const remote =
      type === 'customer'
        ? await this.api.getCustomer<MoloniCustomer>(String(moloniId))
        : type === 'product'
          ? await this.api.getProduct<MoloniProduct>(String(moloniId))
          : await this.api.getTax<MoloniTax>(String(moloniId));
    const remoteId =
      type === 'customer'
        ? (remote as MoloniCustomer).customer_id
        : type === 'product'
          ? (remote as MoloniProduct).product_id
          : (remote as MoloniTax).tax_id;
    if (Number(remoteId) !== moloniId) {
      throw new BadRequestException(
        'O ID não corresponde a um registo da empresa Moloni configurada.',
      );
    }
  }

  private markPending(type: MoloniMappingType, localId: number) {
    const where = this.mappingWhere(type, localId);
    return this.prisma.moloniSync.upsert({
      where,
      create: {
        ...this.mappingRelation(type, localId),
        status: MoloniSyncStatus.PENDING,
        lastAttemptAt: new Date(),
      },
      update: {
        status: MoloniSyncStatus.PENDING,
        message: null,
        lastAttemptAt: new Date(),
      },
    });
  }

  private saveSuccess(
    type: MoloniMappingType,
    localId: number,
    moloniId: number,
  ) {
    const data = {
      moloniId: String(moloniId),
      status: MoloniSyncStatus.SYNCED,
      syncedAt: new Date(),
      lastAttemptAt: new Date(),
      message: null,
    };
    return this.prisma.moloniSync.upsert({
      where: this.mappingWhere(type, localId),
      create: { ...this.mappingRelation(type, localId), ...data },
      update: data,
    });
  }

  private saveFailure(
    type: MoloniMappingType,
    localId: number,
    error: unknown,
  ) {
    return this.prisma.moloniSync.upsert({
      where: this.mappingWhere(type, localId),
      create: {
        ...this.mappingRelation(type, localId),
        status: MoloniSyncStatus.FAILED,
        lastAttemptAt: new Date(),
        message: this.errorMessage(error),
      },
      update: {
        status: MoloniSyncStatus.FAILED,
        lastAttemptAt: new Date(),
        message: this.errorMessage(error),
      },
    });
  }

  private mappingWhere(type: MoloniMappingType, localId: number) {
    if (type === 'customer') return { userId: localId } as const;
    if (type === 'product') return { productId: localId } as const;
    return { taxCodeId: localId } as const;
  }

  private mappingRelation(type: MoloniMappingType, localId: number) {
    if (type === 'customer') return { userId: localId };
    if (type === 'product') return { productId: localId };
    return { taxCodeId: localId };
  }

  private positiveId(value: string | null | undefined) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  private normalizeVat(value: string | null) {
    return value?.replace(/\D/g, '') || null;
  }

  private errorMessage(error: unknown) {
    return (
      error instanceof Error ? error.message : 'Erro desconhecido da Moloni.'
    ).slice(0, 1000);
  }

  private assertType(type: string): asserts type is MoloniMappingType {
    if (!['customer', 'product', 'tax'].includes(type)) {
      throw new BadRequestException('Tipo de integração Moloni inválido.');
    }
  }
}
