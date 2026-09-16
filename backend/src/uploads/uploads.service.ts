import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import {
    FileProvider,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { LocalFileStorageService } from './storage/local-file-storage.service';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: LocalFileStorageService,
    ) {}

    async upload(
        file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException(
                'No file was uploaded.',
            );
        }

        const extension =
            file.originalname
                .split('.')
                .pop()
                ?.toLowerCase() ?? '';

        const stored =
            await this.storage.moveFromTemp(
                file,
                'products',
            );

        const dbFile =
            await this.prisma.file.create({
                data: {
                    originalName:
                        file.originalname,

                    storedName:
                        stored.filename,

                    extension,

                    mimeType:
                        file.mimetype,

                    size:
                        file.size,

                    path:
                        stored.path,

                    provider:
                        FileProvider.LOCAL,
                },
            });

        return {
            id: dbFile.id,
            filename:
                dbFile.storedName,
            originalName:
                dbFile.originalName,
            size:
                dbFile.size,
            mimeType:
                dbFile.mimeType,
            extension:
                dbFile.extension,
            path:
                dbFile.path,

            url:
                `/api/files/${dbFile.id}`,
        };
    }
}