import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class AdminFloristQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({
        example: true,
        description: 'Filter by is accepting order status.',
    })
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    @IsOptional()
    @IsBoolean()
    acceptingOrders?: boolean;

    @ApiPropertyOptional({
        example: "Aveiro",
        description: 'Filter by district',
    })
    @IsOptional()
    @IsString()
    addressDistrict?: string;
}