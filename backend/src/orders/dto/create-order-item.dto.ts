import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    IsArray,
    IsInt,
    IsOptional,
    IsPositive,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class CreateOrderItemComponentDto {

    @ApiProperty({
        example: 1,
        description: 'ID of the product component.',
    })
    @IsInt()
    @IsPositive()
    componentId: number;

    @ApiProperty({
        example: 12,
        minimum: 1,
        description: 'Selected quantity of this component.',
    })
    @IsInt()
    @IsPositive()
    quantity: number;
}

export class CreateOrderItemDto {

    @ApiProperty({
        example: 1,
        description: 'Product ID.',
    })
    @IsInt()
    @IsPositive()
    productId: number;

    @ApiProperty({
        example: 1,
        minimum: 1,
        description: 'Quantity of the product.',
    })
    @IsInt()
    @IsPositive()
    quantity: number;

    @ApiPropertyOptional({
        example: 3,
        description: 'Selected variant ID. Required for products with variants.',
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    variantId?: number;

    @ApiPropertyOptional({
        type: [CreateOrderItemComponentDto],
        description: 'Selected components and their quantities.',
        example: [
            {
                componentId: 1,
                quantity: 12,
            },
            {
                componentId: 2,
                quantity: 3,
            },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemComponentDto)
    components?: CreateOrderItemComponentDto[];
}