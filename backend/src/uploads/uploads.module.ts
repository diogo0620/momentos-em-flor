import { Module } from '@nestjs/common';

import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { LocalFileStorageService } from './storage/local-file-storage.service';
import { FilesController } from './files.controller';

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [
        UploadsController,
        FilesController,
    ],
    providers: [
        UploadsService,
        LocalFileStorageService,
    ],
    exports: [
        UploadsService,
    ],
})
export class UploadsModule {}