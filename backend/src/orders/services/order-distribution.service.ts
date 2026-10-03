import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderDistributionService {
    constructor() {}

    /*
     * Finds the florists that are eligible to receive
     * an order based on the delivery location.
     *
     * Temporarily disabled.
     */
    async findEligibleFlorists(
        latitude: number,
        longitude: number,
    ) {
        return [];
    }

    /*
     * Finds the florists eligible for a specific order.
     *
     * Temporarily disabled.
     */
    async findEligibleFloristsForOrder(
        orderId: number,
    ) {
        return [];
    }

    /*
     * Creates an offer for a florist for a specific order.
     *
     * Temporarily disabled.
     */
    async createOffer(
        orderId: number,
        floristId: number,
        manualCompensationAmount?: number,
    ) {
        return null;
    }

    /*
     * Distributes an order to all eligible florists.
     *
     * Temporarily disabled.
     */
    async distributeOrder(
        orderId: number,
    ) {
        return [];
    }
}