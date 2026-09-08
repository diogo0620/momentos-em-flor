import {
    ApiProperty,
} from '@nestjs/swagger';

import {
    IsNumber,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class CreateTaxCodeDto {

    @ApiProperty({
        example: 'PT_NORMAL',
        description:
            'Unique tax code identifier.',
    })
    @IsString()
    code: string;

    @ApiProperty({
        example: 'IVA Normal',
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 23,
        description:
            'Tax rate as a percentage.',
    })
    @IsNumber()
    @Min(0)
    @Max(100)
    rate: number;
}