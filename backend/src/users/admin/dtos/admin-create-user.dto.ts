
import { IsStrongPassword } from '@/common/validators/password.validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    MinLength,
    ValidateIf,
} from 'class-validator';

export class AdminCreateUserDto {
    @ApiProperty({ example: 'Diogo' })
    @IsString()
    @MinLength(1)
    firstName!: string;

    @ApiProperty({ example: 'Silva' })
    @IsString()
    @MinLength(1)
    lastName!: string;

    @ApiProperty({ example: 'diogo@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'Admin123!',
        minLength: 8,
    })
    @IsString()
    @IsStrongPassword()
    password!: string;

    @ApiPropertyOptional({
        example: '+351912345678',
        nullable: true,
    })
    @IsString()
    phone!: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.CUSTOMER,
    })
    @IsEnum(UserRole)
    role!: UserRole;

    @ApiProperty({ example: true })
    @IsBoolean()
    active!: boolean;

    @ApiPropertyOptional({
        example: 1,
        nullable: true,
    })
    @IsOptional()
    @ValidateIf((user: AdminCreateUserDto) => user.role === UserRole.FLORIST)
    @IsInt()
    floristId?: number | null;
}
