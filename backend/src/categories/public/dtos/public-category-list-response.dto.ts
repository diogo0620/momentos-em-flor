
import { ApiProperty } from '@nestjs/swagger';

export class PublicCategoryListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}
