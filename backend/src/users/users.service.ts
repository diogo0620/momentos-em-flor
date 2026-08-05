import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';

import { UserMapper } from './mappers/user.mapper';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './query/user-query.dto';

import { UserResponseDto } from './dto/user-response.dto';

import { USER_MESSAGES } from './constants/user.messages';

import { Exceptions } from '@/common/exceptions/exceptions';
import { ApiResponse } from '@/common/responses/api-response';

import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userMapper: UserMapper,
  ) { }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll(
    query: UserQueryDto,
  ) {

    const where = {
      deletedAt: null,
      ...(query.search && {
        OR: [
          {
            firstName: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            lastName: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
          {
            email: {
              contains: query.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const orderBy = query.sort
      ? {
        [query.sort]: query.order,
      }
      : {
        firstName: 'asc' as const,
      };

    const users =
      await this.prisma.user.findMany({
        where,
        orderBy,
        ...getPagination(
          query.page,
          query.pageSize,
        ),
      });

    const total =
      await this.prisma.user.count({
        where,
      });

    return ApiResponse.paginated(
      this.userMapper.toResponses(
        users,
      ),
      getPaginationResponse(
        query.page,
        query.pageSize,
        total,
      ),
    );
  }

  async findOne(
    id: number,
  ) {
    const user =
      await this.getUserOrThrow(id);

    return ApiResponse.success(
      this.userMapper.toResponse(user),
    );
  }

  async create(
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {

    const exists =
      await this.prisma.user.findFirst({
        where: {
          deletedAt: null,
          email: dto.email,
        },
      });

    if (exists) {
      Exceptions.conflict(
        USER_MESSAGES.ALREADY_EXISTS,
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );

    const user =
      await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
          phone: dto.phone,
          avatarUrl: dto.avatarUrl,
          role: dto.role,
          floristId: dto.floristId,
        },
      });

    return this.userMapper.toResponse(user);
  }

  async update(
    id: number,
    dto: UpdateUserDto,
  ) {
    const user = await this.getUserOrThrow(id);

    if (!user.active) {
      Exceptions.notFound(
        USER_MESSAGES.NOT_FOUND,
      );
    }

    if (dto.email) {
      const exists =
        await this.prisma.user.findFirst({
          where: {
            deletedAt: null,
            id: {
              not: id,
            },
            email: dto.email,
          },
        });

      if (exists) {
        Exceptions.conflict(
          USER_MESSAGES.ALREADY_EXISTS,
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        ...dto,
      },
    });

    return ApiResponse.success(
      this.userMapper.toResponse(updatedUser),
      USER_MESSAGES.UPDATED,
    );
  }

  async remove(
    id: number,
  ) {
    await this.getUserOrThrow(id);

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });

    return ApiResponse.success(
      null,
      USER_MESSAGES.DELETED,
    );
  }

  private async getUserOrThrow(
    id: number,
  ) {
    const user =
      await this.prisma.user.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    if (!user) {
      Exceptions.notFound(
        USER_MESSAGES.NOT_FOUND,
      );
    }

    return user;
  }

  async changePassword(
    id: number,
    dto: ChangePasswordDto,
  ) {
    const user = await this.getUserOrThrow(id);

    const validPassword = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!validPassword) {
      Exceptions.unauthorized(
        USER_MESSAGES.INVALID_PASSWORD,
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });

    return ApiResponse.success(
      null,
      USER_MESSAGES.PASSWORD_CHANGED,
    );
  }

  async resetPassword(
    id: number,
    dto: ResetPasswordDto,
  ) {
    await this.getUserOrThrow(id);

    const passwordHash = await bcrypt.hash(
      dto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        passwordHash,
      },
    });

    return ApiResponse.success(
      null,
      USER_MESSAGES.PASSWORD_RESET,
    );
  }



}