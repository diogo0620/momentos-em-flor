import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class AdminUpdateStoreSettingsDto {
    @ApiProperty({
        example: 2.5,
        maxLength: 100,
      })
    @IsNumber()
    @Min(0)
    deliveryFee!: number;
}