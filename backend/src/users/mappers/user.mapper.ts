import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { BaseMapper } from '@/common/mappers/base.mapper';

import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UserMapper
  extends BaseMapper<User, UserResponseDto> {

  toResponse(
    user: User,
  ): UserResponseDto {

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified,
      floristId: user.floristId ?? undefined,
      lastLoginAt: user.lastLoginAt ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}