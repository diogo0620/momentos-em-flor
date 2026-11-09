import { DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertCouponDto {
  @IsString() @MaxLength(50) code!: string;
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsEnum(DiscountType) type!: DiscountType;
  @Type(() => Number) @IsNumber() @Min(0.01) value!: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minimumOrderAmount?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0.01) maximumDiscountAmount?: number;
  @IsOptional() @IsDateString() startsAt?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) maximumRedemptions?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) maximumRedemptionsPerCustomer?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
