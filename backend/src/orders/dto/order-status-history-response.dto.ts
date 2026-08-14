import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { OrderStatus, UserRole } from "@prisma/client";

export class OrderStatusHistoryResponseDto {
    @ApiProperty()
    id: number;

    @ApiPropertyOptional({
        enum: OrderStatus,
    })
    fromStatus: OrderStatus | null;

    @ApiProperty({
        enum: OrderStatus,
    })
    toStatus: OrderStatus;

    @ApiPropertyOptional()
    changedByUserId: number | null;

    @ApiPropertyOptional()
    changedByUser: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: UserRole;
    } | null;

    @ApiPropertyOptional()
    reason: string | null;

    @ApiProperty()
    createdAt: Date;
}