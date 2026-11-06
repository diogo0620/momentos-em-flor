import { ApiProperty } from '@nestjs/swagger';
import { OrderOfferDeclineReason } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class FloristDeclineOrderOfferDto {
    @ApiProperty({ enum: OrderOfferDeclineReason })
    @IsEnum(OrderOfferDeclineReason)
    declineReason!: OrderOfferDeclineReason;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    declineReasonDetails!: string;
}
