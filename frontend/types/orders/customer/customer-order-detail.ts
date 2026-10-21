export type CustomerOrderDetail = {
  id: number;
  orderNumber: string;
  total : number;
  status: CustomerOrderStatus;
  createdAt: Date;
}

export type CustomerOrderStatus =  
    "CREATED" |
  "PENDING_PAYMENT" |
  "WAITING_FOR_FLORISTS" |
  "ASSIGNED" |
  "IN_PRODUCTION" |
  "READY_FOR_DELIVERY" |
  "DELIVERED" |
  "CANCELLED" 