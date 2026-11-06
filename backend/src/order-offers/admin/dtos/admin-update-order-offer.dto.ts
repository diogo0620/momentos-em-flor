import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsDate,
    IsNumber,
    Min,
    MinDate,
    ValidateIf,
} from 'class-validator';

export class AdminUpdateOrderOfferDto {
    @ApiProperty({
        example: 49.90,
        description: 'Novo preço proposto à florista.',
        minimum: 0,
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price!: number;

    @ApiPropertyOptional({
        example: '2026-10-23T18:00:00.000Z',
        description: 'Nova data e hora de expiração da proposta. Deve ser futura.',
        type: String,
        format: 'date-time',
    })
    @ValidateIf((_object, value) => value !== undefined)
    @Type(() => Date)
    @IsDate()
    @MinDate(() => new Date(), {
        message: 'expiresAt must be a date in the future.',
    })
    expiresAt?: Date;
}
