import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '@/users/users.service';

import { LoginDto } from './dto/login.dto';
import { Exceptions } from '@/common/exceptions/exceptions';
import { AUTH_MESSAGES } from './constants/auth.messages';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) : Promise<LoginResponseDto>{
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      Exceptions.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!validPassword) {
      Exceptions.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.active) {
      Exceptions.unauthorized(AUTH_MESSAGES.USER_INACTIVE);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }
}