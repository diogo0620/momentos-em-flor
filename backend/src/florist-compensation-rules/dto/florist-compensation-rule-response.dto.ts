import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

class CompensationProductResponseDto {

    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;
}

class CompensationVariantResponseDto {

    @ApiProperty()
    id: number;

    @ApiProperty()
    type: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional({
        nullable: true,
    })
    code: string | null;
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
    variantId: number | null;

    @ApiProperty()
    floristId: number;

    @ApiProperty()
    compensationAmount: number;

    @ApiProperty()
    active: boolean;

    @ApiProperty()
    product: CompensationProductResponseDto;

    @ApiPropertyOptional({
        nullable: true,
    })
    variant: CompensationVariantResponseDto | null;

    @ApiPropertyOptional({
        nullable: true,
    })
    florist: CompensationFloristResponseDto | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}