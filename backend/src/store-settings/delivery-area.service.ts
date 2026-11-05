import { Injectable } from '@nestjs/common';

import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Exceptions } from '@/common/exceptions/exceptions';
import { GeocodingService } from '@/geocoding/geocoding.service';
import { AdminStoreSettingsService } from './admin/admin-store-settings.service';
import { DeliveryAvailabilityDto } from './dtos/delivery-availability.dto';

@Injectable()
export class DeliveryAreaService {
  constructor(
    private readonly settingsService: AdminStoreSettingsService,
    private readonly geocoding: GeocodingService,
  ) {}

  async evaluate(address: DeliveryAvailabilityDto) {
    const [settings, coordinates] = await Promise.all([
      this.settingsService.get(),
      this.geocoding.coordinates(address),
    ]);
    const radiusKm = Number(settings.deliveryRadiusKm);
    const distanceKm = this.geocoding.distanceKm(
      {
        latitude: Number(settings.deliveryCenterLatitude),
        longitude: Number(settings.deliveryCenterLongitude),
      },
      coordinates,
    );

    return {
      available: !settings.deliveryAreaEnabled || distanceKm <= radiusKm,
      distanceKm,
      radiusKm,
      areaName: settings.deliveryAreaName,
      coordinates,
    };
  }

  async ensureAvailable(address: DeliveryAvailabilityDto) {
    const result = await this.evaluate(address);
    if (!result.available) {
      Exceptions.badRequest(ERROR_MESSAGES.DELIVERY_ADDRESS_OUTSIDE_SERVICE_AREA);
    }
    return result;
  }
}
