import {
    ApiProperty,
    ApiPropertyOptional,
} from '@nestjs/swagger';

import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
    DeliveryTimeSlot,
    Occasion,
} from '@prisma/client';

import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
    @ApiProperty({
        type: [CreateOrderItemDto],
        example: [
            {
                productId: 1,
                quantity: 1,
            },
            {
                productId: 2,
                quantity: 2,
            },
        ],
    })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];

    // Guest Customer

    @ApiPropertyOptional({
        example: 'João',
        description:
            'Customer first name. Required when placing an order as guest.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    customerFirstName?: string;

    @ApiPropertyOptional({
        example: 'Silva',
        description:
            'Customer last name.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    customerLastName?: string;

    @ApiPropertyOptional({
        example: 'joao@email.com',
        description:
            'Customer email. Email or phone is required for guest checkout.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    customerEmail?: string;

    @ApiPropertyOptional({
        example: '+351912345678',
        description:
            'Customer phone. Email or phone is required for guest checkout.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    customerPhone?: string;

    // Recipient

    @ApiProperty({
        example: 'Maria',
    })
    @IsString()
    @MaxLength(100)
    recipientFirstName: string;

    @ApiPropertyOptional({
        example: 'Silva',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    recipientLastName?: string;

    @ApiPropertyOptional({
        example: '+351912345678',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    recipientPhone?: string;

    @ApiPropertyOptional({
        enum: Occasion,
        example: Occasion.BIRTHDAY,
    })
    @IsOptional()
    @IsEnum(Occasion)
    occasion?: Occasion;

    // Delivery

    @ApiProperty({
        example: '2026-08-20',
        description:
            'Requested delivery date.',
    })
    @IsDateString()
    deliveryDate: string;

    @ApiProperty({
        enum: DeliveryTimeSlot,
        example: DeliveryTimeSlot.AFTERNOON,
    })
    @IsEnum(DeliveryTimeSlot)
    deliveryTimeSlot: DeliveryTimeSlot;

    @ApiPropertyOptional({
        example:
            'Tocar à campainha e ligar antes de entregar.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    deliveryInstructions?: string;

    // Delivery address

    @ApiProperty({
        example: 'Rua de Santa Catarina, 100',
    })
    @IsString()
    @MaxLength(255)
    deliveryStreet: string;

    @ApiPropertyOptional({
        example: '2º Esq.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    deliveryStreet2?: string;

    @ApiProperty({
        example: '4000-447',
    })
    @IsString()
    @MaxLength(20)
    deliveryPostalCode: string;

    @ApiProperty({
        example: 'Porto',
    })
    @IsString()
    @MaxLength(100)
    deliveryCity: string;

    @ApiProperty({
        example: 'Porto',
    })
    @IsString()
    @MaxLength(100)
    deliveryDistrict: string;

    @ApiProperty({
        example: 'PT',
    })
    @IsString()
    @MaxLength(2)
    deliveryCountryCode: string;


    // Card

    @ApiPropertyOptional({
        example:
            'Parabéns! Espero que tenhas um dia maravilhoso ❤️',
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    cardMessage?: string;
}