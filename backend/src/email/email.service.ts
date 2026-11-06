import {
    Injectable,
    Logger,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend;
    private readonly from: string;
    private readonly replyTo?: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.resend = new Resend(
            this.configService.getOrThrow<string>(
                'RESEND_API_KEY',
            ),
        );

        this.from = this.normalizeAddress(
            this.configService.getOrThrow<string>('EMAIL_FROM'),
        );

        const replyTo = this.configService.get<string>('EMAIL_REPLY_TO');
        this.replyTo = replyTo
            ? this.normalizeAddress(replyTo)
            : undefined;
    }

    async sendEmail(params: {
        to: string;
        templateId?: string;
        variables?: Record<string, string>;
        subject?: string;
        html?: string;
    }): Promise<{ id: string }> {
        if (!params.templateId && (!params.subject || !params.html)) {
            throw new ServiceUnavailableException(
                'Email content is incomplete.',
            );
        }
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.from,
                to: params.to,
                ...(this.replyTo && {
                    replyTo: this.replyTo,
                }),
                ...(params.templateId
                    ? {
                        template: {
                            id: params.templateId,
                            variables: params.variables ?? {},
                        },
                    }
                    : {
                        subject: params.subject!,
                        html: params.html!,
                    }),
            });

            if (error) {
                this.logger.error(
                    `Resend failed to send email: ${error.message}`,
                );

                throw new ServiceUnavailableException(
                    'Unable to send email.',
                );
            }

            if (!data?.id) {
                throw new ServiceUnavailableException(
                    'Email provider did not return a message ID.',
                );
            }

            return { id: data.id };
        } catch (error) {
            if (error instanceof ServiceUnavailableException) {
                throw error;
            }

            this.logger.error(
                'Unexpected error while sending email.',
            );

            throw new ServiceUnavailableException(
                'Unable to send email.',
            );
        }
    }

    private normalizeAddress(value: string): string {
        const trimmed = value.trim();
        const first = trimmed.at(0);
        const last = trimmed.at(-1);

        if (
            trimmed.length >= 2 &&
            ((first === '"' && last === '"') ||
                (first === "'" && last === "'"))
        ) {
            return trimmed.slice(1, -1).trim();
        }

        return trimmed;
    }
}
