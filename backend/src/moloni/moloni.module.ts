import { Module } from '@nestjs/common';
import { MoloniMappingsController } from './admin/moloni-mappings.controller';
import { MoloniMappingsService } from './admin/moloni-mappings.service';

import { MoloniEncryptionService } from './encryption/moloni-encryption.service';
import { MoloniAuthService } from './auth/moloni-auth.service';
import { MoloniApiService } from './api/moloni-api.service';
import { MoloniSyncService } from './sync/moloni-sync.service';
import { MoloniSyncMapper } from './sync/mappers/moloni-sync.mapper';

import { AdminMoloniController } from './admin/admin-moloni.controller';
import { AdminMoloniService } from './admin/admin-moloni.service';
import { AdminMoloniMapper } from './admin/mappers/admin-moloni.mapper';
import { MoloniFiscalLifecycleService } from './fiscal/moloni-fiscal-lifecycle.service';
import { AdminMoloniFiscalDocumentsService } from './fiscal/admin-moloni-fiscal-documents.service';
import { AdminMoloniFiscalDocumentsController } from './fiscal/admin-moloni-fiscal-documents.controller';
import { EmailModule } from '@/email/email.module';
import { MoloniFiscalAutomationService } from './fiscal/moloni-fiscal-automation.service';
import { MoloniDocumentPdfService } from './fiscal/moloni-document-pdf.service';
import { StorageModule } from '@/storage/storage.module';

@Module({
  imports: [EmailModule, StorageModule],
  controllers: [
    MoloniMappingsController,
    AdminMoloniController,
    AdminMoloniFiscalDocumentsController,
  ],
  providers: [
    MoloniEncryptionService,
    MoloniAuthService,
    MoloniApiService,
    MoloniSyncService,
    MoloniMappingsService,
    MoloniSyncMapper,
    AdminMoloniService,
    AdminMoloniMapper,
    MoloniFiscalLifecycleService,
    AdminMoloniFiscalDocumentsService,
    MoloniFiscalAutomationService,
    MoloniDocumentPdfService,
  ],
  exports: [
    MoloniEncryptionService,
    MoloniAuthService,
    MoloniApiService,
    MoloniSyncService,
    MoloniFiscalLifecycleService,
    AdminMoloniFiscalDocumentsService,
    MoloniDocumentPdfService,
  ],
})
export class MoloniModule {}
