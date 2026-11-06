import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderOfferStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class FloristOrderOfferQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ enum: OrderOfferStatus })
    @IsOptional()
    @IsEnum(OrderOfferStatus)
    status?: OrderOfferStatus;
}
