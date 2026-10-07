import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';

import { AddressResponseDto } from '../dto/address-response.dto';

@Injectable()
export class AddressMapper
  extends BaseMapper<Address, AddressResponseDto> {

  toResponse(
    address: Address,
  ): AddressResponseDto {
    return {
      id: address.id,
      street: address.street,
      street2: address.street2 ?? undefined,
      streetNumber: address.streetNumber,
      postalCode: address.postalCode,
      city: address.city,
      district: address.district,
      countryCode: address.countryCode,
      latitude: address.latitude ? address.latitude.toNumber() : undefined,
      longitude: address.longitude ? address.longitude.toNumber() : undefined,
    };
  }
}