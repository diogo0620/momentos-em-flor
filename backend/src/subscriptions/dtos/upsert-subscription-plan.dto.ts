import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertSubscriptionPlanDto {
  @IsString() @MaxLength(50) code!: string;
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @Type(() => Number) @IsNumber() @Min(0) monthlyPrice!: number;
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @IsOptional() @IsString() stripePriceId?: string;
  @IsOptional() @IsBoolean() free?: boolean;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() sortOrder?: number;
}
