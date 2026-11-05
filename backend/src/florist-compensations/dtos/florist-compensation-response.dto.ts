import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FloristCompensationStatus } from '@prisma/client';

export class FloristCompensationResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() orderId!: number;
  @ApiProperty() orderNumber!: string;
  @ApiProperty() floristId!: number;
  @ApiProperty() floristName!: string;
  @ApiProperty() amount!: number;
  @ApiPropertyOptional() customerTotal?: number;
  @ApiPropertyOptional() platformMargin?: number;
  @ApiProperty({ enum: FloristCompensationStatus })
  status!: FloristCompensationStatus;
  @ApiPropertyOptional() dueAt!: Date | null;
  @ApiPropertyOptional() paidAt!: Date | null;
  @ApiPropertyOptional() paymentReference!: string | null;
  @ApiPropertyOptional() paymentNotes!: string | null;
  @ApiPropertyOptional() cancelledAt!: Date | null;
  @ApiPropertyOptional() cancellationReason!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
