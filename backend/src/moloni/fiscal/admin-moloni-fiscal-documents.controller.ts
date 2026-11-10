import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  StreamableFile,
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

  @Get(':id/repair-context')
  repairContext(@Param('id', ParseIntPipe) id: number) {
    return this.service.getRepairContext(id);
  }

  @Get(':id/invoice-pdf')
  @Header('Cache-Control', 'private, no-store')
  async getInvoicePdf(@Param('id', ParseIntPipe) id: number) {
    return this.toPdfStream(await this.service.getPdf(id, 'invoice'));
  }

  @Get(':id/receipt-pdf')
  @Header('Cache-Control', 'private, no-store')
  async getReceiptPdf(@Param('id', ParseIntPipe) id: number) {
    return this.toPdfStream(await this.service.getPdf(id, 'receipt'));
  }

  @Get(':id/credit-note-pdf')
  @Header('Cache-Control', 'private, no-store')
  async getCreditNotePdf(@Param('id', ParseIntPipe) id: number) {
    return this.toPdfStream(await this.service.getPdf(id, 'credit-note'));
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

  private toPdfStream(file: { buffer: Buffer; filename: string }) {
    return new StreamableFile(file.buffer, {
      type: 'application/pdf',
      disposition: `inline; filename="${file.filename}"`,
      length: file.buffer.length,
    });
  }
}
