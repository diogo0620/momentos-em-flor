import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

import { UploadImageDto } from './dtos/upload-image.dto';
import { UploadImageResponseDto } from './dtos/upload-image-response.dto';

type UploadTarget =
    | {
          type: 'category';
          id: number;
          previousImagePath: string | null;
      }
    | {
          type: 'product';
          id: number;
          previousImagePath: string | null;
      }
    | {
          type: 'variant';
          id: number;
          previousImagePath: string | null;
      };

@Injectable()
export class UploadsService {
    private readonly maxFileSize = 5 * 1024 * 1024;

    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: SupabaseStorageService,
    ) {}

    async uploadImage(
        file: Express.Multer.File,
        dto: UploadImageDto,
    ): Promise<void> {
        this.validateFile(file);

        const target = await this.resolveTarget(dto);
        const extension = this.getExtension(file.mimetype);
        const path = `${this.getFolder(target.type)}/${randomUUID()}.${extension}`;

        await this.storage.upload(path, file.buffer, file.mimetype);

        try {
            await this.updateEntityImage(target, path);
        } catch (error) {
            // Se a atualização da base de dados falhar,
            // tenta remover a imagem acabada de carregar.
            try {
                await this.storage.remove(path);
            } catch {
                // Não substituir o erro original por um erro de limpeza.
            }

            throw error;
        }

        // A nova imagem já está associada à entidade.
        // Só agora tentamos remover a imagem anterior.
        if (
            target.previousImagePath &&
            target.previousImagePath !== path
        ) {
            try {
                await this.storage.remove(target.previousImagePath);
            } catch {
                // A associação foi concluída. Uma falha na remoção
                // da imagem antiga não deve invalidar o upload.
            }
        }
    }

    private validateFile(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException('É obrigatório enviar uma imagem.');
        }

        if (!file.buffer || file.buffer.length === 0) {
            throw new BadRequestException('O ficheiro enviado está vazio.');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                'A imagem não pode ultrapassar os 5 MB.',
            );
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                'Formato de imagem inválido. Formatos permitidos: JPEG, PNG e WebP.',
            );
        }

        // Validar a assinatura real do ficheiro, em vez de confiar
        // apenas no Content-Type enviado pelo cliente.
        if (!this.hasValidImageSignature(file)) {
            throw new BadRequestException(
                'O conteúdo do ficheiro não corresponde a uma imagem JPEG, PNG ou WebP válida.',
            );
        }
    }

    private hasValidImageSignature(file: Express.Multer.File): boolean {
        const buffer = file.buffer;

        if (file.mimetype === 'image/jpeg') {
            return (
                buffer.length >= 3 &&
                buffer[0] === 0xff &&
                buffer[1] === 0xd8 &&
                buffer[2] === 0xff
            );
        }

        if (file.mimetype === 'image/png') {
            return (
                buffer.length >= 8 &&
                buffer[0] === 0x89 &&
                buffer[1] === 0x50 &&
                buffer[2] === 0x4e &&
                buffer[3] === 0x47 &&
                buffer[4] === 0x0d &&
                buffer[5] === 0x0a &&
                buffer[6] === 0x1a &&
                buffer[7] === 0x0a
            );
        }

        if (file.mimetype === 'image/webp') {
            return (
                buffer.length >= 12 &&
                buffer.toString('ascii', 0, 4) === 'RIFF' &&
                buffer.toString('ascii', 8, 12) === 'WEBP'
            );
        }

        return false;
    }

    private async resolveTarget(dto: UploadImageDto): Promise<UploadTarget> {
        const targets = [
            { type: 'category' as const, id: dto.categoryId },
            { type: 'product' as const, id: dto.productId },
            { type: 'variant' as const, id: dto.variantId },
        ].filter((target) => target.id !== undefined && target.id !== null);

        if (targets.length !== 1) {
            throw new BadRequestException(
                'Deves enviar exatamente um dos campos: categoryId, productId ou variantId.',
            );
        }

        const target = targets[0];

        switch (target.type) {
            case 'category': {
                const category = await this.prisma.category.findUnique({
                    where: { id: target.id! },
                    select: {
                        id: true,
                        imagePath: true,
                    },
                });

                if (!category) {
                    throw new NotFoundException(
                        `A categoria com ID ${target.id} não existe.`,
                    );
                }

                return {
                    type: 'category',
                    id: category.id,
                    previousImagePath: category.imagePath,
                };
            }

            case 'product': {
                const product = await this.prisma.product.findUnique({
                    where: { id: target.id! },
                    select: {
                        id: true,
                        imagePath: true,
                    },
                });

                if (!product) {
                    throw new NotFoundException(
                        `O produto com ID ${target.id} não existe.`,
                    );
                }

                return {
                    type: 'product',
                    id: product.id,
                    previousImagePath: product.imagePath,
                };
            }

            case 'variant': {
                const variant = await this.prisma.productVariant.findUnique({
                    where: { id: target.id! },
                    select: {
                        id: true,
                        imagePath: true,
                    },
                });

                if (!variant) {
                    throw new NotFoundException(
                        `A variante com ID ${target.id} não existe.`,
                    );
                }

                return {
                    type: 'variant',
                    id: variant.id,
                    previousImagePath: variant.imagePath,
                };
            }
        }
    }

    private async updateEntityImage(
        target: UploadTarget,
        path: string,
    ): Promise<void> {
        switch (target.type) {
            case 'category':
                await this.prisma.category.update({
                    where: { id: target.id },
                    data: { imagePath: path },
                });
                return;

            case 'product':
                await this.prisma.product.update({
                    where: { id: target.id },
                    data: { imagePath: path },
                });
                return;

            case 'variant':
                await this.prisma.productVariant.update({
                    where: { id: target.id },
                    data: { imagePath: path },
                });
                return;
        }
    }

    private getFolder(type: UploadTarget['type']): string {
        switch (type) {
            case 'category':
                return 'categories';

            case 'product':
                return 'products';

            case 'variant':
                return 'variants';
        }
    }

    private getExtension(mimeType: string): string {
        switch (mimeType) {
            case 'image/jpeg':
                return 'jpg';

            case 'image/png':
                return 'png';

            case 'image/webp':
                return 'webp';

            default:
                throw new BadRequestException(
                    'Formato de imagem não suportado.',
                );
        }
    }
}