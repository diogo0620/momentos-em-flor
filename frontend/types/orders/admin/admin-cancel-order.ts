import { AdminOrderCancellationReason } from "./admin-order-status"

export type AdminCancelOrder = {
    cancellationReason: AdminOrderCancellationReason,
    cancellationReasonDetails: string
}