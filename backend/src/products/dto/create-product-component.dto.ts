import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductComponentDto {
    @ApiProperty({
        example: 'Rosas',
    })
    name: string;

    @ApiProperty({
        example: 6,
    })
    minQuantity: number;

    @ApiProperty({
        example: 12,
    })
    recommendedQuantity: number;

    @ApiProperty({
        example: 24,
    })
    maxQuantity: number;

    @ApiProperty({
        example: 2.50,
    })
    customerPricePerAdditionalUnit: number;

    @ApiProperty({
        example: 1.50,
    })
    floristCompensationPerAdditionalUnit: number;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;

    @ApiPropertyOptional({
        example: 0,
    })
    sortOrder?: number;
}