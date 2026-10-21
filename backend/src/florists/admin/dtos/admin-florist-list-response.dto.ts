
import { ApiProperty } from '@nestjs/swagger';

export class AdminFloristListResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  addressCity!: string;

  @ApiProperty()
  addressDistrict!: string;

  @ApiProperty({ example: true })
  acceptingOrders!: boolean;

  @ApiProperty({ example: true })
  active!: boolean;
}
