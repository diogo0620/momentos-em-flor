import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import {
    UpdateProductComponentItemDto,
    UpdateProductConfigurationDto,
    UpdateProductImageItemDto,
    UpdateProductVariantItemDto,
} from './dto/update-product-configuration.dto';

@Injectable()
export class ProductConfigurationService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async update(
        productId: number,
        dto: UpdateProductConfigurationDto,
    ) {
        const product = await this.prisma.product.findFirst({
            where: {
                id: productId,
                deletedAt: null,
            },
            include: {
                components: {
                    where: {
                        deletedAt: null,
                    },
                },
                variants: {
                    where: {
                        deletedAt: null,
                    },
                },
                images: {
                    where: {
                        deletedAt: null,
                    },
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found.');
        }

        this.validateConfiguration(dto);

        return this.prisma.$transaction(async (tx) => {

            if (dto.components !== undefined) {
                await this.syncComponents(
                    tx,
                    productId,
                    dto.components,
                );
            }

            let variantClientIdMap = new Map<string, number>();
            if (dto.variants !== undefined) {
                variantClientIdMap = await this.syncVariants(
                    tx,
                    productId,
                    dto.variants,
                );
            }

            if (dto.images !== undefined) {
                await this.syncImages(
                    tx,
                    productId,
                    dto.images,
                    variantClientIdMap
                );
            }

            return tx.product.findUnique({
                where: {
                    id: productId,
                },
                include: {
                    components: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                    },
                    variants: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: {
                            sortOrder: 'asc',
                        },
                        include: {
                            image: {
                                include: {
                                    file: true,
                                },
                            },
                        },
                    },
                    images: {
                        where: {
                            deletedAt: null,
                        },
                        orderBy: [
                            {
                                isPrimary: 'desc',
                            },
                            {
                                sortOrder: 'asc',
                            },
                        ],
                        include: {
                            file: true,
                        },
                    },
                },
            });
        });
    }

    private validateConfiguration(
        dto: UpdateProductConfigurationDto,
    ): void {

        const hasComponents =
            dto.components !== undefined &&
            dto.components.length > 0;

        const hasVariants =
            dto.variants !== undefined &&
            dto.variants.length > 0;

        if (hasComponents && hasVariants) {
            throw new BadRequestException(
                'A product cannot have both components and variants.',
            );
        }

        if (dto.components) {
            for (const component of dto.components) {
                if (
                    component.minQuantity >
                    component.recommendedQuantity
                ) {
                    throw new BadRequestException(
                        `Component "${component.name}": recommended quantity cannot be below minimum quantity.`,
                    );
                }

                if (
                    component.recommendedQuantity >
                    component.maxQuantity
                ) {
                    throw new BadRequestException(
                        `Component "${component.name}": recommended quantity cannot exceed maximum quantity.`,
                    );
                }

                if (
                    component.minQuantity >
                    component.maxQuantity
                ) {
                    throw new BadRequestException(
                        `Component "${component.name}": minimum quantity cannot exceed maximum quantity.`,
                    );
                }
            }
        }

        if (dto.variants) {
            for (const variant of dto.variants) {
                if (
                    variant.floristCompensation >=
                    variant.price
                ) {
                    throw new BadRequestException(
                        `Variant "${variant.name}": florist compensation must be lower than price.`,
                    );
                }
            }
        }
    }

    private async syncComponents(
        tx: any,
        productId: number,
        components: UpdateProductComponentItemDto[],
    ): Promise<void> {

        const existing = await tx.productComponent.findMany({
            where: {
                productId,
                deletedAt: null,
            },
        });

        const incomingIds = components
            .filter((component) => component.id !== undefined)
            .map((component) => component.id);

        const idsToDelete = existing
            .filter((component: any) => !incomingIds.includes(component.id))
            .map((component: any) => component.id);

        if (idsToDelete.length > 0) {
            await tx.productComponent.updateMany({
                where: {
                    id: {
                        in: idsToDelete,
                    },
                    productId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
        }

        for (const component of components) {

            const data = {
                name: component.name,
                minQuantity: component.minQuantity,
                recommendedQuantity: component.recommendedQuantity,
                maxQuantity: component.maxQuantity,
                customerPricePerAdditionalUnit:
                    component.customerPricePerAdditionalUnit,
                floristCompensationPerAdditionalUnit:
                    component.floristCompensationPerAdditionalUnit,
                active: component.active ?? true,
                sortOrder: component.sortOrder,
            };

            if (component.id !== undefined) {

                const current = existing.find(
                    (item: any) =>
                        item.id === component.id,
                );

                if (!current) {
                    throw new BadRequestException(
                        `Component ${component.id} does not belong to this product.`,
                    );
                }

                await tx.productComponent.update({
                    where: {
                        id: component.id,
                    },
                    data,
                });

            } else {

                await tx.productComponent.create({
                    data: {
                        productId,
                        ...data,
                    },
                });
            }
        }
    }

private async syncVariants(
    tx: any,
    productId: number,
    variants: UpdateProductVariantItemDto[],
): Promise<Map<string, number>> {

    const existing = await tx.productVariant.findMany({
        where: {
            productId,
            deletedAt: null,
        },
    });

    const incomingIds = variants
        .filter((variant) => variant.id !== undefined)
        .map((variant) => variant.id);

    const idsToDelete = existing
        .filter(
            (variant: any) =>
                !incomingIds.includes(variant.id),
        )
        .map((variant: any) => variant.id);

    if (idsToDelete.length > 0) {
        await tx.productImage.updateMany({
            where: {
                productId,
                variantId: {
                    in: idsToDelete,
                },
            },
            data: {
                variantId: null,
            },
        });

        await tx.productVariant.updateMany({
            where: {
                id: {
                    in: idsToDelete,
                },
                productId,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    const clientIdMap = new Map<string, number>();

    for (const variant of variants) {
        const data = {
            type: variant.type,
            name: variant.name,
            code: variant.code ?? null,
            price: variant.price,
            floristCompensation:
                variant.floristCompensation,
            active: variant.active ?? true,
            sortOrder: variant.sortOrder,
        };

        let variantId: number;

        if (variant.id !== undefined) {
            const current = existing.find(
                (item: any) =>
                    item.id === variant.id,
            );

            if (!current) {
                throw new BadRequestException(
                    `Variant ${variant.id} does not belong to this product.`,
                );
            }

            await tx.productVariant.update({
                where: {
                    id: variant.id,
                },
                data,
            });

            variantId = variant.id;
        } else {
            const created =
                await tx.productVariant.create({
                    data: {
                        productId,
                        ...data,
                    },
                });

            variantId = created.id;
        }

        if (variant.clientId) {
            if (clientIdMap.has(variant.clientId)) {
                throw new BadRequestException(
                    `Duplicate variant clientId "${variant.clientId}".`,
                );
            }

            clientIdMap.set(
                variant.clientId,
                variantId,
            );
        }

        if (variant.imageId !== undefined) {
            await this.assignVariantImage(
                tx,
                productId,
                variantId,
                variant.imageId,
            );
        }
    }

    return clientIdMap;
}

    private async syncImages(
    tx: any,
    productId: number,
    images: UpdateProductImageItemDto[],
    variantClientIdMap: Map<string, number>,
): Promise<void> {

        const existing = await tx.productImage.findMany({
            where: {
                productId,
                deletedAt: null,
            },
        });

        const incomingIds = images
            .filter((image) => image.id !== undefined)
            .map((image) => image.id);

        const idsToDelete = existing
            .filter((image: any) => !incomingIds.includes(image.id))
            .map((image: any) => image.id);

        if (idsToDelete.length > 0) {
            await tx.productImage.updateMany({
                where: {
                    id: {
                        in: idsToDelete,
                    },
                    productId,
                },
                data: {
                    deletedAt: new Date(),
                },
            });
        }

        for (const image of images) {

            if (
        image.variantId !== undefined &&
        image.variantClientId !== undefined &&
        image.variantClientId !== null
    ) {
        throw new BadRequestException(
            'An image cannot have both variantId and variantClientId.',
        );
    }

    let variantId =
        image.variantId ?? null;

    if (image.variantClientId) {
        variantId =
            variantClientIdMap.get(
                image.variantClientId,
            ) ?? null;

        if (variantId === null) {
            throw new BadRequestException(
                `Variant clientId "${image.variantClientId}" does not match any variant.`,
            );
        }
    }

    await this.validateImageVariant(
        tx,
        productId,
        variantId,
    );

    const data = {
        fileId: image.fileId,
        altText: image.altText ?? null,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        variantId,
    };

            if (image.id !== undefined) {

                const current = existing.find(
                    (item: any) =>
                        item.id === image.id,
                );

                if (!current) {
                    throw new BadRequestException(
                        `Image ${image.id} does not belong to this product.`,
                    );
                }

                await tx.productImage.update({
                    where: {
                        id: image.id,
                    },
                    data,
                });

            } else {

                await tx.productImage.create({
                    data: {
                        productId,
                        ...data,
                    },
                });
            }
        }

        await this.normalizePrimaryImages(
            tx,
            productId,
        );
    }

    private async assignVariantImage(
        tx: any,
        productId: number,
        variantId: number,
        imageId: number | null,
    ): Promise<void> {

        if (imageId === null) {

            await tx.productImage.updateMany({
                where: {
                    productId,
                    variantId,
                },
                data: {
                    variantId: null,
                },
            });

            return;
        }

        const image = await tx.productImage.findFirst({
            where: {
                id: imageId,
                productId,
                deletedAt: null,
            },
        });

        if (!image) {
            throw new BadRequestException(
                `Image ${imageId} does not belong to this product.`,
            );
        }

        await tx.productImage.updateMany({
            where: {
                productId,
                variantId,
            },
            data: {
                variantId: null,
            },
        });

        await tx.productImage.update({
            where: {
                id: imageId,
            },
            data: {
                variantId,
            },
        });
    }

    private async validateImageVariant(
        tx: any,
        productId: number,
        variantId: number | null,
    ): Promise<void> {

        if (variantId === null) {
            return;
        }

        const variant =
            await tx.productVariant.findFirst({
                where: {
                    id: variantId,
                    productId,
                    deletedAt: null,
                },
            });

        if (!variant) {
            throw new BadRequestException(
                `Variant ${variantId} does not belong to this product.`,
            );
        }
    }

    private async normalizePrimaryImages(
        tx: any,
        productId: number,
    ): Promise<void> {

        const images = await tx.productImage.findMany({
            where: {
                productId,
                deletedAt: null,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });

        const primaryImages = images.filter(
            (image: any) => image.isPrimary,
        );

        if (primaryImages.length <= 1) {
            return;
        }

        const firstPrimary = primaryImages[0];

        await tx.productImage.updateMany({
            where: {
                productId,
                deletedAt: null,
                id: {
                    not: firstPrimary.id,
                },
            },
            data: {
                isPrimary: false,
            },
        });
    }
}