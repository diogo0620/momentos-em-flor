
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';

import { AdminUserResponseDto } from '../dtos/admin-user-response.dto';
import { AdminUserListResponseDto } from '../dtos/admin-user-list-response.dto';

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
export class AdminUsersMapper extends BaseMapper<
  User,
  AdminUserResponseDto,
  AdminUserListResponseDto
> {
  toDetailResponse(user: UserWithFlorist): AdminUserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified,
      florist: user.florist
        ? {
            id: user.florist.id,
            name: user.florist.name,
          }
        : null,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  protected toListItemResponse(
    user: User,
  ): AdminUserListResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
    };
  }
}
