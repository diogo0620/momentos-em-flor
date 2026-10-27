import { Injectable, Logger } from '@nestjs/common';

import { CustomerCreateOrderDto } from './dtos/customer-create-order.dto';
import { CustomerOrderQueryDto } from './dtos/customer-order-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { OrderItemType, OrderStatus, Prisma, StoreSettings } from '@prisma/client';
import { CustomerOrderResponseDto } from './dtos/customer-order-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { CustomerOrdersMapper } from './mappers/customer-orders.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { CustomerUpdateOrderDto } from './dtos/customer-update-order.dto';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { AdminStoreSettingsService } from '@/store-settings/admin/admin-store-settings.service';


@Injectable()
export class CustomerOrdersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: CustomerOrdersMapper,
        private readonly storeSettingsService: AdminStoreSettingsService
    ) { }



    async findAll(user: AuthenticatedUser, query: CustomerOrderQueryDto) {
        const { page, pageSize, search, sort, status, order } = query;

        const where: Prisma.OrderWhereInput = {
            ...(search && {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...{ customerId: user.id },
            ...(status !== undefined && { status }),
        };

        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                orderBy: { [sort]: order },
                ...getPagination(page, pageSize),
            }),
            this.prisma.order.count({ where }),
        ]);

        return ApiResponse.paginated(
            this.mapper.toListResponse(orders),
            getPaginationResponse(page, pageSize, total),
        );
    }


    async findOne(user: AuthenticatedUser, orderNumber: string): Promise<CustomerOrderResponseDto> {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber, customerId: user.id },
            include: {
                items: {
                    include: {
                        components: true,
                    },
                }
            }
        });

        if (!order) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(order),
        );
    }

    async create(
        user: AuthenticatedUser,
        dto: CustomerCreateOrderDto,
    ): Promise<EntityIdResponseDto> {
        const roundMoney = (value: number): number =>
            Number(value.toFixed(2));

        /*
         * 1. Load store settings and products
         */

        const settings = await this.storeSettingsService.get();

        const deliveryFee = roundMoney(
            Number(settings.deliveryFee ?? 0),
        );

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: dto.items.map((item) => item.productId),
                },
            },
            include: {
                taxCode: true,
                variants: true,
                components: true
            },
        });

        const productsById = new Map(
            products.map((product) => [product.id, product]),
        );

        /*
         * 2. Prepare order items and calculate product totals
         */

        const itemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        const calculatedItems: Array<{
            taxCodeId: number;
            taxRate: number;
            netAmount: number;
            taxAmount: number;
            grossAmount: number;
        }> = [];

        for (const requestedItem of dto.items) {
            const product = productsById.get(requestedItem.productId)!;

            const selectedVariant = requestedItem.variantId
                ? product.variants.find(
                    (variant) => variant.id === requestedItem.variantId,
                )
                : undefined;

            const imagePath =
                selectedVariant?.imagePath ??
                product?.imagePath ??
                null;

            const selectedComponents = requestedItem.components ?? [];

            const componentSnapshots: Prisma.OrderItemComponentCreateWithoutOrderItemInput[] =
                [];

            let customerPrice = Number(
                selectedVariant?.customerPrice ?? product.customerPrice,
            );

            let floristPrice = Number(
                selectedVariant?.floristPrice ?? product.floristPrice,
            );

            /*
             * 3. Calculate component prices
             */

            for (const component of product.components) {
                const selection = selectedComponents.find(
                    (item) => item.componentId === component.id,
                );

                const quantity =
                    selection?.quantity ?? component.recommendedQuantity;

                const additionalUnits = Math.max(
                    0,
                    quantity - component.minQuantity,
                );

                const customerPricePerAdditionalUnit = Number(
                    component.customerPricePerAdditionalUnit,
                );

                const floristPricePerAdditionalUnit = Number(
                    component.floristPricePerAdditionalUnit,
                );

                const customerAdditionalPrice = roundMoney(
                    additionalUnits * customerPricePerAdditionalUnit,
                );

                const floristAdditionalPrice = roundMoney(
                    additionalUnits * floristPricePerAdditionalUnit,
                );

                customerPrice = roundMoney(
                    customerPrice + customerAdditionalPrice,
                );

                floristPrice = roundMoney(
                    floristPrice + floristAdditionalPrice,
                );

                componentSnapshots.push({
                    componentId: component.id,
                    componentName: component.name,
                    quantity,
                    additionalUnits,
                    customerPricePerAdditionalUnit,
                    customerTotalPrice: roundMoney(
                        customerAdditionalPrice * requestedItem.quantity,
                    ),
                });
            }

            /*
             * 4. Calculate VAT
             *
             * Catalog prices include VAT.
             */

            const taxRate = Number(product.taxCode.rate);

            const grossAmount = roundMoney(
                customerPrice * requestedItem.quantity,
            );

            const netAmount = roundMoney(
                grossAmount / (1 + taxRate / 100),
            );

            const taxAmount = roundMoney(
                grossAmount - netAmount,
            );

            calculatedItems.push({
                taxCodeId: product.taxCodeId,
                taxRate,
                netAmount,
                taxAmount,
                grossAmount,
            });

            /*
             * 5. Create the product snapshot
             */

            itemsToCreate.push({
                type: OrderItemType.PRODUCT,

                product: {
                    connect: {
                        id: product.id,
                    },
                },

                name: product.name,
                description: product.description,
                imagePath,

                ...(selectedVariant && {
                    variantId: selectedVariant.id,
                    variantType: selectedVariant.type,
                    variantName: selectedVariant.name,
                }),

                quantity: requestedItem.quantity,

                customerPrice,
                floristPrice,

                netAmount,
                taxAmount,
                grossAmount,

                taxCode: {
                    connect: {
                        id: product.taxCodeId,
                    },
                },
                taxRate,

                ...(componentSnapshots.length > 0 && {
                    components: {
                        create: componentSnapshots,
                    },
                }),
            });
        }

        /*
         * 6. Calculate delivery VAT allocation
         */

        const deliveryTaxAllocation =
            this.calculateDeliveryTaxAllocation(
                calculatedItems.map((item) => ({
                    taxCodeId: item.taxCodeId,
                    taxRate: item.taxRate,
                    grossAmount: item.grossAmount,
                })),
                deliveryFee,
            );

        /*
         * 7. Add delivery fee order items
         */

        for (const delivery of deliveryTaxAllocation) {
            itemsToCreate.push({
                type: OrderItemType.DELIVERY_FEE,

                name: 'Taxa de entrega',
                description: null,

                quantity: 1,

                customerPrice: delivery.grossAmount,
                floristPrice: 0,

                netAmount: delivery.netAmount,
                taxAmount: delivery.taxAmount,
                grossAmount: delivery.grossAmount,

                taxCode: {
                    connect: {
                        id: delivery.taxCodeId,
                    },
                },
                taxRate: delivery.taxRate,
            });
        }

        /*
         * 8. Calculate order totals
         */

        const productNetAmount = roundMoney(
            calculatedItems.reduce(
                (sum, item) => sum + item.netAmount,
                0,
            ),
        );

        const productTaxAmount = roundMoney(
            calculatedItems.reduce(
                (sum, item) => sum + item.taxAmount,
                0,
            ),
        );

        const deliveryNetAmount = roundMoney(
            deliveryTaxAllocation.reduce(
                (sum, item) => sum + item.netAmount,
                0,
            ),
        );

        const deliveryTaxAmount = roundMoney(
            deliveryTaxAllocation.reduce(
                (sum, item) => sum + item.taxAmount,
                0,
            ),
        );

        const subtotal = roundMoney(
            productNetAmount + deliveryNetAmount,
        );

        const taxAmount = roundMoney(
            productTaxAmount + deliveryTaxAmount,
        );

        const discount = 0;

        const total = roundMoney(
            subtotal + taxAmount - discount,
        );

        /*
         * 9. Aggregate tax totals by tax code
         */

        const taxTotalsMap = new Map<
            number,
            {
                taxCodeId: number;
                netAmount: number;
                taxAmount: number;
                grossAmount: number;
            }
        >();

        for (const item of calculatedItems) {
            const existing = taxTotalsMap.get(item.taxCodeId);

            if (existing) {
                existing.netAmount = roundMoney(
                    existing.netAmount + item.netAmount,
                );

                existing.taxAmount = roundMoney(
                    existing.taxAmount + item.taxAmount,
                );

                existing.grossAmount = roundMoney(
                    existing.grossAmount + item.grossAmount,
                );
            } else {
                taxTotalsMap.set(item.taxCodeId, {
                    taxCodeId: item.taxCodeId,
                    netAmount: item.netAmount,
                    taxAmount: item.taxAmount,
                    grossAmount: item.grossAmount,
                });
            }
        }

        for (const delivery of deliveryTaxAllocation) {
            const existing = taxTotalsMap.get(delivery.taxCodeId);

            if (existing) {
                existing.netAmount = roundMoney(
                    existing.netAmount + delivery.netAmount,
                );

                existing.taxAmount = roundMoney(
                    existing.taxAmount + delivery.taxAmount,
                );

                existing.grossAmount = roundMoney(
                    existing.grossAmount + delivery.grossAmount,
                );
            } else {
                taxTotalsMap.set(delivery.taxCodeId, {
                    taxCodeId: delivery.taxCodeId,
                    netAmount: delivery.netAmount,
                    taxAmount: delivery.taxAmount,
                    grossAmount: delivery.grossAmount,
                });
            }
        }

        /*
         * 10. Generate order number
         */

        const orderNumber = await this.generateOrderNumber();

        /*
         * 11. Create the order, items and tax totals atomically
         */

        Logger.log("User", user)
        const order = await this.prisma.$transaction(async (tx) => {
            return tx.order.create({
                data: {
                    orderNumber,

                    customer: {
                        connect: {
                            id: user.id,
                        },
                    },

                    customerFirstName: user.firstName,
                    customerLastName: user.lastName,
                    customerEmail: user.email,
                    customerPhone: user.phone,

                    customerTaxNumber: dto.customerTaxNumber ?? null,

                    recipientFirstName: dto.recipientFirstName,
                    recipientLastName: dto.recipientLastName,
                    recipientPhone: dto.recipientPhone,
                    occasion: dto.occasion,

                    deliveryDate: new Date(dto.deliveryDate),
                    deliveryTimeSlot: dto.deliveryTimeSlot,
                    deliveryInstructions: dto.deliveryInstructions,

                    deliveryStreet: dto.deliveryStreet,
                    deliveryStreetNumber: dto.deliveryStreetNumber,
                    deliveryStreet2: dto.deliveryStreet2,
                    deliveryPostalCode: dto.deliveryPostalCode,
                    deliveryCity: dto.deliveryCity,
                    deliveryDistrict: dto.deliveryDistrict,
                    deliveryCountryCode: dto.deliveryCountryCode.toUpperCase(),

                    cardMessage: dto.cardMessage,

                    subtotal,
                    taxAmount,
                    deliveryFee,
                    discount,
                    total,

                    status: OrderStatus.PENDING_PAYMENT,

                    items: {
                        create: itemsToCreate,
                    },

                    taxTotals: {
                        create: Array.from(taxTotalsMap.values()).map(
                            (taxTotal) => ({
                                netAmount: taxTotal.netAmount,
                                taxAmount: taxTotal.taxAmount,
                                grossAmount: taxTotal.grossAmount,
                                taxCode: {
                                    connect: {
                                        id: taxTotal.taxCodeId,
                                    },
                                },
                            }),
                        ),
                    },
                },
            });
        });

        return ApiResponse.success(
            this.mapper.toCreatedResponse(order),
        );
    }


    async update(
        user: AuthenticatedUser,
        orderNumber: string,
        dto: CustomerUpdateOrderDto,
    ): Promise<void> {
        try {
            await this.prisma.order.update({
                where: { orderNumber, customerId: user.id },
                data: {
                    ...(dto.recipientFirstName !== undefined && { recipientFirstName: dto.recipientFirstName }),
                    ...(dto.recipientLastName !== undefined && { recipientLastName: dto.recipientLastName }),
                    ...(dto.recipientPhone !== undefined && { recipientPhone: dto.recipientPhone }),
                    ...(dto.occasion !== undefined && { occasion: dto.occasion }),
                    ...(dto.deliveryInstructions !== undefined && { deliveryInstructions: dto.deliveryInstructions }),
                    ...(dto.cardMessage !== undefined && { cardMessage: dto.cardMessage })
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                switch (error.code) {
                    case 'P2002':
                        Exceptions.conflict(ERROR_MESSAGES.ORDER_ALREADY_EXISTS);
                    case 'P2025':
                        Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND)
                }
            }

            throw error;
        }
    }

    private calculateDeliveryTaxAllocation(
        items: Array<{
            taxCodeId: number;
            taxRate: number;
            grossAmount: number;
        }>,
        deliveryFee: number,
    ) {
        const grossTotal = this.roundMoney(
            items.reduce(
                (total, item) => total + item.grossAmount,
                0,
            ),
        );

        if (deliveryFee <= 0 || grossTotal <= 0) {
            return [];
        }

        const taxGroups = new Map<
            number,
            {
                taxCodeId: number;
                taxRate: number;
                grossAmount: number;
            }
        >();

        for (const item of items) {
            const existing = taxGroups.get(item.taxCodeId);

            if (existing) {
                existing.grossAmount = this.roundMoney(
                    existing.grossAmount + item.grossAmount,
                );
            } else {
                taxGroups.set(item.taxCodeId, {
                    taxCodeId: item.taxCodeId,
                    taxRate: item.taxRate,
                    grossAmount: item.grossAmount,
                });
            }
        }

        const groups = Array.from(taxGroups.values());

        let allocatedDeliveryFee = 0;

        return groups.map((group, index) => {
            const isLast = index === groups.length - 1;

            const deliveryGrossAmount = isLast
                ? this.roundMoney(
                    deliveryFee - allocatedDeliveryFee,
                )
                : this.roundMoney(
                    deliveryFee *
                    (group.grossAmount / grossTotal),
                );

            allocatedDeliveryFee = this.roundMoney(
                allocatedDeliveryFee +
                deliveryGrossAmount,
            );

            const deliveryNetAmount = this.roundMoney(
                deliveryGrossAmount /
                (1 + group.taxRate / 100),
            );

            const deliveryTaxAmount = this.roundMoney(
                deliveryGrossAmount -
                deliveryNetAmount,
            );

            return {
                taxCodeId: group.taxCodeId,
                taxRate: group.taxRate,
                grossAmount: deliveryGrossAmount,
                netAmount: deliveryNetAmount,
                taxAmount: deliveryTaxAmount,
            };
        });
    }

    private roundMoney(
        value: number,
    ): number {
        return Number(
            value.toFixed(2),
        );
    }

    private async generateOrderNumber(): Promise<string> {
        const year =
            new Date().getFullYear();

        let orderNumber: string;

        do {
            const random =
                Math.floor(
                    100000 +
                    Math.random() *
                    900000,
                );

            orderNumber =
                `MF-${year}-${random}`;

            const existing =
                await this.prisma.order.findUnique({
                    where: {
                        orderNumber,
                    },
                });

            if (!existing) {
                return orderNumber;
            }

        } while (true);
    }
}