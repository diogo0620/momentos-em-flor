import { AdminOrderStatus } from "./admin-order-status";


export type AdminOrderList = {
    id: number;
    orderNumber: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    deliveryCity: string;
    deliveryDistrict: string;
    total: number;
    status: AdminOrderStatus;
    createdAt: string;
};
