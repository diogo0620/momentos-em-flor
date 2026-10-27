import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
} from 'class-validator';
import { OrderOfferDeclineReason } from '@prisma/client';

export class AdminDeclineOrderOfferDto {
    @ApiProperty({ enum: OrderOfferDeclineReason })
    @IsEnum(OrderOfferDeclineReason)
    declineReason!: OrderOfferDeclineReason;

    @ApiProperty({
        example: 'O valor não cobre o custo das flores e da deslocação.',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    declineReasonDetails!: string;
}