import { ApiPropertyOptional } from '@nestjs/swagger';
import { MoloniDocumentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryDto } from '@/common/dto/base-query.dto';

export class MoloniFiscalDocumentQueryDto extends BaseQueryDto {
  @ApiPropertyOptional({ enum: MoloniDocumentStatus })
  @IsOptional()
  @IsEnum(MoloniDocumentStatus)
  status?: MoloniDocumentStatus;
}
