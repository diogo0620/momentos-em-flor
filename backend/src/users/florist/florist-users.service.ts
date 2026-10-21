import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { FloristUsersMapper } from './mappers/florist-users.mapper';
import { FloristUserResponseDto } from './dtos/florist-user-response.dto';
import { FloristUpdateUserDto } from './dtos/florist-update-user.dto';
import { FloristUserChangePasswordDto } from './dtos/florist-user-change-password.dto';


@Injectable()
export class FloristUsersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: FloristUsersMapper,
    ) { }

    async findOne(id: number): Promise<FloristUserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
                active: true
            },
            include: {
                florist: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(user),
        );
    }


    async update(
        id: number,
        dto: FloristUpdateUserDto,
    ): Promise<void> {
        try {
            await this.prisma.user.update({
                where: {
                    id,
                    active: true
                },
                data: {
                    ...(dto.firstName !== undefined && {
                        firstName: dto.firstName,
                    }),
                    ...(dto.lastName !== undefined && {
                        lastName: dto.lastName,
                    }),
                    ...(dto.email !== undefined && {
                        email: dto.email,
                    }),
                    ...(dto.phone !== undefined && {
                        phone: dto.phone,
                    })
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND)
                }
            }

            throw error;
        }
    }

    async changePassword(
        id: number,
        dto: FloristUserChangePasswordDto,
    ): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
                active: true
            },
        });

        if (!user)
            Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND);

        const validPassword = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!validPassword)
            Exceptions.badRequest(ERROR_MESSAGES.USER_WRONG_PASSWORD);

        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: {
                id,
                active: true
            },
            data: {
                passwordHash
            },
        });

    }
}