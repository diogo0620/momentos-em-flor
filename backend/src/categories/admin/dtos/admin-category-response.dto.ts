
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

  @ApiProperty({
  })
  image!: string;

  @ApiProperty()
  featured!: boolean;

  @ApiProperty()
  active!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
