import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { CustomerUsersMapper } from './mappers/customer-users.mapper';
import { CustomerUserResponseDto } from './dtos/customer-user-response.dto';
import { CustomerUpdateUserDto } from './dtos/customer-update-user.dto';
import { CustomerUserChangePasswordDto } from './dtos/customer-user-change-password.dto';


@Injectable()
export class CustomerUsersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: CustomerUsersMapper,
    ) { }

    async findOne(id: number): Promise<CustomerUserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
                active: true
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
        dto: CustomerUpdateUserDto,
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
        dto: CustomerUserChangePasswordDto,
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

        await this.updatePassword(user.id, dto.newPassword);
    }

    private async updatePassword(
        userId: number,
        password: string,
    ): Promise<void> {
        const passwordHash = await bcrypt.hash(password, 12);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: { passwordHash },
            }),
            this.prisma.refreshToken.updateMany({
                where: {
                    userId,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                },
            }),
        ]);
    }
}