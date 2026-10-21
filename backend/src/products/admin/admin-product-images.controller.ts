
import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { AdminProductImagesService } from './admin-product-images.service';
import { Roles } from '@/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

const imageUploadOptions = {
    storage: memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (
        _req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new BadRequestException(
                    'Only JPEG, PNG and WebP images are allowed.',
                ),
                false,
            );
        }

        callback(null, true);
    },
};

@ApiTags('Admin Product Images')
@Controller('admin/products')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSTEM_ADMIN)
export class AdminProductImagesController {
    constructor(
        private readonly imagesService: AdminProductImagesService,
    ) {}

    @Post(':id/images')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                isPrimary: { type: 'boolean' },
                sortOrder: { type: 'number' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', imageUploadOptions),
    )
    uploadProductImage(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body('isPrimary') isPrimary?: string,
        @Body('sortOrder') sortOrder?: string,
    ) {
        return this.imagesService.uploadProductImage(id, file, {
            isPrimary:
                isPrimary === undefined
                    ? undefined
                    : isPrimary === 'true',
            sortOrder:
                sortOrder === undefined
                    ? undefined
                    : Number(sortOrder),
        });
    }

    @Post(':id/variants/:variantId/image')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', imageUploadOptions),
    )
    uploadVariantImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('variantId', ParseIntPipe) variantId: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.imagesService.uploadVariantImage(
            id,
            variantId,
            file,
        );
    }

    @Get(':id/images')
    getProductImages(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.imagesService.getProductImages(id);
    }

    @Delete(':id/images/:imageId')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteProductImage(
        @Param('id', ParseIntPipe) id: number,
        @Param('imageId', ParseIntPipe) imageId: number,
    ) {
        return this.imagesService.deleteProductImage(
            id,
            imageId,
        );
    }
}
