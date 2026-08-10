import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CompensationProductResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

class CompensationFloristResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

export class FloristCompensationRuleResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productId: number;

  @ApiPropertyOptional({
    nullable: true,
  })
  floristId: number | null;

  @ApiProperty()
  compensationAmount: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  product: CompensationProductResponseDto;

  @ApiPropertyOptional({
    nullable: true,
  })
  florist: CompensationFloristResponseDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}