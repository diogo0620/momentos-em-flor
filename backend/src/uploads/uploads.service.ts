import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';

import {
    FileProvider,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {

    constructor(
        private readonly prisma: PrismaService,
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

        const dbFile =
            await this.prisma.file.create({
                data: {
                    originalName: file.originalname,
                    storedName: file.filename,
                    extension,
                    mimeType: file.mimetype,
                    size: file.size,
                    path: file.path,
                    provider: FileProvider.LOCAL,
                },
            });

       return {
    id: dbFile.id,
    filename: dbFile.storedName,
    originalName: dbFile.originalName,
    size: dbFile.size,
    mimeType: dbFile.mimeType,
    extension: dbFile.extension,
    path: dbFile.path,
    url: `/uploads/temp/${encodeURIComponent(file.filename)}`,
};
    }
}