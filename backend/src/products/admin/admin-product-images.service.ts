
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '@/prisma/prisma.service';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

@Injectable()
export class AdminProductImagesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: SupabaseStorageService,
    ) {}

    private getExtension(file: Express.Multer.File): string {
        const extension = ALLOWED_IMAGE_TYPES[file.mimetype];

        if (!extension) {
            throw new BadRequestException(
                'Only JPEG, PNG and WebP images are allowed.',
            );
        }

        return extension;
    }

    async uploadProductImage(
        productId: number,
        file: Express.Multer.File,
        options: {
            isPrimary?: boolean;
            sortOrder?: number;
        } = {},
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required.');
        }

        const extension = this.getExtension(file);

        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        const path =
            `products/${productId}/${randomUUID()}.${extension}`;

        await this.storage.upload(path, file.buffer, file.mimetype);

        try {
            const image = await this.prisma.$transaction(async (tx) => {
                const imageCount = await tx.productImage.count({
                    where: { productId },
                });

                const isPrimary =
                    options.isPrimary ?? imageCount === 0;

                if (isPrimary) {
                    await tx.productImage.updateMany({
                        where: {
                            productId,
                            isPrimary: true,
                        },
                        data: { isPrimary: false },
                    });
                }

                return tx.productImage.create({
                    data: {
                        productId,
                        path,
                        isPrimary,
                        sortOrder: options.sortOrder ?? imageCount,
                    },
                });
            });

            return {
                ...image,
                url: this.storage.getPublicUrl(image.path),
            };
        } catch (error) {
            await this.storage.remove(path).catch(() => undefined);
            throw error;
        }
    }

    async uploadVariantImage(
        productId: number,
        variantId: number,
        file: Express.Multer.File,
    ) {
        if (!file) {
            throw new BadRequestException('Image file is required.');
        }

        const extension = this.getExtension(file);

        const variant = await this.prisma.productVariant.findFirst({
            where: {
                id: variantId,
                productId,
            },
            select: {
                id: true,
                imagePath: true,
            },
        });

        if (!variant) {
            throw new NotFoundException(
                'Product variant not found.',
            );
        }

        const path =
            `products/${productId}/variants/${variantId}/${randomUUID()}.${extension}`;

        await this.storage.upload(path, file.buffer, file.mimetype);

        try {
            await this.prisma.productVariant.update({
                where: { id: variantId },
                data: { imagePath: path },
            });
        } catch (error) {
            await this.storage.remove(path).catch(() => undefined);
            throw error;
        }

        if (variant.imagePath) {
            await this.storage.remove(variant.imagePath)
                .catch(() => undefined);
        }

        return {
            variantId,
            imagePath: path,
            url: this.storage.getPublicUrl(path),
        };
    }

    async deleteProductImage(
        productId: number,
        imageId: number,
    ): Promise<void> {
        const image = await this.prisma.productImage.findFirst({
            where: {
                id: imageId,
                productId,
            },
        });

        if (!image) {
            throw new NotFoundException('Product image not found.');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.productImage.delete({
                where: { id: imageId },
            });

            if (image.isPrimary) {
                const nextImage = await tx.productImage.findFirst({
                    where: { productId },
                    orderBy: [
                        { sortOrder: 'asc' },
                        { id: 'asc' },
                    ],
                });

                if (nextImage) {
                    await tx.productImage.update({
                        where: { id: nextImage.id },
                        data: { isPrimary: true },
                    });
                }
            }
        });

        // If this fails, the database deletion has already succeeded.
        // Log the failure and clean up orphaned files separately.
        await this.storage.remove(image.path);
    }

    async getProductImages(productId: number) {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { id: true },
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        const images = await this.prisma.productImage.findMany({
            where: { productId },
            orderBy: [
                { isPrimary: 'desc' },
                { sortOrder: 'asc' },
            ],
        });

        return images.map((image) => ({
            ...image,
            url: this.storage.getPublicUrl(image.path),
        }));
    }
}
