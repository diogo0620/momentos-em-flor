import { EntityName } from '@/common/constants/entities';
import { CrudMessages } from '@/common/messages/crud-messages';

export const ORDER_OFFER_MESSAGES = {
    NOT_FOUND:
        CrudMessages.notFound(
            EntityName.ORDER_OFFER,
        ),

    ORDER_ALREADY_ASSIGNED:
        'This order has already been assigned to another florist.',

    INVALID_STATUS:
        'This offer cannot be processed in its current status.',

    ORDER_NOT_FOUND:
        'Order not found.',

    FLORIST_NOT_FOUND:
        'Florist not found.',

        OFFER_ALREADY_EXISTS:
        'An offer already exists for this order and florist.',

        COMPENSATION_TOO_HIGH:
        'Compensation amount cannot be greater than the order subtotal.',

        COMPENSATION_MUST_BE_POSITIVE:
        'Compensation amount must be greater than zero.',

        COMPENSATION_INVALID:
        'Invalid compensation amount.',

    OFFER_EXPIRED:
        'This offer has expired.',

    DECLINE_REASON_REQUIRED:
        'A decline reason is required.',

    FLORIST_REQUIRED:
        'The authenticated user is not associated with a florist.',
};