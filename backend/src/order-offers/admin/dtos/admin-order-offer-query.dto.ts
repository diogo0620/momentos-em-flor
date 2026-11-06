import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { OrderOfferStatus } from '@prisma/client';
import { BaseQueryDto } from '@/common/dto/base-query.dto';


export class AdminOrderOfferQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({
        enum: OrderOfferStatus,
        example: OrderOfferStatus.PENDING,
        description: 'Filter by offer status.',
    })
    @IsOptional()
    @IsEnum(OrderOfferStatus)
    status?: OrderOfferStatus;

    @ApiPropertyOptional({
        example: 123,
        description: 'Filter by order ID.',
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    orderId?: number;

    @ApiPropertyOptional({
        example: 5,
        description: 'Filter by florist ID.',
    })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    @Min(1)
    floristId?: number;
}
