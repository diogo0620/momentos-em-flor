
import { Injectable } from '@nestjs/common';
import { MoloniSync } from '@prisma/client';

import { MoloniSyncResponseDto } from '../dtos/moloni-sync-response.dto';

@Injectable()
export class MoloniSyncMapper {
  toResponse(
    sync: MoloniSync | null,
  ): MoloniSyncResponseDto | null {
    if (!sync) {
      return null;
    }

    return {
      status: sync.status,
      moloniId: sync.moloniId,
      message: sync.message,
      lastAttemptAt: sync.lastAttemptAt,
      syncedAt: sync.syncedAt,
    };
  }
}
