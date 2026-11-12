
import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/common/mappers/base.mapper';
import { Order, Prisma } from '@prisma/client';
import { CustomerOrderListResponseDto } from '../dtos/customer-order-list-response.dto';
import { CustomerOrderResponseDto } from '../dtos/customer-order-response.dto';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';
import { toCustomerOrderStatus } from '../customer-order-status';
import { formatOrderItemConfiguration } from '../../order-item-configuration';

type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        items: {
            include: {
                components: true;
            };
        };
        review: { include: { ratings: true } };
        moloniFiscalDocument: { select: { invoiceId: true } };
    };
}>;



@Injectable()
export class CustomerOrdersMapper extends BaseMapper<
    Order,
    CustomerOrderResponseDto,
    CustomerOrderListResponseDto
> {

    constructor(
        private readonly storageService: SupabaseStorageService,
    ) {
        super();
    }


    toDetailResponse(
        order: OrderWithItems,
    ): CustomerOrderResponseDto {
        return {
            id: order.id,
            orderNumber: order.orderNumber,
            customerTaxNumber: order.customerTaxNumber,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            recipientFirstName: order.recipientFirstName,
            recipientLastName: order.recipientLastName,
            recipientPhone: order.recipientPhone,
            occasion: order.occasion,
            deliveryDate: order.deliveryDate,
            deliveryTimeSlot: order.deliveryTimeSlot,
            deliveryInstructions: order.deliveryInstructions,
            deliveryStreet: order.deliveryStreet,
            deliveryStreetNumber: order.deliveryStreetNumber,
            deliveryStreet2: order.deliveryStreet2,
            deliveryPostalCode: order.deliveryPostalCode,
            deliveryCity: order.deliveryCity,
            deliveryDistrict: order.deliveryDistrict,
            deliveryCountryCode: order.deliveryCountryCode,
            cardMessage: order.cardMessage,
            subtotal: Number(order.subtotal),
            taxAmount: Number(order.taxAmount),
            deliveryFee: Number(order.deliveryFee),
            discount: Number(order.discount),
            couponCode: order.couponCode,
            total: Number(order.total),
            status: toCustomerOrderStatus(order.status),
            invoiceAvailable: Boolean(order.moloniFiscalDocument?.invoiceId),
            items: order.items.map((item) => ({
                id: item.id,
                type: item.type,
                productId: item.productId,
                productName: item.name,
                variantName: item.variantName,
                description: formatOrderItemConfiguration(item),
                image: item.imagePath ? this.storageService.getPublicUrl(item.imagePath) : "",

                quantity: item.quantity,

                unitPrice: Number(item.customerPrice),

                netAmount: Number(item.netAmount),
                taxRate: Number(item.taxRate),
                taxAmount: Number(item.taxAmount),
                grossAmount: Number(item.grossAmount),
            })),
            review: order.review ? {
                id: order.review.id,
                comment: order.review.comment,
                averageRating: Number((
                    order.review.ratings.reduce((sum, rating) => sum + rating.rating, 0) /
                    order.review.ratings.length
                ).toFixed(2)),
                ratings: order.review.ratings.map((rating) => ({
                    category: rating.category,
                    rating: rating.rating,
                })),
                createdAt: order.review.createdAt,
            } : null,
            createdAt: order.createdAt,
            cancelledAt: order.cancelledAt,
        }
    }





    protected toListItemResponse(
        order: Order,
    ): CustomerOrderListResponseDto {

        return {
            id: order.id,
            orderNumber: order.orderNumber,
            total: Number(order.total),
            status: toCustomerOrderStatus(order.status),
            createdAt: order.createdAt
        };
    }
}
