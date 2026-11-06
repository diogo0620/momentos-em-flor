
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class AdminConfigureMoloniDto {
  @ApiProperty({
    example: '403983',
    description: 'ID da empresa na Moloni.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  companyId!: string;

  @ApiProperty({
    example: 'developer-id',
    description: 'Developer ID da aplicação Moloni.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  clientId!: string;

  @ApiPropertyOptional({
    example: 'developer-secret',
    description: 'Developer Secret da aplicação Moloni.',
    writeOnly: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  clientSecret?: string;

  @ApiProperty({
    example: 'utilizador@exemplo.pt',
    description: 'Nome de utilizador da conta Moloni.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  username!: string;

  @ApiPropertyOptional({
    example: 'password',
    description: 'Password da conta Moloni.',
    writeOnly: true,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2048)
  password?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  invoiceDocumentSetId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  creditNoteDocumentSetId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  receiptDocumentSetId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  paymentMethodId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  defaultCustomerId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  defaultProductId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @IsNumberString()
  defaultTaxId?: string;

  @ValidateIf((_object, value) => value !== '' && value !== undefined && value !== null)
  @Matches(/^\d{1,3}([.,]\d{1,2})?$/)
  defaultTaxRate?: string;

  @IsBoolean()
  issueReceiptAfterPayment!: boolean;
}
