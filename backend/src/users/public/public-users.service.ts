import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { Prisma, UserRole } from '@prisma/client';
import { ApiResponse } from '@/common/responses/api-response';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { PublicCreateUserDto } from './dtos/public-create-user.dto';
import { PublicUsersMapper } from './mappers/public-users.mapper';
import { normalizePhoneNumber } from '@/common/phone/phone-number';
import { EmailService } from '@/email/email.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class PublicUsersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: PublicUsersMapper,
        private readonly emailService: EmailService,
        private readonly config: ConfigService,
    ) { }

    async create(
        dto: PublicCreateUserDto,
    ): Promise<EntityIdResponseDto> {
        try {

            const passwordHash = await bcrypt.hash(dto.password,10);
            const user = await this.prisma.user.create({
                data: {
                    firstName: dto.firstName.trim(),
                    lastName: dto.lastName.trim(),
                    email: dto.email.trim().toLowerCase(),
                    phone: normalizePhoneNumber(dto.phone),
                    passwordHash,
                    role: UserRole.CUSTOMER,
                    active: true,
                },
            });

            await this.sendVerificationEmail(user.id, user.email, user.firstName);

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

    async verifyEmail(token: string): Promise<void> {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const now = new Date();
        const verification = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
        if (!verification || verification.usedAt || verification.expiresAt <= now) {
            Exceptions.badRequest({ code: 'INVALID_EMAIL_VERIFICATION_TOKEN', message: 'A ligação de confirmação é inválida ou expirou.' });
        }
        await this.prisma.$transaction(async (tx) => {
            const consumed = await tx.emailVerificationToken.updateMany({ where: { id: verification.id, usedAt: null, expiresAt: { gt: now } }, data: { usedAt: now } });
            if (consumed.count !== 1) Exceptions.badRequest({ code: 'INVALID_EMAIL_VERIFICATION_TOKEN', message: 'A ligação de confirmação é inválida ou expirou.' });
            await tx.user.update({ where: { id: verification.userId }, data: { emailVerified: true } });
            await tx.emailVerificationToken.deleteMany({ where: { userId: verification.userId, usedAt: null } });
        });
    }

    async resendVerification(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
        if (!user || !user.active || user.emailVerified || user.role !== UserRole.CUSTOMER) return;
        await this.sendVerificationEmail(user.id, user.email, user.firstName);
    }

    private async sendVerificationEmail(userId: number, email: string, firstName: string): Promise<void> {
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.$transaction([
            this.prisma.emailVerificationToken.deleteMany({ where: { userId, usedAt: null } }),
            this.prisma.emailVerificationToken.create({ data: { tokenHash, userId, expiresAt } }),
        ]);
        const url = new URL('/verify-email', this.config.getOrThrow<string>('FRONTEND_URL'));
        url.searchParams.set('token', token);
        await this.emailService.sendEmail({
            to: email,
            subject: 'Confirme o seu email — Momentos em Flor',
            html: `<div style="font-family:Arial,sans-serif;color:#203128;line-height:1.6;max-width:620px;margin:auto"><h1>Confirme o seu email</h1><p>Olá ${this.escapeHtml(firstName)},</p><p>Confirme o endereço de email para poder aceder à sua conta.</p><p><a href="${url.toString()}" style="display:inline-block;background:#26392f;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none">Confirmar email</a></p><p>Esta ligação é válida durante 24 horas.</p></div>`,
        });
    }

    private escapeHtml(value: string): string {
        return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
    }





}
