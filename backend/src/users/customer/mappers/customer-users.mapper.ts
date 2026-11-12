
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';


import { CustomerUserResponseDto } from '../dtos/customer-user-response.dto';

@Injectable()
export class CustomerUsersMapper{
  toDetailResponse(user: User): CustomerUserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      taxNumber: user.taxNumber,
      billingStreet: user.billingStreet,
      billingStreetNumber: user.billingStreetNumber,
      billingStreet2: user.billingStreet2,
      billingPostalCode: user.billingPostalCode,
      billingCity: user.billingCity,
      billingDistrict: user.billingDistrict,
      billingCountryCode: user.billingCountryCode,
      emailVerified: user.emailVerified
    };
  }
}
