import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AdminStoreSettingsService } from './admin/admin-store-settings.service';
import { DeliveryAreaService } from './delivery-area.service';
import { DeliveryAvailabilityDto, DeliveryAvailabilityResponseDto } from './dtos/delivery-availability.dto';

class PublicStoreSettingsResponseDto {
  @ApiProperty() companyName!: string;
  @ApiProperty({ nullable: true }) contactEmail!: string | null;
  @ApiProperty({ nullable: true }) contactPhone!: string | null;
  @ApiProperty({ nullable: true }) whatsappNumber!: string | null;
  @ApiProperty({ nullable: true }) companyAddress!: string | null;
  @ApiProperty({ nullable: true }) partnerEmail!: string | null;
  @ApiProperty({ example: 5 })
  deliveryFee!: number;

  @ApiProperty({ example: 1, nullable: true })
  deliveryTaxCodeId!: number | null;

  @ApiProperty({ example: 23, nullable: true })
  deliveryTaxRate!: number | null;

  @ApiProperty() deliveryAreaEnabled!: boolean;
  @ApiProperty() deliveryAreaName!: string;
  @ApiProperty() deliveryRadiusKm!: number;
}

@ApiTags('Store Settings')
@Controller('store-settings')
export class PublicStoreSettingsController {
  constructor(
    private readonly storeSettingsService: AdminStoreSettingsService,
    private readonly deliveryAreaService: DeliveryAreaService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PublicStoreSettingsResponseDto })
  async get(): Promise<PublicStoreSettingsResponseDto> {
    const settings = await this.storeSettingsService.get();

    return {
      companyName: settings.companyName,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsappNumber: settings.whatsappNumber,
      companyAddress: settings.companyAddress,
      partnerEmail: settings.partnerEmail,
      deliveryFee: settings.deliveryFee,
      deliveryTaxCodeId: settings.deliveryTaxCodeId,
      deliveryTaxRate: settings.deliveryTaxRate,
      deliveryAreaEnabled: settings.deliveryAreaEnabled,
      deliveryAreaName: settings.deliveryAreaName,
      deliveryRadiusKm: settings.deliveryRadiusKm,
    };
  }

  @Post('delivery-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DeliveryAvailabilityResponseDto })
  async deliveryAvailability(
    @Body() dto: DeliveryAvailabilityDto,
  ): Promise<DeliveryAvailabilityResponseDto> {
    const result = await this.deliveryAreaService.evaluate(dto);
    return {
      available: result.available,
      distanceKm: result.distanceKm,
      radiusKm: result.radiusKm,
      areaName: result.areaName,
    };
  }
}
