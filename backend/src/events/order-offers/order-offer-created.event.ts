export class OrderOfferCreatedEvent {
  constructor(
    public readonly orderOfferId: number,
  ) {}
}