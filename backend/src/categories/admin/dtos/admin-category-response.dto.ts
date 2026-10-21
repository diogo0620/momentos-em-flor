
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCategoryResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ example: 'Bouquets' })
  name!: string;

  @ApiProperty({ example: 'bouquets' })
  slug!: string;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Beautiful flower bouquets.',
  })
  description!: string | null;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
