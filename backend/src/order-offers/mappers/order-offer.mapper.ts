import { OrderOfferResponseDto } from '../dto/order-offer-response.dto';

export class OrderOfferMapper {
  toResponse(
    offer: any,
  ): OrderOfferResponseDto {
    return {
      id: offer.id,

      orderId: offer.orderId,
      floristId: offer.floristId,

      orderNumber:
        offer.order.orderNumber,

      compensationAmount:
        Number(
          offer.compensationAmount,
        ),

      status:
        offer.status,

      viewedAt:
        offer.viewedAt,

      acceptedAt:
        offer.acceptedAt,

      declinedAt:
        offer.declinedAt,

      expiresAt:
        offer.expiresAt,

      declineReason:
        offer.declineReason,

      items:
        offer.orderOfferItems.map(
          (item: any) => ({
            id: item.id,

            orderItemId:
              item.orderItemId,

            productId:
              item.productId,

            productName:
              item.productName,

            quantity:
              item.quantity,

            unitCompensation:
              Number(
                item.unitCompensation,
              ),

            totalCompensation:
              Number(
                item.totalCompensation,
              ),
          }),
        ),

      createdAt:
        offer.createdAt,

      updatedAt:
        offer.updatedAt,
    };
  }

  toResponses(
    offers: any[],
  ): OrderOfferResponseDto[] {
    return offers.map(
      (offer) =>
        this.toResponse(offer),
    );
  }
}