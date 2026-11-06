
import { Injectable } from '@nestjs/common';
import { MoloniSettings } from '@prisma/client';

import { AdminMoloniResponseDto } from '../dtos/admin-moloni-response.dto';

@Injectable()
export class AdminMoloniMapper {
  toResponse(
    settings: MoloniSettings | null,
  ): AdminMoloniResponseDto {
    if (!settings) {
      return {
        configured: false,
        hasCredentials: false,
        connected: false,
        lastConnectionCheckAt: null,
        lastConnectionError: null,
      issueReceiptAfterPayment: false,
      fiscalConfigurationComplete: false,
      };
    }

    return {
      configured: true,
      companyId: settings.companyId,
      clientId: settings.clientId,
      username: settings.username,
      hasCredentials: Boolean(
        settings.clientId &&
        settings.clientSecret &&
        settings.username &&
        settings.password,
      ),
      connected: settings.connected,
      lastConnectionCheckAt: settings.lastConnectionCheckAt,
      lastConnectionError: settings.lastConnectionError,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
      invoiceDocumentSetId: settings.invoiceDocumentSetId,
      creditNoteDocumentSetId: settings.creditNoteDocumentSetId,
      receiptDocumentSetId: settings.receiptDocumentSetId,
      paymentMethodId: settings.paymentMethodId,
      defaultCustomerId: settings.defaultCustomerId,
      defaultProductId: settings.defaultProductId,
      issueReceiptAfterPayment: settings.issueReceiptAfterPayment,
      fiscalConfigurationComplete: Boolean(
        settings.invoiceDocumentSetId &&
        settings.creditNoteDocumentSetId &&
        settings.defaultCustomerId &&
        settings.defaultProductId &&
        (!settings.issueReceiptAfterPayment ||
          (settings.receiptDocumentSetId && settings.paymentMethodId)),
      ),
    };
  }
}
