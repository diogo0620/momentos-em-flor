
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class AdminMoloniResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica se a integração com a Moloni está configurada.',
  })
  configured!: boolean;

  @ApiPropertyOptional({
    example: '403983',
    description: 'ID da empresa configurada na Moloni.',
  })
  companyId?: string;

  @ApiPropertyOptional({
    example: 'developer-id',
    description: 'Developer ID da aplicação Moloni.',
  })
  clientId?: string;

  @ApiPropertyOptional({
    example: 'utilizador@exemplo.pt',
    description: 'Nome de utilizador da conta Moloni.',
  })
  username?: string;

  @ApiProperty({
    example: true,
    description: 'Indica se existem credenciais guardadas.',
  })
  hasCredentials!: boolean;

  @ApiProperty({
    example: true,
    description: 'Indica se a última verificação de ligação foi bem-sucedida.',
  })
  connected!: boolean;

  @ApiPropertyOptional({
    example: '2026-10-30T10:00:00.000Z',
    nullable: true,
    description: 'Data da última verificação de ligação.',
  })
  lastConnectionCheckAt?: Date | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Mensagem da última verificação de ligação, caso tenha falhado.',
  })
  lastConnectionError?: string | null;

  @ApiPropertyOptional({
    example: '2026-10-29T16:00:00.000Z',
    description: 'Data de criação da configuração.',
  })
  createdAt?: Date;

  @ApiPropertyOptional({
    example: '2026-10-30T10:00:00.000Z',
    description: 'Data da última atualização da configuração.',
  })
  updatedAt?: Date;

  invoiceDocumentSetId?: string | null;
  creditNoteDocumentSetId?: string | null;
  receiptDocumentSetId?: string | null;
  paymentMethodId?: string | null;
  defaultCustomerId?: string | null;
  defaultProductId?: string | null;
  defaultTaxId?: string | null;
  defaultTaxRate?: string | null;
  issueReceiptAfterPayment!: boolean;
  fiscalConfigurationComplete!: boolean;
}
