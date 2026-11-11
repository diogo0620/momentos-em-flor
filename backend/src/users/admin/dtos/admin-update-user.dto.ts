import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional() @IsString() @MinLength(1) firstName?: string;
  @IsOptional() @IsString() @MinLength(1) lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsBoolean() active?: boolean;

  @ApiPropertyOptional({ example: 12345, nullable: true, description: 'ID do cliente correspondente na Moloni.' })
  @IsOptional() @IsInt() @Min(1) moloniId?: number | null;
}
