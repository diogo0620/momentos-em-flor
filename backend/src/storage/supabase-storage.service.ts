
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
            'SUPABASE_PRODUCT_IMAGES_BUCKET',
        );
    }

    async upload(
        path: string,
        buffer: Buffer,
        contentType: string,
    ): Promise<void> {
        const { error } = await this.client.storage
            .from(this.bucket)
            .upload(path, buffer, {
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
            .remove([path]);

        if (error) {
            throw new ServiceUnavailableException(
                'Unable to delete image.',
            );
        }
    }

    getPublicUrl(path: string): string {
        const { data } = this.client.storage
            .from(this.bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
}
