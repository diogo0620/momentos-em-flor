import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma, UserRole } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { PublicCreateUserDto } from './dtos/public-create-user.dto';
import { use } from 'passport';
import { PublicUsersMapper } from './mappers/public-users.mapper';


@Injectable()
export class PublicUsersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: PublicUsersMapper,
    ) { }

    async create(
        dto: PublicCreateUserDto,
    ): Promise<EntityIdResponseDto> {
        try {

            const passwordHash = await bcrypt.hash(dto.password,10);
            const user = await this.prisma.user.create({
                data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    email: dto.email,
                    phone: dto.phone,
                    passwordHash,
                    role: UserRole.CUSTOMER,
                    active: true,
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
                }
            }

            throw error;
        }
    }





}