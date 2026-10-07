import {
    Injectable,
} from '@nestjs/common';

import {
    OrderStatus,
    UserRole,
    OrderItemType
} from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

import { ApiResponse } from '@/common/responses/api-response';
import { Exceptions } from '@/common/exceptions/exceptions';

import { CreateOrderDto } from './dto/create-order.dto';
import { OrderMapper } from './mappers/order.mapper';
import { ORDER_MESSAGES } from './constants/order.messages';
import { OrderQueryDto } from './query/order-query.dto';

import { getPagination } from '@/common/database/pagination';
import { getPaginationResponse } from '@/common/database/pagination-response';

import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';

import { UpdateOrderDto } from './dto/update-order.dto';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '@/events/order/order-created.event';

import { GeocodingService } from '@/geocoding/geocoding.service';
import { log } from 'console';
import { StoreSettingsService } from '@/store-settings/store-settings.service';


@Injectable()
export class OrdersService {

    constructor(
        private readonly prisma: PrismaService,

        private readonly mapper: OrderMapper,

        private readonly storeSettingsService: StoreSettingsService,

        private readonly eventEmitter:
            EventEmitter2,

        private readonly geocodingService:
            GeocodingService,
    ) { }


    // =========================================================
    // LIST
    // =========================================================

    async findAll(
        user: AuthenticatedUser,
        query: OrderQueryDto,
    ) {
        this.validateOrderAccess(user);

        const where = {
            ...(user.role === UserRole.CUSTOMER && {
                customerId: user.id,
            }),

            ...(user.role === UserRole.FLORIST && {
                offers: {
                    some: {
                        floristId:
                            user.floristId!,
                    },
                },
            }),

            ...(query.status && {
                status: query.status,
            }),

            ...(query.customerId &&
                user.role === UserRole.SYSTEM_ADMIN && {
                customerId:
                    query.customerId,
            }),

            ...(query.search && {
                OR: [
                    {
                        orderNumber: {
                            contains:
                                query.search,
                            mode:
                                'insensitive' as const,
                        },
                    },
                    {
                        customerEmail: {
                            contains:
                                query.search,
                            mode:
                                'insensitive' as const,
                        },
                    },
                    {
                        customerFirstName: {
                            contains:
                                query.search,
                            mode:
                                'insensitive' as const,
                        },
                    },
                    {
                        customerLastName: {
                            contains:
                                query.search,
                            mode:
                                'insensitive' as const,
                        },
                    },
                ],
            }),
        };

        const orderBy = query.sort
            ? {
                [query.sort]:
                    query.order,
            }
            : {
                createdAt:
                    'desc' as const,
            };

        const orders =
            await this.prisma.order.findMany({
                where,

                orderBy,

                select: {
                    id: true,
                    orderNumber: true,
                    customerId: true,
                    customerFirstName: true,
                    customerEmail: true,
                    customerPhone: true,

                    deliveryStreet: true,
                    deliveryStreetNumber: true,
                    deliveryStreet2: true,
                    deliveryPostalCode: true,
                    deliveryCity: true,
                    deliveryDistrict: true,
                    deliveryCountryCode: true,

                    total: true,
                    status: true,

                    createdAt: true,
                    deliveryDate: true,
                },

                ...getPagination(
                    query.page,
                    query.pageSize,
                ),
            });

        const total =
            await this.prisma.order.count({
                where,
            });

        return ApiResponse.paginated(
            this.mapper.toListResponses(
                orders,
            ),

            getPaginationResponse(
                query.page,
                query.pageSize,
                total,
            ),
        );
    }


    // =========================================================
    // DETAIL
    // =========================================================

    async findOne(
        user: AuthenticatedUser,
        id: number,
    ) {
        this.validateOrderAccess(user);

        const where = {
            id,

            ...(user.role === UserRole.CUSTOMER && {
                customerId:
                    user.id,
            }),

            ...(user.role === UserRole.FLORIST && {
                offers: {
                    some: {
                        floristId:
                            user.floristId!,
                    },
                },
            }),
        };

        const order =
            await this.prisma.order.findFirst({
                where,

                include: {
                    items: {
                        include: {
                            components: true
                        }
                    },

                    offers: {
                        include: {
                            florist: true,
                        },
                    },

                    statusHistory: true
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        return ApiResponse.success(
            this.mapper.toResponse(
                order,
            ),
        );
    }


    // =========================================================
    // CREATE
    // =========================================================

    async create(
        user: AuthenticatedUser,
        dto: CreateOrderDto,
    ) {
        /*
         * For now, only authenticated
         * customers can create orders.
         */
        const customer =
            await this.validateOrderCreationUser(
                user,
            );

        /*
         * Validate order items.
         */
        this.validateItems(
            dto,
        );

        /*
         * Load all products used by
         * the order.
         */
        const products =
            await this.loadOrderProducts(
                dto,
            );

        /*
         * Build OrderItem snapshots.
         *
         * Prices always come from the
         * product stored in the database.
         */
        const items =
            this.buildOrderItems(
                dto,
                products,
            );

        /*
         * Calculate order totals.
         */
        const totals =
            await this.calculateOrderTotals(
                items,
            );

        if (totals.deliveryItem) {
            items.push(totals.deliveryItem);
        }

        /*
         * Geocode delivery address.
         */
        const coordinates =
            await this.geocodeDeliveryAddress(
                dto,
            );

        /*
         * Generate unique order number.
         */
        const orderNumber =
            await this.generateOrderNumber();

        /*
         * Create order and items
         * atomically.
         */
        const order =
            await this.prisma.$transaction(
                async (tx) => {
                    return tx.order.create({
                        data: {
                            orderNumber,

                            /*
                             * Customer information always
                             * comes from the authenticated
                             * customer.
                             */
                            customerId:
                                customer.id,

                            customerFirstName:
                                customer.firstName,

                            customerLastName:
                                customer.lastName,

                            customerEmail:
                                customer.email,

                            customerPhone:
                                customer.phone,

                            customerTaxNumber:
                                dto.customerTaxNumber,

                            recipientFirstName:
                                dto.recipientFirstName,

                            recipientLastName:
                                dto.recipientLastName,

                            recipientPhone:
                                dto.recipientPhone,

                            occasion:
                                dto.occasion,

                            deliveryDate:
                                new Date(
                                    dto.deliveryDate,
                                ),

                            deliveryTimeSlot:
                                dto.deliveryTimeSlot,

                            deliveryInstructions:
                                dto.deliveryInstructions,

                            deliveryStreet:
                                dto.deliveryStreet,

                            deliveryStreetNumber:
                                dto.deliveryStreetNumber,

                            deliveryStreet2:
                                dto.deliveryStreet2,

                            deliveryPostalCode:
                                dto.deliveryPostalCode,

                            deliveryCity:
                                dto.deliveryCity,

                            deliveryDistrict:
                                dto.deliveryDistrict,

                            deliveryCountryCode:
                                dto.deliveryCountryCode
                                    .toUpperCase(),

                            deliveryLatitude:
                                coordinates.latitude,

                            deliveryLongitude:
                                coordinates.longitude,

                            cardMessage:
                                dto.cardMessage,

                            subtotal:
                                totals.subtotal,

                            taxAmount:
                                totals.taxAmount,

                            deliveryFee:
                                totals.deliveryFee,

                            discount:
                                0,

                            total:
                                totals.total,

                            status:
                                OrderStatus.PENDING_PAYMENT,

                            items: {
                                create:
                                    items,
                            },
                        },
                    });
                },
            );

        /*
         * Notify listeners.
         *
         * Order distribution is handled
         * asynchronously.
         */
        /*
        this.eventEmitter.emit(
            'order.created',

            new OrderCreatedEvent(
                order.id,
            ),
        );
        */

        return ApiResponse.success(
            this.mapper.toCreateResponse(
                order,
            ),
        );
    }


    // =========================================================
    // CREATE - VALIDATION
    // =========================================================

    private async validateOrderCreationUser(
        user: AuthenticatedUser,
    ) {
        if (!user) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        if (
            user.role !==
            UserRole.CUSTOMER
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        const customer =
            await this.prisma.user.findFirst({
                where: {
                    id: user.id,

                    role:
                        UserRole.CUSTOMER,

                    active: true,
                },
            });

        if (!customer) {
            Exceptions.notFound(
                ORDER_MESSAGES
                    .CUSTOMER_NOT_FOUND,
            );
        }

        return customer;
    }


    private validateOrderAccess(
        user: AuthenticatedUser,
    ): void {
        if (
            user.role !==
            UserRole.SYSTEM_ADMIN &&
            user.role !==
            UserRole.CUSTOMER &&
            user.role !==
            UserRole.FLORIST
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }

        if (
            user.role ===
            UserRole.FLORIST &&
            !user.floristId
        ) {
            Exceptions.forbidden(
                ORDER_MESSAGES.FORBIDDEN,
            );
        }
    }


    private validateItems(
        dto: CreateOrderDto,
    ): void {
        if (
            !dto.items ||
            dto.items.length === 0
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES.EMPTY_ORDER,
            );
        }

        const productIds =
            dto.items.map(
                (item) =>
                    item.productId,
            );

        /*
         * The same product should not
         * appear multiple times.
         *
         * Quantity should be used instead.
         */
        if (
            new Set(productIds).size !==
            productIds.length
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES
                    .DUPLICATE_PRODUCTS,
            );
        }

        /*
         * Quantity is already validated
         * by the DTO, but keep the service
         * validation here as a business rule.
         */
        for (
            const item of dto.items
        ) {
            if (
                !Number.isInteger(
                    item.quantity,
                ) ||
                item.quantity <= 0
            ) {
                Exceptions.badRequest(
                    'A quantidade do produto deve ser superior a zero.',
                );
            }
        }
    }


    // =========================================================
    // CREATE - PRODUCTS
    // =========================================================

    private async loadOrderProducts(
        dto: CreateOrderDto,
    ) {
        const productIds =
            dto.items.map(
                (item) => item.productId,
            );

        const products =
            await this.prisma.product.findMany({
                where: {
                    id: {
                        in: productIds,
                    },
                    active: true,
                },
                include: {
                    taxCode: true,
                    variants: {
                        where: {
                            active: true,
                        },
                    },
                    components: {
                        where: {
                            active: true,
                        },
                    },
                },
            });

        if (
            products.length !==
            productIds.length
        ) {
            Exceptions.badRequest(
                ORDER_MESSAGES.PRODUCT_NOT_AVAILABLE,
            );
        }

        return new Map(
            products.map(
                (product) => [
                    product.id,
                    product,
                ],
            ),
        );
    }


    // =========================================================
    // CREATE - ORDER ITEMS
    // =========================================================

    private buildOrderItems(
        dto: CreateOrderDto,
        products: Map<number, any>,
    ) {
        return dto.items.map((item) => {
            const product = products.get(item.productId);

            if (!product) {
                Exceptions.badRequest(
                    ORDER_MESSAGES.PRODUCT_NOT_AVAILABLE,
                );
            }

            return this.buildOrderItem(
                product,
                item,
            );
        });
    }


    private buildOrderItem(
        product: any,
        item: CreateOrderDto['items'][number],
    ) {
        const quantity = item.quantity;

        const hasVariants = product.variants.length > 0;
        const hasComponents = product.components.length > 0;

        let selectedVariant: any = null;
        let selectedComponents: any[] = [];

        /*
         * A product with variants requires
         * exactly one selected variant.
         */
        if (hasVariants) {
            if (
                item.variantId == null ||
                item.components?.length
            ) {
                Exceptions.badRequest(
                    'Select a variant for this product.',
                );
            }

            selectedVariant =
                product.variants.find(
                    (variant) =>
                        variant.id === item.variantId,
                );

            if (!selectedVariant) {
                Exceptions.badRequest(
                    'The selected variant is not available for this product.',
                );
            }
        } else if (item.variantId != null) {
            Exceptions.badRequest(
                'This product does not have variants.',
            );
        }

        /*
         * Products with components require
         * a valid selection for each component.
         */
        if (hasComponents) {
            if (
                !item.components ||
                item.components.length !==
                product.components.length
            ) {
                Exceptions.badRequest(
                    'Select all components for this product.',
                );
            }

            const selectedIds =
                item.components.map(
                    (component) => component.componentId,
                );

            if (
                new Set(selectedIds).size !==
                selectedIds.length
            ) {
                Exceptions.badRequest(
                    'A component cannot be selected more than once.',
                );
            }

            selectedComponents =
                item.components.map((selection) => {
                    const component =
                        product.components.find(
                            (entry) =>
                                entry.id === selection.componentId,
                        );

                    if (!component) {
                        Exceptions.badRequest(
                            'A selected component is not available for this product.',
                        );
                    }

                    if (
                        !Number.isInteger(selection.quantity) ||
                        selection.quantity < component.minQuantity ||
                        selection.quantity > component.maxQuantity
                    ) {
                        Exceptions.badRequest(
                            `The quantity for component "${component.name}" must be between ${component.minQuantity} and ${component.maxQuantity}.`,
                        );
                    }

                    return {
                        component,
                        quantity: selection.quantity,
                    };
                });
        } else if (item.components?.length) {
            Exceptions.badRequest(
                'This product does not have components.',
            );
        }

        /*
         * Variant prices are final unit prices.
         * For components, the product price includes
         * the minimum quantity of each component.
         * Additional quantities are charged separately.
         */
        let unitCustomerPrice =
            selectedVariant
                ? Number(selectedVariant.customerPrice)
                : Number(product.customerPrice);

        let unitFloristPrice =
            selectedVariant
                ? Number(selectedVariant.floristPrice)
                : Number(product.floristPrice);

        const componentSnapshots =
            selectedComponents.map(
                ({ component, quantity: selectedQuantity }) => {
                    const additionalUnits =
                        Math.max(
                            0,
                            selectedQuantity - component.minQuantity,
                        );

                    const customerPricePerAdditionalUnit =
                        Number(
                            component.customerPricePerAdditionalUnit,
                        );

                    const floristPricePerAdditionalUnit =
                        Number(
                            component.floristPricePerAdditionalUnit,
                        );

                    const customerAdditionalPrice =
                        this.roundMoney(
                            additionalUnits *
                            customerPricePerAdditionalUnit,
                        );

                    unitCustomerPrice +=
                        customerAdditionalPrice;

                    unitFloristPrice +=
                        additionalUnits *
                        floristPricePerAdditionalUnit;

                    return {
                        componentId: component.id,
                        componentName: component.name,
                        quantity: selectedQuantity,
                        additionalUnits,
                        customerPricePerAdditionalUnit,
                        customerTotalPrice:
                            this.roundMoney(
                                customerAdditionalPrice * quantity,
                            ),
                    };
                },
            );

        unitCustomerPrice =
            this.roundMoney(unitCustomerPrice);

        unitFloristPrice =
            this.roundMoney(unitFloristPrice);

        /*
         * customerPrice includes VAT.
         */
        const taxRate =
            Number(product.taxCode.rate);

        const grossAmount =
            this.roundMoney(
                unitCustomerPrice * quantity,
            );

        const netAmount =
            this.roundMoney(
                grossAmount / (1 + taxRate / 100),
            );

        const taxAmount =
            this.roundMoney(
                grossAmount - netAmount,
            );

        return {
            productId: product.id,
            name: product.name,
            description: product.description,
            quantity,

            customerPrice: unitCustomerPrice,
            floristPrice: unitFloristPrice,

            netAmount,
            taxRate,
            taxAmount,
            grossAmount,

            taxCodeId: product.taxCodeId,

            ...(selectedVariant && {
                variantId: selectedVariant.id,
                variantType: selectedVariant.type,
                variantName: selectedVariant.name,
            }),

            ...(componentSnapshots.length > 0 && {
                components: {
                    create: componentSnapshots,
                },
            }),
        };
    }



    // =========================================================
    // CREATE - TOTALS
    // =========================================================

    private async calculateOrderTotals(
        items: Array<{
            taxCodeId: number;
            taxRate: number;
            netAmount: number;
            taxAmount: number;
            grossAmount: number;
        }>,
    ) {
        const settings = await this.storeSettingsService.get();

        const deliveryFee = this.roundMoney(
            Number(settings.data.deliveryFee ?? 0),
        );

        const discount = 0;

        //
        // Product totals
        //

        const subtotal = this.roundMoney(
            items.reduce(
                (total, item) => total + item.netAmount,
                0,
            ),
        );

        const productsTaxAmount = this.roundMoney(
            items.reduce(
                (total, item) => total + item.taxAmount,
                0,
            ),
        );

        //
        // Allocate delivery fee across tax codes
        //

        const deliveryTaxAllocation =
            this.calculateDeliveryTaxAllocation(
                items,
                deliveryFee,
            );

        const deliveryNetAmount = this.roundMoney(
            deliveryTaxAllocation.reduce(
                (total, item) => total + item.netAmount,
                0,
            ),
        );

        const deliveryTaxAmount = this.roundMoney(
            deliveryTaxAllocation.reduce(
                (total, item) => total + item.taxAmount,
                0,
            ),
        );

        //
        // Final totals
        //

        const finalSubtotal = this.roundMoney(
            subtotal + deliveryNetAmount,
        );

        const taxAmount = this.roundMoney(
            productsTaxAmount + deliveryTaxAmount,
        );

        const total = this.roundMoney(
            finalSubtotal +
            taxAmount -
            discount,
        );

        //
        // Tax totals by tax code
        //

        const taxTotalsMap = new Map<
            number,
            {
                taxCodeId: number;
                taxRate: number;
                netAmount: number;
                taxAmount: number;
                grossAmount: number;
            }
        >();

        for (const item of items) {
            const existing = taxTotalsMap.get(
                item.taxCodeId,
            );

            if (existing) {
                existing.netAmount = this.roundMoney(
                    existing.netAmount + item.netAmount,
                );

                existing.taxAmount = this.roundMoney(
                    existing.taxAmount + item.taxAmount,
                );

                existing.grossAmount = this.roundMoney(
                    existing.grossAmount + item.grossAmount,
                );
            } else {
                taxTotalsMap.set(item.taxCodeId, {
                    taxCodeId: item.taxCodeId,
                    taxRate: item.taxRate,
                    netAmount: item.netAmount,
                    taxAmount: item.taxAmount,
                    grossAmount: item.grossAmount,
                });
            }
        }

        //
        // Add delivery amounts to the corresponding tax codes
        //

        for (const delivery of deliveryTaxAllocation) {
            const existing = taxTotalsMap.get(
                delivery.taxCodeId,
            );

            if (!existing) {
                continue;
            }

            existing.netAmount = this.roundMoney(
                existing.netAmount +
                delivery.netAmount,
            );

            existing.taxAmount = this.roundMoney(
                existing.taxAmount +
                delivery.taxAmount,
            );

            existing.grossAmount = this.roundMoney(
                existing.grossAmount +
                delivery.grossAmount,
            );
        }

        const deliveryItem =
            deliveryFee > 0
                ? {
                    type: OrderItemType.DELIVERY_FEE,
                    productId: null,

                    name: 'Taxa de Entrega',
                    description: 'Taxa de Entrega',

                    quantity: 1,

                    customerPrice: deliveryFee,
                    floristPrice: 0,

                    netAmount: deliveryNetAmount,
                    taxAmount: deliveryTaxAmount,
                    grossAmount: deliveryFee,

                    taxCodeId: null,
                    taxRate: null,
                }
                : null;

        return {
            subtotal,
            taxAmount,
            deliveryFee,
            discount,
            total,

            taxTotals: Array.from(
                taxTotalsMap.values(),
            ),

            deliveryItem,
        };
    }


    // =========================================================
    // CREATE - DELIVERY
    // =========================================================

    private async geocodeDeliveryAddress(
        dto: CreateOrderDto,
    ) {
        return this.geocodingService
            .geocodeAddress({
                street:
                    dto.deliveryStreet,

                street2:
                    dto.deliveryStreet2,

                postalCode:
                    dto.deliveryPostalCode,

                city:
                    dto.deliveryCity,

                district:
                    dto.deliveryDistrict,

                countryCode:
                    dto.deliveryCountryCode,
            });
    }


    // =========================================================
    // UPDATE
    // =========================================================

    async update(
        id: number,
        dto: UpdateOrderDto,
    ) {
        const existingOrder =
            await this.prisma.order.findFirst({
                where: {
                    id,
                },
            });

        if (!existingOrder) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        const addressChanged =
            dto.deliveryStreet !==
            undefined ||
            dto.deliveryStreet2 !==
            undefined ||
            dto.deliveryPostalCode !==
            undefined ||
            dto.deliveryCity !==
            undefined ||
            dto.deliveryDistrict !==
            undefined ||
            dto.deliveryCountryCode !==
            undefined;

        let coordinates:
            | {
                latitude: number;
                longitude: number;
            }
            | undefined;

        if (addressChanged) {
            coordinates =
                await this.geocodingService
                    .geocodeAddress({
                        street:
                            dto.deliveryStreet ??
                            existingOrder
                                .deliveryStreet,

                        street2:
                            dto.deliveryStreet2 ??
                            existingOrder
                                .deliveryStreet2,

                        postalCode:
                            dto.deliveryPostalCode ??
                            existingOrder
                                .deliveryPostalCode,

                        city:
                            dto.deliveryCity ??
                            existingOrder
                                .deliveryCity,

                        district:
                            dto.deliveryDistrict ??
                            existingOrder
                                .deliveryDistrict,

                        countryCode:
                            (
                                dto.deliveryCountryCode ??
                                existingOrder
                                    .deliveryCountryCode
                            ).toUpperCase(),
                    });
        }

        const order =
            await this.prisma.order.update({
                where: {
                    id,
                },

                data: {
                    ...(dto.recipientFirstName !==
                        undefined && {
                        recipientFirstName:
                            dto.recipientFirstName,
                    }),

                    ...(dto.recipientLastName !==
                        undefined && {
                        recipientLastName:
                            dto.recipientLastName,
                    }),

                    ...(dto.recipientPhone !==
                        undefined && {
                        recipientPhone:
                            dto.recipientPhone,
                    }),

                    ...(dto.occasion !==
                        undefined && {
                        occasion:
                            dto.occasion,
                    }),

                    ...(dto.deliveryDate !==
                        undefined && {
                        deliveryDate:
                            new Date(
                                dto.deliveryDate,
                            ),
                    }),

                    ...(dto.deliveryTimeSlot !==
                        undefined && {
                        deliveryTimeSlot:
                            dto.deliveryTimeSlot,
                    }),

                    ...(dto.deliveryInstructions !==
                        undefined && {
                        deliveryInstructions:
                            dto.deliveryInstructions,
                    }),

                    ...(dto.deliveryStreet !==
                        undefined && {
                        deliveryStreet:
                            dto.deliveryStreet,
                    }),

                    ...(dto.deliveryStreet2 !==
                        undefined && {
                        deliveryStreet2:
                            dto.deliveryStreet2,
                    }),

                    ...(dto.deliveryPostalCode !==
                        undefined && {
                        deliveryPostalCode:
                            dto.deliveryPostalCode,
                    }),

                    ...(dto.deliveryCity !==
                        undefined && {
                        deliveryCity:
                            dto.deliveryCity,
                    }),

                    ...(dto.deliveryDistrict !==
                        undefined && {
                        deliveryDistrict:
                            dto.deliveryDistrict,
                    }),

                    ...(dto.deliveryCountryCode !==
                        undefined && {
                        deliveryCountryCode:
                            dto.deliveryCountryCode
                                .toUpperCase(),
                    }),

                    ...(coordinates && {
                        deliveryLatitude:
                            coordinates.latitude,

                        deliveryLongitude:
                            coordinates.longitude,
                    }),

                    ...(dto.cardMessage !==
                        undefined && {
                        cardMessage:
                            dto.cardMessage,
                    }),
                },

                include: {
                    items: true
                },
            });

        return ApiResponse.success(
            this.mapper.toResponse(
                order,
            ),
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    async remove(
        id: number,
    ) {
        const order =
            await this.prisma.order.findFirst({
                where: {
                    id,
                },
            });

        if (!order) {
            Exceptions.notFound(
                ORDER_MESSAGES.NOT_FOUND,
            );
        }

        await this.prisma.order.delete({
            where: {
                id,
            },
        });

        return ApiResponse.success({
            message:
                ORDER_MESSAGES.DELETED,
        });
    }


    // =========================================================
    // FLORIST DISTRIBUTION
    // =========================================================

    async findEligibleFloristsForOrder(
        orderId: number,
    ) {
        /*
         * Distribution is triggered through
         * the order.created event.
         *
         * Kept as a thin wrapper for now.
         */
        return [];
    }


    // =========================================================
    // HELPERS
    // =========================================================


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