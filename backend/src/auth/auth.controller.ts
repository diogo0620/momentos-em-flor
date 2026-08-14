import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponseDto } from './dto/login-response.dto';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from './decorators/roles.decorator';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import type { Response, Request } from 'express';
import { AUTH_MESSAGES } from './constants/auth.messages';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ApiResponse } from '@/common/responses/api-response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Post('login')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  login(
    @Body() dto: LoginDto,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.login(
      dto,
      response,
    );
  }

  @Post('refresh')
  @ApiOkResponse({
    type: LoginResponseDto,
  })
  refresh(
    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.refreshToken;

    if (!refreshToken) {
      Exceptions.unauthorized(
        AUTH_MESSAGES.INVALID_REFRESH_TOKEN,
      );
    }

    return this.authService.refresh(
      refreshToken,
      response,
    );
  }

  @Post('logout')
  logout(
    @Req() request: Request,

    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.refreshToken;

    if (!refreshToken) {
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

    return this.authService.logout(
      refreshToken,
      response,
    );
  }


}