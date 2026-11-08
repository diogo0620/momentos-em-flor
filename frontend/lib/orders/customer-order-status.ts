export const customerOrderStatusLabels = {
    PENDING_PAYMENT: "Pagamento pendente",
    RECEIVED: "Encomenda recebida",
    IN_PREPARATION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelada",
} as const;

export type CustomerOrderStatus = keyof typeof customerOrderStatusLabels;

export const customerOrderStatusOptions: Array<{
    value: CustomerOrderStatus;
    label: string;
}> = Object.entries(customerOrderStatusLabels).map(([value, label]) => ({
    value: value as CustomerOrderStatus,
    label,
}));

export function getCustomerOrderStatusLabel(
    status: CustomerOrderStatus,
): string {
    return customerOrderStatusLabels[status];
}
