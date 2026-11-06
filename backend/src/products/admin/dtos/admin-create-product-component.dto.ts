import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCreateProductComponentDto {
    @ApiProperty({
        example: 'Rosas',
    })
    @IsString()
    @MinLength(1)
    name!: string;

    @ApiProperty({
        example: 6,
        minimum: 0,
    })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    minQuantity!: number;

    @ApiProperty({
        example: 12,
        minimum: 0,
    })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    recommendedQuantity!: number;

    @ApiProperty({
        example: 24,
        minimum: 0,
    })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    maxQuantity!: number;

    @ApiProperty({
        example: 2.5,
        minimum: 0,
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    customerPricePerAdditionalUnit!: number;

    @ApiProperty({
        example: 1.5,
        minimum: 0,
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    floristPricePerAdditionalUnit!: number;

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({
        example: 0,
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}