import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import type { Response, Request } from 'express';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

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
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.login(dto, response);
    }

    @Post('refresh')
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies?.refreshToken;

        if (!refreshToken) {
            Exceptions.unauthorized();
        }

        return this.authService.refresh(refreshToken, response);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ): Promise<void> {
        const refreshToken = request.cookies?.refreshToken;

        if (!refreshToken) {
            response.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });

            return;
        }

        await this.authService.logout(refreshToken, response);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async forgotPassword(
        @Body() dto: ForgotPasswordDto,
    ): Promise<void> {
        await this.authService.forgotPassword(dto);
    }


    @Post('reset-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    async resetPassword(@Body() dto: ResetPasswordDto) : Promise<void> {
        await this.authService.resetPassword(dto);
    }



}

