import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { MoloniFiscalDocumentQueryDto } from './dtos/moloni-fiscal-document-query.dto';
import { AdminMoloniFiscalDocumentsService } from './admin-moloni-fiscal-documents.service';
import { RecordMoloniCreditNoteDto } from './dtos/record-moloni-credit-note.dto';

@ApiTags('Moloni Fiscal Documents (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/moloni/fiscal-documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminMoloniFiscalDocumentsController {
  constructor(private readonly service: AdminMoloniFiscalDocumentsService) {}

  @Get()
  findAll(@Query() query: MoloniFiscalDocumentQueryDto) {
    return this.service.findAll(query);
  }

  @Post(':id/issue')
  @HttpCode(HttpStatus.OK)
  issue(@Param('id', ParseIntPipe) id: number) {
    return this.service.issue(id);
  }

  @Post(':id/record-credit-note')
  @HttpCode(HttpStatus.OK)
  recordCreditNote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordMoloniCreditNoteDto,
  ) {
    return this.service.recordCreditNote(id, dto.creditNoteId);
  }

  @Post(':id/issue-credit-note')
  @HttpCode(HttpStatus.OK)
  issueCreditNote(@Param('id', ParseIntPipe) id: number) {
    return this.service.issueCreditNote(id);
  }
}
