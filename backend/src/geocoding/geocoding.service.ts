import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Coordinates,
  GeocodeAddress,
  GoogleGeocodingService,
} from './google-geocoding-service';

@Injectable()
export class GeocodingService {
  constructor(private readonly google: GoogleGeocodingService) {}

  async coordinates(address: GeocodeAddress): Promise<Coordinates> {
    const coordinates = await this.google.geocode(address);
    if (!coordinates) {
      throw new NotFoundException('Não foi possível localizar a morada indicada.');
    }
    return coordinates;
  }

  distanceKm(from: Coordinates, to: Coordinates): number {
    const earthRadiusKm = 6371.0088;
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const latitudeDelta = toRadians(to.latitude - from.latitude);
    const longitudeDelta = toRadians(to.longitude - from.longitude);
    const fromLatitude = toRadians(from.latitude);
    const toLatitude = toRadians(to.latitude);
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(fromLatitude) *
        Math.cos(toLatitude) *
        Math.sin(longitudeDelta / 2) ** 2;
    const distance =
      2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return Number(distance.toFixed(2));
  }

  async distanceBetweenAddresses(
    from: GeocodeAddress,
    to: GeocodeAddress,
  ) {
    const [fromCoordinates, toCoordinates] = await Promise.all([
      this.coordinates(from),
      this.coordinates(to),
    ]);
    return {
      from: fromCoordinates,
      to: toCoordinates,
      distanceKm: this.distanceKm(fromCoordinates, toCoordinates),
    };
  }
}
