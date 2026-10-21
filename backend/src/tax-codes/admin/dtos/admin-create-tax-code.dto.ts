
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNumber,
    IsOptional,
    IsString,
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
}
