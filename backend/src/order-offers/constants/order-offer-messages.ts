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

    OFFER_EXPIRED:
        'This offer has expired.',

    DECLINE_REASON_REQUIRED:
        'A decline reason is required.',

    FLORIST_REQUIRED:
        'The authenticated user is not associated with a florist.',
};