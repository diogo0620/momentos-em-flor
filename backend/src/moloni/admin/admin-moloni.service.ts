
import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

import { MoloniEncryptionService } from '../encryption/moloni-encryption.service';
import { MoloniAuthService } from '../auth/moloni-auth.service';

import { AdminConfigureMoloniDto } from './dtos/admin-configure-moloni.dto';
import { AdminMoloniResponseDto } from './dtos/admin-moloni-response.dto';
import { AdminMoloniMapper } from './mappers/admin-moloni.mapper';
import { MoloniApiService } from '../api/moloni-api.service';

@Injectable()
export class AdminMoloniService {
  private readonly SETTINGS_ID = 1;

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: MoloniEncryptionService,
    private readonly authService: MoloniAuthService,
    private readonly moloniApiService: MoloniApiService,
    private readonly mapper: AdminMoloniMapper,
  ) {}

  async getSettings(): Promise<AdminMoloniResponseDto> {
    const settings = await this.prisma.moloniSettings.findUnique({
      where: {
        id: this.SETTINGS_ID,
      },
    });

    return this.mapper.toResponse(settings);
  }

  async updateSettings(
    dto: AdminConfigureMoloniDto,
  ): Promise<AdminMoloniResponseDto> {
    const current = await this.prisma.moloniSettings.findUnique({
      where: { id: this.SETTINGS_ID },
      select: {
        companyId: true,
        clientId: true,
        clientSecret: true,
        username: true,
        password: true,
      },
    });

    if ((!current && (!dto.clientSecret || !dto.password))) {
      throw new BadRequestException('O secret e a password são obrigatórios na configuração inicial.');
    }

    const credentialsChanged = !current ||
      current.companyId !== dto.companyId ||
      current.clientId !== dto.clientId ||
      current.username !== dto.username ||
      Boolean(dto.clientSecret) ||
      Boolean(dto.password);

    const settings = await this.prisma.moloniSettings.upsert({
      where: {
        id: this.SETTINGS_ID,
      },
      create: {
        id: this.SETTINGS_ID,
        companyId: dto.companyId,
        clientId: dto.clientId,
        clientSecret: this.encryptionService.encrypt(dto.clientSecret!),
        username: dto.username,
        password: this.encryptionService.encrypt(dto.password!),
        ...(credentialsChanged && {
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          connected: false,
          lastConnectionCheckAt: null,
          lastConnectionError: null,
        }),
        invoiceDocumentSetId: dto.invoiceDocumentSetId || null,
        creditNoteDocumentSetId: dto.creditNoteDocumentSetId || null,
        receiptDocumentSetId: dto.receiptDocumentSetId || null,
        paymentMethodId: dto.paymentMethodId || null,
        defaultCustomerId: dto.defaultCustomerId || null,
        defaultProductId: dto.defaultProductId || null,
        issueReceiptAfterPayment: dto.issueReceiptAfterPayment,
      },
      update: {
        companyId: dto.companyId,
        clientId: dto.clientId,
        ...(dto.clientSecret && {
          clientSecret: this.encryptionService.encrypt(dto.clientSecret),
        }),
        username: dto.username,
        ...(dto.password && {
          password: this.encryptionService.encrypt(dto.password),
        }),
        ...(credentialsChanged && {
          accessToken: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          connected: false,
          lastConnectionCheckAt: null,
          lastConnectionError: null,
        }),
        invoiceDocumentSetId: dto.invoiceDocumentSetId || null,
        creditNoteDocumentSetId: dto.creditNoteDocumentSetId || null,
        receiptDocumentSetId: dto.receiptDocumentSetId || null,
        paymentMethodId: dto.paymentMethodId || null,
        defaultCustomerId: dto.defaultCustomerId || null,
        defaultProductId: dto.defaultProductId || null,
        issueReceiptAfterPayment: dto.issueReceiptAfterPayment,
      },
    });

    return this.mapper.toResponse(settings);
  }

  async testConnection(): Promise<AdminMoloniResponseDto> {
    try {
      await this.authService.authenticate();

      await this.moloniApiService.getCompany();

      const settings = await this.prisma.moloniSettings.update({
        where: {
          id: this.SETTINGS_ID,
        },
        data: {
          connected: true,
          lastConnectionCheckAt: new Date(),
          lastConnectionError: null,
        },
      });

      return this.mapper.toResponse(settings);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível estabelecer ligação à Moloni.';

      const settings = await this.prisma.moloniSettings.update({
        where: {
          id: this.SETTINGS_ID,
        },
        data: {
          connected: false,
          lastConnectionCheckAt: new Date(),
          lastConnectionError: message,
        },
      });

      return this.mapper.toResponse(settings);
    }
  }
}
