import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { Exceptions } from '@/common/exceptions/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { AuthUserDto } from '../dtos/auth-user.dto';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService
    ) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: {
        sub: number;
    }) {
        const user = await this.findOne(payload.sub);

        if (!user || !user.active)
            Exceptions.unauthorized();

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        };
    }

    private async findOne(id: number): Promise<AuthUserDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return ApiResponse.success(
            user
        );
    }
}