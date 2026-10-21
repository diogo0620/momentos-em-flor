
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
      emailVerified: user.emailVerified
    };
  }
}
