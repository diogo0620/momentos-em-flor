
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
    IsInt,
    Max,
    Min,
} from 'class-validator';

export class AdminCreateTaxCodeDto {
    @ApiProperty({
        example: 'IVA Normal',
    })
    @IsString()
    name!: string;

    @ApiProperty({
        example: 'IVA Normal',
    })
    @IsString()
    description!: string;

    @ApiProperty({
        example: 23,
        description:
            'Tax rate as a percentage.',
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    rate!: number;

    @ApiPropertyOptional({
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiProperty({ example: 12345, description: 'ID do código de IVA correspondente na Moloni. O sistema não cria impostos automaticamente.' })
    @IsInt()
    @Min(1)
    moloniId!: number;
}
