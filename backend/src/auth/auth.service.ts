import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

import { UsersService } from '@/users/users.service';

import { LoginDto } from './dto/login.dto';
import { Exceptions } from '@/common/exceptions/exceptions';
import { AUTH_MESSAGES } from './constants/auth.messages';
import { LoginResponseDto } from './dto/login-response.dto';
import { AUTH_CONSTANTS } from './constants/auth.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { Response } from 'express';
import { ApiResponse } from '@/common/responses/api-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  async login(
    dto: LoginDto,
    response: Response,
  ): Promise<LoginResponseDto> {
    const user =
      await this.usersService.findByEmail(
        dto.email,
      );

    if (!user) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    const validPassword =
      await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

    if (!validPassword) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
      );
    }

    if (!user.active) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.USER_INACTIVE,
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshToken =
      await this.createRefreshToken(
        user.id,
      );

    response.cookie(
      'refreshToken',
      refreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          AUTH_CONSTANTS
            .REFRESH_TOKEN_EXPIRES_IN_DAYS *
          24 *
          60 *
          60 *
          1000,
      },
    );

    return {
      accessToken:
        await this.jwtService.signAsync(
          payload,
        ),

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<LoginResponseDto> {
    const separatorIndex =
      refreshToken.indexOf('.');

    if (separatorIndex === -1) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    const tokenId =
      refreshToken.substring(
        0,
        separatorIndex,
      );

    const secret =
      refreshToken.substring(
        separatorIndex + 1,
      );

    const storedToken =
      await this.prisma.refreshToken.findUnique({
        where: {
          tokenId,
        },
        include: {
          user: true,
        },
      });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    const validSecret =
      await bcrypt.compare(
        secret,
        storedToken.tokenHash,
      );

    if (!validSecret) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    if (!storedToken.user.active) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.USER_INACTIVE,
      );
    }

    const newRefreshToken =
      await this.createRefreshToken(
        storedToken.userId,
      );

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const payload = {
      sub: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    response.cookie(
      'refreshToken',
      newRefreshToken,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        maxAge:
          AUTH_CONSTANTS
            .REFRESH_TOKEN_EXPIRES_IN_DAYS *
          24 *
          60 *
          60 *
          1000,
      },
    );

    return {
      accessToken:
        await this.jwtService.signAsync(
          payload,
        ),

      user: {
        id: storedToken.user.id,
        firstName:
          storedToken.user.firstName,
        lastName:
          storedToken.user.lastName,
        email:
          storedToken.user.email,
        role:
          storedToken.user.role,
      },
    };
  }

  async logout(
    refreshToken: string,
    response: Response,
  ) {
    const separatorIndex =
      refreshToken.indexOf('.');

    if (
      separatorIndex !== -1
    ) {
      const tokenId =
        refreshToken.substring(
          0,
          separatorIndex,
        );

      await this.prisma.refreshToken.updateMany({
        where: {
          tokenId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    response.clearCookie(
      'refreshToken',
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
      },
    );

    return ApiResponse.success(
      null,
      AUTH_MESSAGES.LOGGED_OUT,
    );
  }

  private async createRefreshToken(
    userId: number,
  ): Promise<string> {
    const tokenId =
      randomBytes(32).toString('hex');

    const secret =
      randomBytes(64).toString('hex');

    const tokenHash =
      await bcrypt.hash(secret, 12);

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() +
      AUTH_CONSTANTS
        .REFRESH_TOKEN_EXPIRES_IN_DAYS,
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenId,
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return `${tokenId}.${secret}`;
  }
}