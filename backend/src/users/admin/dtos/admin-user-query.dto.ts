import { BaseQueryDto } from '@/common/dto/base-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class AdminUserQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({
        enum: UserRole,
        example: UserRole.FLORIST,
        description: 'Filter by user role.',
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}