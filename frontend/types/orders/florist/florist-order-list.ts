import type {
    FloristDeliveryTimeSlot,
    FloristOrderStatus,
} from "./florist-order-status";

export type FloristOrderList = {
    id: number;
    orderNumber: string;
    status: FloristOrderStatus;
    price: number;

    deliveryDate: string;
    deliveryTimeSlot: FloristDeliveryTimeSlot;

    deliveryCity: string;
    deliveryDistrict: string;

    createdAt: Date;
};