import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AdminUpdateStoreSettingsDto {
    @IsString()
    @MaxLength(120)
    companyName!: string;

    @IsOptional()
    @IsEmail()
    @MaxLength(254)
    contactEmail?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    contactPhone?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(40)
    whatsappNumber?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    companyAddress?: string | null;

    @IsOptional()
    @IsEmail()
    @MaxLength(254)
    partnerEmail?: string | null;

    @ApiProperty({
        example: 2.5,
        maxLength: 100,
      })
    @IsNumber()
    @Min(0)
    deliveryFee!: number;

    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    deliveryTaxCodeId!: number;

    @ApiProperty({ example: 123456789, nullable: true, required: false })
    @IsOptional()
    @IsInt()
    @Min(1)
    deliveryMoloniProductId?: number | null;

    @IsBoolean()
    deliveryAreaEnabled!: boolean;

    @IsString()
    @MaxLength(120)
    deliveryAreaName!: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    deliveryCenterLatitude!: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    deliveryCenterLongitude!: number;

    @IsNumber()
    @Min(1)
    @Max(200)
    deliveryRadiusKm!: number;
}
