import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '@/users/users.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { AUTH_MESSAGES } from '../constants/auth.messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly usersService: UsersService,
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
        const user = await this.usersService.findById(payload.sub);

        if (!user || !user.active) {
            Exceptions.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            floristId: user.floristId,
        };
    }
}