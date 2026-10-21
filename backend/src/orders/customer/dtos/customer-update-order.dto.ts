
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Occasion } from '@prisma/client';
import {
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class CustomerUpdateOrderDto {

    @ApiProperty({
        example: 'Maria',
    })
    @IsString()
    @MaxLength(100)
    recipientFirstName?: string;

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

    @ApiPropertyOptional({
        example:
            'Tocar à campainha e ligar antes de entregar.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    deliveryInstructions?: string;


    @ApiPropertyOptional({
        example:
            'Parabéns! Espero que tenhas um dia maravilhoso ❤️',
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    cardMessage?: string;
}
