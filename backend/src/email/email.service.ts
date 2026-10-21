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

        this.from = this.configService.getOrThrow<string>(
            'EMAIL_FROM',
        );

        this.replyTo =
            this.configService.get<string>('EMAIL_REPLY_TO');
    }

    async sendEmail(params: {
        to: string;
        templateId: string;
        variables: Record<string, string>;
    }): Promise<{ id: string }> {
        try {
            const { data, error } = await this.resend.emails.send({
                from: this.from,
                to: params.to,
                ...(this.replyTo && {
                    replyTo: this.replyTo,
                }),
                template: {
                    id: params.templateId,
                    variables: params.variables,
                },
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
}
