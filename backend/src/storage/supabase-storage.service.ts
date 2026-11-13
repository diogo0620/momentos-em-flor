
import {
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
    private readonly client: SupabaseClient;
    private readonly bucket: string;

    constructor(config: ConfigService) {
        this.client = createClient(
            config.getOrThrow<string>('SUPABASE_URL'),
            config.getOrThrow<string>('SUPABASE_SECRET_KEY'),
        );

        this.bucket = config.getOrThrow<string>(
            'SUPABASE_BUCKET',
        );

        if (!['dev', 'test', 'prod'].includes(this.bucket)) {
            throw new Error('SUPABASE_BUCKET deve ser dev, test ou prod.');
        }
    }

    async upload(
        path: string,
        buffer: Buffer,
        contentType: string,
    ): Promise<void> {
        return this.uploadFile(path, buffer, contentType);
    }

    private async uploadFile(
        path: string,
        buffer: Buffer,
        contentType: string,
    ): Promise<void> {
        const { error } = await this.client.storage
            .from(this.bucket)
            .upload(this.toStoragePath(path), buffer, {
                contentType,
                cacheControl: '31536000',
                upsert: false,
            });

        if (error) {
            throw new ServiceUnavailableException(
                'Unable to upload image.',
            );
        }
    }

    async remove(path: string): Promise<void> {
        const { error } = await this.client.storage
            .from(this.bucket)
            .remove([this.toStoragePath(path)]);

        if (error) {
            throw new ServiceUnavailableException(
                'Unable to delete image.',
            );
        }
    }

    getPublicUrl(path: string): string {
        const { data } = this.client.storage
            .from(this.bucket)
            .getPublicUrl(this.toStoragePath(path));

        return data.publicUrl;
    }

    private toStoragePath(path: string): string {
        return path
            .replace(/\\/g, '/')
            .replace(/^\/+/, '');
    }
}
