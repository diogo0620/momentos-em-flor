import {
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';


import { LoginDto } from './dtos/login.dto';
import { Exceptions } from '@/common/exceptions/exceptions';
import { LoginResponseDto } from './dtos/login-response.dto';
import { AUTH_CONSTANTS } from './constants/auth.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { Response } from 'express';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { ApiResponse } from '@/common/responses/api-response';
import { AuthUserDto } from './dtos/auth-user.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@/email/email.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) { }

    async login(
        dto: LoginDto,
        response: Response,
    ): Promise<LoginResponseDto> {
        const user =
            await this.findByEmail(
                dto.email,
            );

        if (!user) {
            Exceptions.unauthorized();
        }

        const validPassword =
            await bcrypt.compare(
                dto.password,
                user.passwordHash,
            );

        if (!validPassword) {
            Exceptions.unauthorized();
        }

        if (!user.active) {
            Exceptions.unauthorized();
        }

        if (!user.active) {
            Exceptions.unauthorized();
        }

        await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });

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
                phone: user.phone,
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
            Exceptions.unauthorized();
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
            Exceptions.unauthorized();
        }

        const validSecret =
            await bcrypt.compare(
                secret,
                storedToken.tokenHash,
            );

        if (!validSecret) {
            Exceptions.unauthorized();
        }

        if (!storedToken.user.active) {
            Exceptions.unauthorized();
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
                   phone: storedToken.user.phone, 

                    
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
    }

    async forgotPassword(
        dto: ForgotPasswordDto,
    ): Promise<void> {
        const message =
            'If an account exists with this email, you will receive instructions to reset your password.';

        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user || !user.active) {
            return;
        }

        const token = randomBytes(32).toString('hex');

        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex');

        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000,
        );

        await this.prisma.$transaction([
            this.prisma.passwordResetToken.deleteMany({
                where: {
                    userId: user.id,
                    usedAt: null,
                },
            }),
            this.prisma.passwordResetToken.create({
                data: {
                    tokenHash,
                    userId: user.id,
                    expiresAt,
                },
            }),
        ]);

        const frontendUrl =
            this.configService.getOrThrow<string>(
                'FRONTEND_URL',
            );

        const resetUrl = new URL(
            '/reset-password',
            frontendUrl,
        );

        resetUrl.searchParams.set('token', token);

        await this.emailService.sendEmail({
            to: 'diogomicael6@gmail.com',
            templateId: 'password-reset',
            variables: {
                RESET_URL: resetUrl.toString(),
            },
        });
    }


    async resetPassword(
        dto: ResetPasswordDto,
    ): Promise<void> {
        const now = new Date();

        const tokenHash = createHash('sha256')
            .update(dto.token)
            .digest('hex');

        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (
            !resetToken ||
            resetToken.usedAt ||
            resetToken.expiresAt <= now ||
            !resetToken.user.active
        ) {
            Exceptions.badRequest({
                code: 'INVALID_PASSWORD_RESET_TOKEN',
                message: 'The password reset link is invalid or has expired.',
            });
        }

        const passwordHash = await bcrypt.hash(dto.newPassword, 12);

        await this.prisma.$transaction(async (tx) => {
            // Consume the token atomically to prevent reuse.
            const consumedToken = await tx.passwordResetToken.updateMany({
                where: {
                    id: resetToken.id,
                    usedAt: null,
                    expiresAt: { gt: now },
                },
                data: { usedAt: now },
            });

            if (consumedToken.count !== 1) {
                Exceptions.badRequest({
                    code: 'INVALID_PASSWORD_RESET_TOKEN',
                    message: 'The password reset link is invalid or has expired.',
                });
            }

            // Update the password only for an active user.
            const updatedUser = await tx.user.updateMany({
                where: {
                    id: resetToken.userId,
                    active: true,
                },
                data: { passwordHash },
            });

            if (updatedUser.count !== 1) {
                Exceptions.badRequest({
                    code: 'INVALID_PASSWORD_RESET_TOKEN',
                    message: 'The password reset link is invalid or has expired.',
                });
            }

            // Revoke all active refresh tokens.
            await tx.refreshToken.updateMany({
                where: {
                    userId: resetToken.userId,
                    revokedAt: null,
                },
                data: { revokedAt: now },
            });
        });
    }


    private async findByEmail(email: string): Promise<AuthUserDto> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            Exceptions.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return ApiResponse.success(
            user
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