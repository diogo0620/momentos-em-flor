export class OrderCreatedEvent {
    constructor(
        public readonly orderId: number,
    ) {}
}