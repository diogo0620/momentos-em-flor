
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { MoloniSyncStatus } from '@prisma/client';

export class MoloniSyncResponseDto {
  @ApiProperty({
    enum: MoloniSyncStatus,
    example: MoloniSyncStatus.SYNCED,
    description: 'Estado atual da sincronização com a Moloni.',
  })
  status!: MoloniSyncStatus;

  @ApiPropertyOptional({
    example: '12345',
    nullable: true,
    description: 'ID do registo correspondente na Moloni.',
  })
  moloniId!: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Mensagem de erro da última tentativa de sincronização.',
  })
  message!: string | null;

  @ApiPropertyOptional({
    example: '2026-10-30T10:00:00.000Z',
    nullable: true,
    description: 'Data da última tentativa de sincronização.',
  })
  lastAttemptAt!: Date | null;

  @ApiPropertyOptional({
    example: '2026-10-30T10:00:00.000Z',
    nullable: true,
    description: 'Data da última sincronização concluída com sucesso.',
  })
  syncedAt!: Date | null;
}
