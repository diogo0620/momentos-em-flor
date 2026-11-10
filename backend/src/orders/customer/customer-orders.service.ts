import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { CustomerCreateOrderDto } from './dtos/customer-create-order.dto';
import { CustomerOrderQueryDto } from './dtos/customer-order-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Exceptions } from '@/common/exceptions/exceptions';
import { ERROR_MESSAGES } from '@/common/errors/error-messages';
import { OrderCancellationReason, OrderItemType, OrderStatus, PaymentStatus, Prisma, ReviewCategory } from '@prisma/client';
import { CustomerOrderResponseDto } from './dtos/customer-order-response.dto';
import { ApiResponse } from '@/common/responses/api-response';
import { CustomerOrdersMapper } from './mappers/customer-orders.mapper';
import { EntityIdResponseDto } from '@/common/responses/dto/entity-id-response.dto';
import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';
import { CustomerUpdateOrderDto } from './dtos/customer-update-order.dto';
import { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import { AdminStoreSettingsService } from '@/store-settings/admin/admin-store-settings.service';
import { StripeService } from '@/payments/stripe.service';
import { normalizeOptionalPhoneNumber } from '@/common/phone/phone-number';
import { DeliveryAreaService } from '@/store-settings/delivery-area.service';
import { CustomerCreateOrderReviewDto } from './dtos/customer-create-order-review.dto';
import { toInternalOrderStatusFilter } from './customer-order-status';
import { CouponsService } from '@/coupons/coupons.service';
import { formatOrderItemConfiguration } from '../order-item-configuration';


@Injectable()
export class CustomerOrdersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly mapper: CustomerOrdersMapper,
        private readonly storeSettingsService: AdminStoreSettingsService,
        private readonly stripeService: StripeService,
        private readonly deliveryArea: DeliveryAreaService,
        private readonly coupons: CouponsService,
    ) { }

    async cancelPendingPayment(
        user: AuthenticatedUser,
        orderNumber: string,
    ): Promise<void> {
        const order = await this.prisma.order.findUnique({
            where: {
                orderNumber,
                customerId: user.id,
            },
            select: {
                id: true,
                status: true,
                payment: {
                    select: {
                        id: true,
                        status: true,
                        stripePaymentIntentId: true,
                    },
                },
            },
        });

        if (!order) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        if (
            order.status !== OrderStatus.PENDING_PAYMENT ||
            order.payment?.status === PaymentStatus.PAID
        ) {
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_CANNOT_BE_CANCELLED);
        }

        if (order.payment?.stripePaymentIntentId) {
            const intent = await this.stripeService.retrievePaymentIntent(
                order.payment.stripePaymentIntentId,
            );

            if (intent.status === 'succeeded') {
                Exceptions.badRequest(ERROR_MESSAGES.ORDER_CANNOT_BE_CANCELLED);
            }

            if (intent.status !== 'canceled') {
                await this.stripeService.cancelPaymentIntent(intent.id);
            }
        }

        await this.prisma.$transaction(async (tx) => {
            const cancelled = await tx.order.updateMany({
                where: {
                    id: order.id,
                    customerId: user.id,
                    status: OrderStatus.PENDING_PAYMENT,
                },
                data: {
                    status: OrderStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancellationReason: OrderCancellationReason.CUSTOMER_REQUEST,
                    cancellationReasonDetails: 'Cancelada pelo cliente antes do pagamento.',
                },
            });

            if (cancelled.count !== 1) {
                Exceptions.badRequest(ERROR_MESSAGES.INVALID_ORDER_STATUS_TRANSITION);
            }

            if (order.payment) {
                await tx.payment.updateMany({
                    where: {
                        id: order.payment.id,
                        status: PaymentStatus.PENDING,
                    },
                    data: {
                        status: PaymentStatus.CANCELLED,
                    },
                });
            }

            await tx.couponRedemption.deleteMany({ where: { orderId: order.id } });
        });
    }



    async findAll(user: AuthenticatedUser, query: CustomerOrderQueryDto) {
        const { page, pageSize, search, sort, status, order } = query;

        const where: Prisma.OrderWhereInput = {
            ...(search && {
                OR: [
                    { orderNumber: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...{ customerId: user.id },
            ...(status !== undefined && {
                status: toInternalOrderStatusFilter(status),
            }),
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
                },
                review: { include: { ratings: true } },
                moloniFiscalDocument: {
                    select: { invoiceId: true },
                },
            }
        });

        if (!order) {
            Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        }

        return ApiResponse.success(
            this.mapper.toDetailResponse(order),
        );
    }

    async createReview(
        user: AuthenticatedUser,
        orderNumber: string,
        dto: CustomerCreateOrderReviewDto,
    ) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber, customerId: user.id },
            select: {
                id: true,
                status: true,
                assignedFloristId: true,
                review: { select: { id: true } },
            },
        });
        if (!order) Exceptions.notFound(ERROR_MESSAGES.ORDER_NOT_FOUND);
        if (order.status !== OrderStatus.DELIVERED || !order.assignedFloristId) {
            throw new BadRequestException(
                'Só é possível avaliar uma encomenda depois de esta ser entregue.',
            );
        }
        if (order.review) {
            throw new ConflictException('Esta encomenda já foi avaliada.');
        }

        const ratings = [
            { category: ReviewCategory.FLOWER_QUALITY, rating: dto.flowerQuality },
            { category: ReviewCategory.PRESENTATION, rating: dto.presentation },
            { category: ReviewCategory.DELIVERY, rating: dto.delivery },
            { category: ReviewCategory.SERVICE, rating: dto.service },
        ];

        try {
            const review = await this.prisma.$transaction(async (tx) => {
                const created = await tx.orderReview.create({
                    data: {
                        orderId: order.id,
                        customerId: user.id,
                        floristId: order.assignedFloristId!,
                        comment: dto.comment?.trim() || null,
                        ratings: { create: ratings },
                    },
                    include: { ratings: true },
                });
                const summary = await tx.orderReviewRating.aggregate({
                    where: { review: { floristId: order.assignedFloristId! } },
                    _avg: { rating: true },
                });
                const reviewCount = await tx.orderReview.count({
                    where: { floristId: order.assignedFloristId! },
                });
                await tx.florist.update({
                    where: { id: order.assignedFloristId! },
                    data: {
                        averageRating: summary._avg.rating ?? 0,
                        reviewCount,
                    },
                });
                return created;
            });
            return ApiResponse.success({
                id: review.id,
                comment: review.comment,
                averageRating: Number(
                    (review.ratings.reduce((sum, item) => sum + item.rating, 0) /
                        review.ratings.length).toFixed(2),
                ),
                ratings: review.ratings,
                createdAt: review.createdAt,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Esta encomenda já foi avaliada.');
            }
            throw error;
        }
    }

    async create(
        user: AuthenticatedUser,
        dto: CustomerCreateOrderDto,
    ): Promise<EntityIdResponseDto> {
        const roundMoney = (value: number): number =>
            Number(value.toFixed(2));

        if (dto.items.length === 0) {
            Exceptions.badRequest(ERROR_MESSAGES.ORDER_ITEMS_REQUIRED);
        }

        const todayInLisbon = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Lisbon',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());

        if (dto.deliveryDate.slice(0, 10) < todayInLisbon) {
            Exceptions.badRequest(ERROR_MESSAGES.DELIVERY_DATE_IN_PAST);
        }

        /*
         * 1. Load store settings and products
         */

        const settings = await this.storeSettingsService.get();

        const deliveryFee = roundMoney(
            Number(settings.deliveryFee ?? 0),
        );

        if (
            !settings.deliveryTaxCodeId ||
            settings.deliveryTaxRate === null
        ) {
            Exceptions.badRequest(
                ERROR_MESSAGES.DELIVERY_TAX_CODE_NOT_CONFIGURED,
            );
        }

        const deliveryTaxCodeId = settings.deliveryTaxCodeId;
        const deliveryTaxRate = Number(settings.deliveryTaxRate);

        const products = await this.prisma.product.findMany({
            where: {
                active: true,
                id: {
                    in: dto.items.map((item) => item.productId),
                },
            },
            include: {
                taxCode: true,
                variants: {
                    where: { active: true },
                },
                components: {
                    where: { active: true },
                },
            },
        });

        const productsById = new Map(
            products.map((product) => [product.id, product]),
        );

        if (productsById.size !== new Set(dto.items.map((item) => item.productId)).size) {
            Exceptions.badRequest(ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE);
        }

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
        let expectedFloristTotal = 0;

        for (const requestedItem of dto.items) {
            const product = productsById.get(requestedItem.productId);

            if (!product || !product.taxCode.active) {
                Exceptions.badRequest(ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE);
            }

            const selectedVariant = requestedItem.variantId
                ? product.variants.find(
                    (variant) => variant.id === requestedItem.variantId,
                )
                : undefined;

            if (requestedItem.variantId && !selectedVariant) {
                Exceptions.badRequest(ERROR_MESSAGES.INVALID_PRODUCT_VARIANT);
            }

            if (product.variants.length > 0 && !selectedVariant) {
                Exceptions.badRequest(ERROR_MESSAGES.PRODUCT_VARIANT_REQUIRED);
            }

            const imagePath =
                selectedVariant?.imagePath ??
                product?.imagePath ??
                null;

            const selectedComponents = requestedItem.components ?? [];

            const selectedComponentIds = selectedComponents.map(
                (component) => component.componentId,
            );

            if (new Set(selectedComponentIds).size !== selectedComponentIds.length) {
                Exceptions.badRequest(ERROR_MESSAGES.DUPLICATE_PRODUCT_COMPONENT);
            }

            const componentsById = new Map(
                product.components.map((component) => [component.id, component]),
            );

            for (const selection of selectedComponents) {
                const component = componentsById.get(selection.componentId);

                if (!component) {
                    Exceptions.badRequest(ERROR_MESSAGES.INVALID_PRODUCT_COMPONENT);
                }

                if (
                    selection.quantity < component.minQuantity ||
                    selection.quantity > component.maxQuantity
                ) {
                    Exceptions.badRequest(ERROR_MESSAGES.INVALID_COMPONENT_QUANTITY);
                }
            }

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

            expectedFloristTotal = roundMoney(
                expectedFloristTotal +
                floristPrice * requestedItem.quantity,
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
                description: formatOrderItemConfiguration({
                    variantType: selectedVariant?.type,
                    variantName: selectedVariant?.name,
                    components: componentSnapshots,
                }),
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

        const deliveryGrossAmount = deliveryFee;
        const deliveryNetAmount = roundMoney(
            deliveryGrossAmount / (1 + deliveryTaxRate / 100),
        );
        const deliveryTaxAmount = roundMoney(
            deliveryGrossAmount - deliveryNetAmount,
        );

        /*
         * 7. Add delivery fee order items
         */

        itemsToCreate.push({
            type: OrderItemType.DELIVERY_FEE,

            name: 'Taxa de entrega',
            description: null,

            quantity: 1,

            customerPrice: deliveryGrossAmount,
            floristPrice: 0,

            netAmount: deliveryNetAmount,
            taxAmount: deliveryTaxAmount,
            grossAmount: deliveryGrossAmount,

            taxCode: {
                connect: {
                    id: deliveryTaxCodeId,
                },
            },
            taxRate: deliveryTaxRate,
        });

        /*
         * 8. Calculate order totals
         */

        const productGrossAmount = roundMoney(
            calculatedItems.reduce(
                (sum, item) => sum + item.grossAmount,
                0,
            ),
        );

        const productTaxAmount = roundMoney(
            calculatedItems.reduce(
                (sum, item) => sum + item.taxAmount,
                0,
            ),
        );

        const subtotal = productGrossAmount;

        const taxAmount = roundMoney(
            productTaxAmount + deliveryTaxAmount,
        );

        const amountBeforeDiscount = roundMoney(
            subtotal + deliveryGrossAmount,
        );
        const couponResult = dto.couponCode
            ? await this.coupons.validate(dto.couponCode, user.id, amountBeforeDiscount)
            : null;
        const discount = couponResult?.discount ?? 0;

        const total = roundMoney(
            amountBeforeDiscount - discount,
        );

        /*
         * 10. Generate order number
         */

        const orderNumber = await this.generateOrderNumber();
        const deliveryArea = await this.deliveryArea.ensureAvailable({
            street: dto.deliveryStreet,
            streetNumber: dto.deliveryStreetNumber,
            street2: dto.deliveryStreet2,
            postalCode: dto.deliveryPostalCode,
            city: dto.deliveryCity,
            district: dto.deliveryDistrict,
            countryCode: dto.deliveryCountryCode,
        });
        const deliveryCoordinates = deliveryArea.coordinates;

        /*
         * 11. Create the order and item snapshots atomically
         */

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
                    recipientPhone: normalizeOptionalPhoneNumber(dto.recipientPhone),
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
                    deliveryLatitude: deliveryCoordinates.latitude,
                    deliveryLongitude: deliveryCoordinates.longitude,

                    cardMessage: dto.cardMessage,

                    subtotal,
                    taxAmount,
                    deliveryFee,
                    discount,
                    couponCode: couponResult?.code ?? null,
                    ...(couponResult && {
                        coupon: { connect: { id: couponResult.coupon.id } },
                        couponRedemption: {
                            create: {
                                couponId: couponResult.coupon.id,
                                customerId: user.id,
                                discountAmount: couponResult.discount,
                            },
                        },
                    }),
                    total,
                    expectedFloristTotal,

                    status: OrderStatus.PENDING_PAYMENT,

                    items: {
                        create: itemsToCreate,
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
                    ...(dto.recipientPhone !== undefined && {
                        recipientPhone: normalizeOptionalPhoneNumber(dto.recipientPhone),
                    }),
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
