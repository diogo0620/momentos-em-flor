import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class CustomerCreatePaymentIntentDto {
  @ApiProperty({
    example: 'MF-2026-123456',
    description: 'Order number belonging to the authenticated customer.',
  })
  @IsString()
  @MaxLength(32)
  @Matches(/^MF-\d{4}-\d{6}$/)
  orderNumber!: string;
}
