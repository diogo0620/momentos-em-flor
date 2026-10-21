
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

import { AdminUserResponseDto } from './dtos/admin-user-response.dto';
import { AdminUserListResponseDto } from './dtos/admin-user-list-response.dto';
import { AdminUsersMapper } from './mappers/admin-users.mapper';
import { AdminUserQueryDto } from './dtos/admin-user-query.dto';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';

@Injectable()
export class AdminUsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: AdminUsersMapper,
    ) { }

    async findAll(query: AdminUserQueryDto) {
        const { page, pageSize, search, active, role, sort, order } = query;

        const where: Prisma.UserWhereInput = {
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(active !== undefined && { active }),
            ...(role !== undefined && { role }),
        };

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.user.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(users),
            getPaginationResponse(page, pageSize, total),
        );
    }

    async findOne(id: number): Promise<AdminUserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
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

    async create(
        dto: AdminCreateUserDto,
    ): Promise<EntityIdResponseDto> {
        try {
            const passwordHash = await bcrypt.hash(dto.password,10);
            const user = await this.prisma.user.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    passwordHash,
                    phone: dto.phone,
                    role: dto.role,
                    floristId: dto.floristId,
                    active: dto.active ?? true,
                },
            });

            return ApiResponse.success(
                this.mapper.toCreatedResponse(user),
            );
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
                    //case 'P2003':
                    //Exceptions.badRequest(ERROR_MESSAGES.INVALID_CATEGORY_REFERENCE);
                }
            }

            throw error;
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
                }
            }

            throw error;
        }
    }
}
