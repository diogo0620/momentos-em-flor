import {
    BadRequestException,
    Controller,
    HttpCode,
    HttpStatus,
    ParseFilePipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

import { UploadsService } from './uploads.service';
import { UploadImageDto } from './dtos/upload-image.dto';
import { UploadImageResponseDto } from './dtos/upload-image-response.dto';
import { Body } from '@nestjs/common';

@ApiTags('Uploads (Admin)')
@ApiBearerAuth('JWT')
@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminUploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Post()
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: {
                fileSize: 5 * 1024 * 1024,
            },
        }),
    )
    @ApiOperation({
        summary: 'Upload de imagem para uma categoria, produto ou variante.',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                categoryId: {
                    type: 'integer',
                    example: 1,
                },
                productId: {
                    type: 'integer',
                    example: 1,
                },
                variantId: {
                    type: 'integer',
                    example: 1,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Imagem carregada e associada com sucesso.',
        type: UploadImageResponseDto,
    })
    async uploadImage(
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: true,
                exceptionFactory: () =>
                    new BadRequestException('É obrigatório enviar uma imagem.'),
            }),
        )
        file: Express.Multer.File,
        @Body() dto: UploadImageDto,
    ): Promise<void> {
        await this.uploadsService.uploadImage(file, dto);
    }
}