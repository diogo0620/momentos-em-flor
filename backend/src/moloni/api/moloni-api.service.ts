
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { MoloniAuthService } from '../auth/moloni-auth.service';

type MoloniRequestParams = Record<string, unknown>;

@Injectable()
export class MoloniApiService {
  private readonly apiBaseUrl = 'https://api.moloni.pt/v1/';

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: MoloniAuthService,
  ) { }

  async getCompany(): Promise<unknown> {
    return this.post("companies/getOne/");
  }

  // ============================================================
  // PRODUCTS
  // ============================================================

  async insertProduct<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('products/insert/', params);
  }

  async getProduct<T>(productId: string): Promise<T> {
    return this.post<T>('products/getOne/', {
      product_id: productId,
    });
  }

  async updateProduct<T>(
    productId: string,
    params: MoloniRequestParams,
  ): Promise<T> {
    return this.post<T>('products/update/', {
      ...params,
      product_id: productId,
    });
  }

  // ============================================================
  // TAXES
  // ============================================================

  async insertTax<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('taxes/insert/', params);
  }

  async getTax<T>(taxId: string): Promise<T> {
    return this.post<T>('taxes/getOne/', {
      tax_id: taxId,
    });
  }

  async updateTax<T>(
    taxId: string,
    params: MoloniRequestParams,
  ): Promise<T> {
    return this.post<T>('taxes/update/', {
      ...params,
      tax_id: taxId,
    });
  }

  // ============================================================
  // CUSTOMERS
  // ============================================================

  async insertCustomer<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('customers/insert/', params);
  }

  async getCustomer<T>(customerId: string): Promise<T> {
    return this.post<T>('customers/getOne/', {
      customer_id: customerId,
    });
  }

  async updateCustomer<T>(
    customerId: string,
    params: MoloniRequestParams,
  ): Promise<T> {
    return this.post<T>('customers/update/', {
      ...params,
      customer_id: customerId,
    });
  }

  async getCustomersByVat<T>(vat: string): Promise<T> {
    return this.post<T>('customers/getByVat/', { vat, qty: 1 });
  }

  // ============================================================
  // FISCAL DOCUMENTS
  // ============================================================

  async insertInvoice<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('invoices/insert/', params);
  }

  async getInvoiceByReference<T>(reference: string): Promise<T> {
    return this.post<T>('invoices/getOne/', {
      our_reference: reference,
    });
  }

  async getInvoice<T>(invoiceId: string): Promise<T> {
    return this.post<T>('invoices/getOne/', {
      document_id: invoiceId,
    });
  }

  async getDocumentPdfLink<T>(documentId: string): Promise<T> {
    return this.post<T>('documents/getPDFLink/', {
      document_id: documentId,
      signed: 1,
    });
  }

  async insertReceipt<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('receipts/insert/', params);
  }

  async getCreditNote<T>(creditNoteId: string): Promise<T> {
    return this.post<T>('creditNotes/getOne/', {
      document_id: creditNoteId,
    });
  }

  async getCreditNoteByReference<T>(reference: string): Promise<T> {
    return this.post<T>('creditNotes/getOne/', {
      our_reference: reference,
    });
  }

  async insertCreditNote<T>(params: MoloniRequestParams): Promise<T> {
    return this.post<T>('creditNotes/insert/', params);
  }

  // ============================================================
  // INTERNAL HTTP
  // ============================================================

  private async post<T>(
    endpoint: string,
    params: MoloniRequestParams = {},
  ): Promise<T> {
    const accessToken =
      await this.authService.getValidAccessToken();

    const companyId = await this.getCompanyId();

    const url = new URL(endpoint, this.apiBaseUrl);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('json', 'true');
    url.searchParams.set('human_errors', 'true');

    const body = {
      ...params,
      company_id: companyId,
    };

    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível estabelecer ligação com a Moloni.',
      );
    }

    let result: unknown;

    try {
      result = await response.json();
    } catch {
      throw new ServiceUnavailableException(
        'A Moloni devolveu uma resposta inválida.',
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        'A Moloni não conseguiu processar o pedido.',
      );
    }

    if (
      result &&
      typeof result === 'object' &&
      !Array.isArray(result)
    ) {
      const error = result as {
        error?: string;
        error_description?: string;
        message?: string;
      };

      if (error.error || error.error_description) {
        throw new ServiceUnavailableException(
          error.error_description ||
          error.message ||
          error.error,
        );
      }
    }

    return result as T;
  }

  private async getCompanyId(): Promise<string> {
    const settings = await this.prisma.moloniSettings.findUnique({
      where: { id: 1 },
      select: { companyId: true },
    });

    if (!settings?.companyId) {
      throw new InternalServerErrorException(
        'O company ID da Moloni não está configurado.',
      );
    }

    return settings.companyId;
  }
}
