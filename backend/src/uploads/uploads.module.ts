import { Module } from '@nestjs/common';

import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '@/storage/storage.module';
import { AdminUploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
    imports: [PrismaModule, StorageModule],
    controllers: [AdminUploadsController],
    providers: [UploadsService],
})
export class UploadsModule {}
