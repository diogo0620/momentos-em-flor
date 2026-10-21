
import { ApiProperty } from '@nestjs/swagger';

export class AdminCategoryListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ example: true })
  active!: boolean;
}
