export class OrderOfferAcceptedEvent {
    constructor(
        public readonly orderOfferId: number,
        public readonly orderId: number,
        public readonly floristId: number,
    ) {}
}