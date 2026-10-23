
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, Min, MinDate } from 'class-validator';

export class AdminCreateOrderOfferDto {
    @ApiProperty({
        example: 123,
        description: 'ID da encomenda à qual a proposta será associada.',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    orderId!: number;

    @ApiProperty({
        example: 5,
        description: 'ID da florista que receberá a proposta.',
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    floristId!: number;

    @ApiProperty({
        example: 45.90,
        description: 'Preço proposto à florista para a encomenda.',
        minimum: 0,
    })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price!: number;

    @ApiProperty({
        example: '2026-10-23T18:00:00.000Z',
        description: 'Data e hora de expiração da proposta. Deve ser futura.',
        type: String,
        format: 'date-time',
    })
    @Type(() => Date)
    @IsDate()
    @MinDate(() => new Date(), {
        message: 'expiresAt must be a date in the future.',
    })
    expiresAt!: Date;
}
