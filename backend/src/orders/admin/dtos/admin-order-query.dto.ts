import { BaseQueryDto } from "@/common/dto/base-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

export class AdminOrderQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({
        example: "Aveiro",
        description: 'Filter by district',
    })
    @IsOptional()
    @IsString()
    status?: OrderStatus;
}