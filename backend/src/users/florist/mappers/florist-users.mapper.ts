
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';


import { FloristUserResponseDto } from '../dtos/florist-user-response.dto';

type UserWithFlorist = Prisma.UserGetPayload<{
  include: {
    florist: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

@Injectable()
export class FloristUsersMapper{
  toDetailResponse(user: UserWithFlorist): FloristUserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerified,
      florist: user.florist
        ? {
            id: user.florist.id,
            name: user.florist.name,
          }
        : null,
    };
  }
}
