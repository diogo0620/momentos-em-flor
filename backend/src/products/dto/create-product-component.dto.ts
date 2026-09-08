import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateProductComponentDto {

    @ApiProperty({
        example: 'Rosas',
        description:
            'Name of the component.',
    })
    name: string;

    @ApiProperty({
        example: 6,
        description:
            'Minimum quantity allowed for this component.',
    })
    minQuantity: number;

    @ApiProperty({
        example: 12,
        description:
            'Recommended quantity for this component.',
    })
    recommendedQuantity: number;

    @ApiProperty({
        example: 24,
        description:
            'Maximum quantity allowed for this component.',
    })
    maxQuantity: number;

    @ApiProperty({
        example: 2.50,
        description:
            'Additional amount charged to the customer for each unit above the minimum quantity.',
    })
    customerPricePerAdditionalUnit: number;

    @ApiProperty({
        example: 1.50,
        description:
            'Additional compensation paid to the florist for each unit above the minimum quantity.',
    })
    floristCompensationPerAdditionalUnit: number;

    @ApiPropertyOptional({
        example: true,
    })
    active?: boolean;

    @ApiPropertyOptional({
        example: 0,
        description:
            'Display order of the component.',
    })
    sortOrder?: number;
}
