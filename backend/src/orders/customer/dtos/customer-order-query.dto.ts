import { BaseQueryDto } from "@/common/dto/base-query.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { CustomerOrderStatus } from "../customer-order-status";

export class CustomerOrderQueryDto extends BaseQueryDto {

    @ApiPropertyOptional({
        enum: CustomerOrderStatus,
        description: 'Estado público da encomenda',
    })
    @IsOptional()
    @IsEnum(CustomerOrderStatus)
    status?: CustomerOrderStatus;
}
